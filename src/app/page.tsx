import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const communities = await db.community.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  });

  const posts = await db.post.findMany({
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: true,
      community: true,
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold mb-6">Recent Posts</h1>
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <Link href={`/r/${post.community.name}/post/${post.id}`}>
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                </Link>
                <p className="text-gray-600 mb-2">{post.content}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>Posted by {post.author?.name || "Anonymous"}</span>
                  <span className="mx-2">•</span>
                  <Link href={`/r/${post.community.name}`}>
                    r/{post.community.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Communities */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Popular Communities</h2>
            <div className="space-y-2">
              {communities.map((community) => (
                <Link
                  key={community.id}
                  href={`/r/${community.name}`}
                  className="block p-2 hover:bg-gray-50 rounded"
                >
                  r/{community.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Create Community */}
          {session && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-bold mb-4">Create Community</h2>
              <Link
                href="/r/create"
                className="block w-full text-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              >
                Create Community
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
