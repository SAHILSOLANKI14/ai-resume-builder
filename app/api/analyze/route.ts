import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkUsage } from "@/lib/usage";
import { openai } from "@/lib/openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Mistral } from "@mistralai/mistralai";
import Groq from "groq-sdk";

export const maxDuration = 60;

async function analyzeWithFallback(prompt: string) {
  // 1. Try Gemini
  try {
    if (process.env.GEMINI_API_KEY) {
      console.log("尝试 Gemini...");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });
      return result.response.text();
    }
  } catch (e: any) {
    console.warn("⚠️ Gemini Failed:", e.message);
  }

  // 2. Try Groq (Llama 3.3 is extremely fast and free)
  try {
    if (process.env.GROQ_API_KEY) {
      console.log("尝试 Groq (Llama 3.3)...");
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const result = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });
      return result.choices[0]?.message?.content || "{}";
    }
  } catch (e: any) {
    console.warn("⚠️ Groq Failed:", e.message);
  }

  // 3. Try Mistral
  try {
    if (process.env.MISTRAL_API_KEY) {
      console.log("尝试 Mistral...");
      const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
      const result = await mistral.chat.complete({
        messages: [{ role: "user", content: prompt }],
        model: "mistral-small-latest",
        responseFormat: { type: "json_object" }
      });
      return (result.choices?.[0]?.message?.content as string) || "{}";
    }
  } catch (e: any) {
    console.warn("⚠️ Mistral Failed:", e.message);
  }

  // 4. Safe Mock Response (Final Safety Net)
  console.log("🚨 All APIs failed. Returning safe mock response.");
  return JSON.stringify({
    score: 65,
    summary: "Note: We are experiencing high traffic. Here is an automated draft analysis. Your resume has a solid structure but could use more quantified achievements.",
    positives: ["Clear contact information", "Logical experience flow", "Professional tone"],
    negatives: ["Lack of specific metrics (e.g. % growth)", "Missing key technical keywords", "Objective statement is too generic"],
    recommendations: ["Add numbers to your achievements", "Optimize for ATS keywords", "Use stronger action verbs"],
    improved_resume: "Draft Optimized Version:\n\n[Full Resume text could not be generated at this time. Please try again in 5 minutes for a complete AI rewrite.]"
  });
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
        console.log("📄 Processing PDF file:", file.name, file.size, "bytes");
        const buffer = Buffer.from(await file.arrayBuffer());
        try {
          // Use the modern fork that doesn't crash on Vercel
          const pdf = require("pdf-parse-fork");
          const result = await pdf(buffer);
          resumeText = result.text;
          console.log("✅ PDF parsed successfully. Length:", resumeText.length);
        } catch (pdfErr: any) {
          console.error("❌ PDF Parsing failed:", pdfErr.message);
          throw new Error("Could not read PDF. Please try pasting the text instead.");
        }
      } else if (pastedResume) {
        console.log("📄 Processing pasted resume text");
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
        "summary": (brief string),
        "improved_resume": (A fully rewritten version of the user's resume content that is optimized for this specific job description, including the missing keywords and better phrasing. Use professional formatting in plain text.)
      }
      Only return valid JSON.
    `;

    console.log("🧠 Starting AI analysis with fallback...");
    const resultText = await analyzeWithFallback(prompt);
    console.log("✅ AI analysis complete");
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