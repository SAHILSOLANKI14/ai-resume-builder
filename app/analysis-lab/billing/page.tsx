import ClientPage from "./client-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing",
  description: "Manage your ResuAI subscription and credit limits.",
};

export default function BillingPage() {
  return <ClientPage />;
}
