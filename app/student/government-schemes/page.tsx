import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import SchemesClient from "./schemes-client";

export default async function GovernmentSchemesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const userType = (session.user as any)?.userType;
  if (userType !== "STUDENT") {
    redirect("/owner/dashboard");
  }

  const userId = (session.user as any)?.id as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      university: true,
      stream: true
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Government Schemes</h1>
          <p className="text-gray-600 mt-1">
            Check scheme-wise eligibility as per your student details and support requirements.
          </p>
        </div>

        <SchemesClient
          userBasics={{
            university: user?.university ?? null,
            stream: user?.stream ?? null
          }}
        />
      </main>
    </div>
  );
}
