"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type SubmitPageProps = {
  params: Promise<{
    name: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default function SubmitPage({ params }: SubmitPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);

  if (!session) {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const isAnonymous = formData.get("isAnonymous") === "true";

    try {
      const resolvedParams = await params;
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          communityName: resolvedParams.name,
          isAnonymous,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Something went wrong");
      }

      const data = await response.json();
      router.push(`/r/${resolvedParams.name}/post/${data.post.id}`);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Create a Post</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="title"
                id="title"
                required
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Post title"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              Content
            </label>
            <div className="mt-1">
              <textarea
                name="content"
                id="content"
                rows={6}
                required
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="What's on your mind?"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isAnonymous"
              id="isAnonymous"
              value="true"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isAnonymous"
              className="ml-2 block text-sm text-gray-900"
            >
              Post anonymously
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 