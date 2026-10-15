import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth-screen";

export default async function SignInPage() {
  const { userId, orgId } = await auth();
  if (userId) redirect(orgId ? "/" : "/start");

  return (
    <div className="flex flex-1 items-center justify-center">
      <AuthScreen mode="sign-in" />
    </div>
  );
}
