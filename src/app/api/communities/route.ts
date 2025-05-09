import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createCommunitySchema = z.object({
  name: z.string().min(3).max(21).regex(/^[a-zA-Z0-9_]+$/),
  description: z.string().max(300).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, description } = createCommunitySchema.parse(body);

    // Check if community already exists
    const existingCommunity = await db.community.findUnique({
      where: {
        name,
      },
    });

    if (existingCommunity) {
      return NextResponse.json(
        { message: "Community already exists" },
        { status: 400 }
      );
    }

    // Create community
    const community = await db.community.create({
      data: {
        name,
        description,
        creatorId: session.user.id,
      },
    });

    // Add creator as a member
    await db.community.update({
      where: {
        id: community.id,
      },
      data: {
        members: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });

    return NextResponse.json({ community }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const communities = await db.community.findMany({
      take: limit,
      skip,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });

    const total = await db.community.count();

    return NextResponse.json({
      communities,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 