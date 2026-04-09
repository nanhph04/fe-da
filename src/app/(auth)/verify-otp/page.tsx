import { VerifyOTPForm } from "@/features/auth/components/VerifyOTPForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify OTP | Velvet Gallery",
  description: "Verify your Velvet Gallery account.",
};

export default function VerifyOTPPage() {
  return <VerifyOTPForm />;
}
