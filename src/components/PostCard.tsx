"use client";

import Link from "next/link";
import VoteButtons from "./VoteButtons";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    author: {
      name: string;
    };
    community: {
      name: string;
    };
    _count: {
      comments: number;
    };
    votes: {
      value: number;
    }[];
  };
}

export default function PostCard({ post }: PostCardProps) {
  const voteCount = post.votes.reduce((acc, vote) => acc + vote.value, 0);
  const userVote = post.votes[0]?.value || 0;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex">
        <div className="mr-4">
          <VoteButtons
            id={post.id}
            type="post"
            initialVotes={voteCount}
            userVote={userVote}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Link
              href={`/r/${post.community.name}`}
              className="hover:underline font-medium"
            >
              r/{post.community.name}
            </Link>
            <span className="mx-1">•</span>
            <span>Posted by u/{post.author.name}</span>
            <span className="mx-1">•</span>
            <span>{new Date(post.createdAt).toLocaleString()}</span>
          </div>
          <Link href={`/r/${post.community.name}/comments/${post.id}`}>
            <h2 className="text-xl font-semibold mb-2 hover:underline">
              {post.title}
            </h2>
          </Link>
          <p className="text-gray-700 mb-4">{post.content}</p>
          <div className="flex items-center text-sm text-gray-500">
            <Link
              href={`/r/${post.community.name}/comments/${post.id}`}
              className="hover:bg-gray-100 px-2 py-1 rounded"
            >
              {post._count.comments} Comments
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 