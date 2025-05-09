import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createPostSchema = z.object({
  title: z.string().min(3).max(300),
  content: z.string().min(1).max(40000),
  communityName: z.string(),
  isAnonymous: z.boolean().optional(),
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
    const { title, content, communityName, isAnonymous } =
      createPostSchema.parse(body);

    // Check if community exists
    const community = await db.community.findUnique({
      where: {
        name: communityName,
      },
    });

    if (!community) {
      return NextResponse.json(
        { message: "Community not found" },
        { status: 404 }
      );
    }

    // Create post
    const post = await db.post.create({
      data: {
        title,
        content,
        communityId: community.id,
        authorId: isAnonymous ? null : session.user.id,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
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
    const communityName = searchParams.get("community");

    const where = communityName
      ? {
          community: {
            name: communityName,
          },
        }
      : {};

    const posts = await db.post.findMany({
      where,
      take: limit,
      skip,
      include: {
        author: true,
        community: true,
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await db.post.count({ where });

    return NextResponse.json({
      posts,
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