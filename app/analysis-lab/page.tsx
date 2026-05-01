import ClientPage from "./client-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analysis Lab",
  description: "Analyze your resume with AI and manage your career profile.",
};

export default function DashboardPage() {
  return <ClientPage />;
}
