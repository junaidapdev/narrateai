import type { Metadata } from "next"
import { SignInForm } from "@/components/auth/sign-in-form"

export const metadata: Metadata = {
  title: "Sign In | AudioBrand",
  description: "Sign in to your AudioBrand account",
}

export default function SignInPage() {
  return <SignInForm />
}
