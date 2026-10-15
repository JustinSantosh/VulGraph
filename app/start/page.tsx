import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Activate } from "./activate";

export default async function StartPage() {
  const { orgId } = await auth.protect();
  if (orgId) redirect("/");

  return (
    <div className="flex flex-1 items-center justify-center">
      <Activate />
    </div>
  );
}
