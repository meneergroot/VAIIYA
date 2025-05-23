import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import type { Post, Community } from "@/generated/prisma";

type Props = {
  params: Promise<{
    name: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type PostWithDetails = Post & {
  author: { name: string | null } | null;
  community: Community;
  _count: {
    comments: number;
    votes: number;
  };
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const community = await db.community.findUnique({
    where: {
      name: resolvedParams.name,
    },
  });

  if (!community) {
    return {
      title: 'Community Not Found',
    };
  }

  return {
    title: `r/${community.name}`,
    description: community.description || `Welcome to r/${community.name}`,
  };
}

export default async function CommunityPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);
  const community = await db.community.findUnique({
    where: {
      name: resolvedParams.name,
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

  if (!community) {
    notFound();
  }

  const posts = await db.post.findMany({
    where: {
      communityId: community.id,
    },
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2">
          {session && (
            <div className="mb-6">
              <Link
                href={`/r/${community.name}/submit`}
                className="block w-full text-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              >
                Create Post
              </Link>
            </div>
          )}

          <div className="space-y-4">
            {posts.map((post: PostWithDetails) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <Link href={`/r/${community.name}/post/${post.id}`}>
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                </Link>
                <p className="text-gray-600 mb-2">{post.content}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>Posted by {post.author?.name || "Anonymous"}</span>
                  <span className="mx-2">•</span>
                  <span>
                    {new Date(post.createdAt).toLocaleString()}
                  </span>
                  <span className="mx-2">•</span>
                  <span>{post._count.comments} comments</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">About Community</h2>
            <p className="text-gray-600 mb-4">{community.description}</p>
            <div className="border-t pt-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Members</span>
                <span>{community._count.members}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Posts</span>
                <span>{community._count.posts}</span>
              </div>
            </div>
          </div>

          {session && (
            <div className="bg-white rounded-lg shadow p-4">
              <Link
                href={`/r/${community.name}/submit`}
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