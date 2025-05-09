import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import CommentSection from "@/components/CommentSection";
import type { Post, Community } from "@/generated/prisma";

type PostPageProps = {
  params: Promise<{
    name: string;
    id: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PostPage({ params, searchParams }: PostPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);
  const post = await db.post.findUnique({
    where: {
      id: resolvedParams.id,
    },
    include: {
      author: true,
      community: {
        include: {
          _count: {
            select: {
              members: true,
              posts: true,
            },
          },
        },
      },
      comments: {
        include: {
          author: true,
          votes: true,
          _count: {
            select: {
              votes: true,
            },
          },
        },
      },
      votes: true,
      _count: {
        select: {
          votes: true,
          comments: true,
        },
      },
    },
  });

  if (!post || post.community.name !== resolvedParams.name) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Link href={`/r/${post.community.name}`}>
                r/{post.community.name}
              </Link>
              <span className="mx-2">•</span>
              <span>
                Posted by {post.author?.name || "Anonymous"}{" "}
                {new Date(post.createdAt).toLocaleString()}
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
            <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Comments</h2>
            <CommentSection
              postId={post.id}
              initialComments={post.comments}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">About Community</h2>
            <p className="text-gray-600 mb-4">{post.community.description}</p>
            <div className="border-t pt-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Members</span>
                <span>{post.community._count?.members || 0}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Posts</span>
                <span>{post.community._count?.posts || 0}</span>
              </div>
            </div>
          </div>

          {session && (
            <div className="bg-white rounded-lg shadow p-4">
              <Link
                href={`/r/${post.community.name}/submit`}
                className="block w-full text-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              >
                Create Post
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 