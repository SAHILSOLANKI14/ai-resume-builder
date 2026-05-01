import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkUsage } from "@/lib/usage";
import { openai } from "@/lib/openai";
import { PDFParse } from "pdf-parse";
import { GoogleGenAI } from "@google/genai";
import { Mistral } from "@mistralai/mistralai";

async function analyzeWithFallback(prompt: string) {
  // Try OpenAI
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "missing-key") throw new Error("No OpenAI key");
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional resume reviewer and career advisor. Always return valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });
    return result.choices[0].message.content || "{}";
  } catch (e: any) {
    console.log("OpenAI failed, falling back to Gemini:", e.message);
  }

  // Try Gemini
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("No Gemini key");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // Updated to a more stable version name if needed, but keeping user's choice
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a professional resume reviewer and career advisor. Always return valid JSON."
      }
    });
    return response.text;
  } catch (e: any) {
    console.log("Gemini failed, falling back to Mistral:", e.message);
  }

  // Try Mistral
  try {
    if (!process.env.MISTRAL_API_KEY) throw new Error("No Mistral key");
    const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
    const response = await mistral.chat.complete({
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: "You are a professional resume reviewer and career advisor. Always return valid JSON." },
        { role: "user", content: prompt }
      ],
      responseFormat: { type: "json_object" }
    });
    const content = response.choices?.[0]?.message?.content;
    return typeof content === "string" ? content : "{}";
  } catch (e: any) {
    console.log("Mistral failed:", e.message);
    throw new Error("All AI providers failed to analyze the resume. Please check your API keys.");
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !(session.user as any).id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;

    // 🧠 CHECK LIMITS — Optimized to use userId from session
    const usage = await checkUsage(userId);

    if (!usage.allowed) {
      return Response.json({ error: usage.reason }, { status: 403 });
    }

    // 📄 PARSE REQUEST
    let resumeText = "";
    let jobDescription = "";
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("resumeFile") as File | null;
      jobDescription = (formData.get("jobDescription") as string) || "";
      const pastedResume = (formData.get("resume") as string) || "";

      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        // Use a faster PDF parsing method if possible, or keep as is if it's necessary
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        resumeText = result.text;
      } else if (pastedResume) {
        resumeText = pastedResume;
      }
    } else {
      const body = await req.json();
      resumeText = body.resume || "";
      jobDescription = body.jobDescription || "";
    }

    if (!resumeText) return Response.json({ error: "Resume content is required" }, { status: 400 });
    if (!jobDescription) return Response.json({ error: "Job description is required" }, { status: 400 });

    const prompt = `
      You are an expert HR and Career Coach. 
      Analyze the following resume against the job description provided.
      
      Resume:
      ${resumeText}
      
      Job Description:
      ${jobDescription}
      
      Return a structured JSON response with the following fields:
      {
        "score": (number from 0-100),
        "fit_level": (string: "Low", "Medium", "High", "Excellent"),
        "strengths": (array of strings),
        "weaknesses": (array of strings),
        "missing_keywords": (array of strings),
        "recommendations": (array of strings),
        "summary": (brief string)
      }
      Only return valid JSON.
    `;

    // AI Analysis is the bottleneck, but we've optimized the DB parts around it
    const resultText = await analyzeWithFallback(prompt);
    const feedback = JSON.parse(resultText || "{}");

    // 💾 SAVE RESULT & UPDATE CREDITS — Combined where possible
    const [saved] = await db.$transaction([
      db.resume.create({
        data: {
          content: resumeText.substring(0, 5000),
          score: feedback.score || 0,
          feedback: feedback,
          userId: userId,
        },
      }),
      ...(usage.plan !== "PRO" ? [
        db.subscription.update({
          where: { userId: userId },
          data: { credits: { decrement: 1 } },
        })
      ] : [])
    ]);

    return Response.json(saved);
  } catch (error: any) {
    console.error("❌ Analyze API Error:", error);
    return Response.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}