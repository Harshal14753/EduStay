import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userType = (session.user as any)?.userType;
    if (userType !== "STUDENT") {
      return NextResponse.json({ error: "Only students can view this data" }, { status: 403 });
    }

    const studentId = (session.user as any)?.id as string;

    const baseQuery = {
      where: { studentId },
      orderBy: {
        createdAt: "desc" as const,
      },
    };

    let inquiries;
    try {
      inquiries = await prisma.inquiry.findMany({
        ...baseQuery,
        select: {
          id: true,
          message: true,
          status: true,
          response: true,
          createdAt: true,
          updatedAt: true,
          inquiryMessages: {
            select: {
              id: true,
              sender: true,
              message: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
          accommodationListing: {
            select: {
              id: true,
              propertyName: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          foodServiceListing: {
            select: {
              id: true,
              serviceName: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    } catch (queryError) {
      const message = queryError instanceof Error ? queryError.message : "";
      const isOutdatedClient =
        queryError instanceof Prisma.PrismaClientValidationError ||
        message.includes("Unknown arg `inquiryMessages`") ||
        message.includes("Unknown field `inquiryMessages`");

      if (!isOutdatedClient) {
        throw queryError;
      }

      // Backward compatibility while Prisma Client regeneration/migration is pending.
      const fallback = await prisma.inquiry.findMany({
        ...baseQuery,
        select: {
          id: true,
          message: true,
          status: true,
          response: true,
          createdAt: true,
          updatedAt: true,
          accommodationListing: {
            select: {
              id: true,
              propertyName: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          foodServiceListing: {
            select: {
              id: true,
              serviceName: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      inquiries = fallback.map((inquiry) => ({
        ...inquiry,
        inquiryMessages: [],
      }));
    }

    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error("Error fetching student inquiries:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
