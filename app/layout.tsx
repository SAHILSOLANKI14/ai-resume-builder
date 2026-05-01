import "./globals.css";
import Providers from "./providers";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "ResuAI — AI Resume Analyzer",
    template: "%s | ResuAI",
  },
  description:
    "Get instant AI feedback on how well your resume matches any job description. Improve your fit and land more interviews.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}