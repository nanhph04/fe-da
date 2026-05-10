import { VerifyOTPForm } from "@/features/auth/components/VerifyOTPForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Xác thực OTP | Velvet Gallery",
  description: "Xác thực tài khoản Velvet Gallery của bạn.",
};

export default function VerifyOTPPage() {
  return <VerifyOTPForm />;
}
