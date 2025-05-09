import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const voteSchema = z.object({
  value: z.number().min(-1).max(1),
  postId: z.string().optional(),
  commentId: z.string().optional(),
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
    const { value, postId, commentId } = voteSchema.parse(body);

    if (!postId && !commentId) {
      return NextResponse.json(
        { message: "Either postId or commentId is required" },
        { status: 400 }
      );
    }

    // Check if vote already exists
    const existingVote = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        ...(postId ? { postId } : { commentId }),
      },
    });

    if (existingVote) {
      // If vote value is the same, remove the vote
      if (existingVote.value === value) {
        await db.vote.delete({
          where: {
            id: existingVote.id,
          },
        });
        return NextResponse.json({ message: "Vote removed" });
      }

      // Update existing vote
      const vote = await db.vote.update({
        where: {
          id: existingVote.id,
        },
        data: {
          value,
        },
      });

      return NextResponse.json({ vote });
    }

    // Create new vote
    const vote = await db.vote.create({
      data: {
        value,
        userId: session.user.id,
        ...(postId ? { postId } : { commentId }),
      },
    });

    return NextResponse.json({ vote }, { status: 201 });
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