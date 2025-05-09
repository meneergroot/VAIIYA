"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import VoteButtons from "./VoteButtons";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    name: string;
  };
  votes: {
    value: number;
  }[];
}

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
}

export default function CommentSection({
  postId,
  initialComments,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setError("You must be logged in to comment");
      return;
    }

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          postId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      const comment = await response.json();
      setComments((prev) => [comment, ...prev]);
      setNewComment("");
      setError("");
    } catch (error) {
      setError("Failed to post comment");
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Comments</h2>
      {session && (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="What are your thoughts?"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Comment
          </button>
        </form>
      )}
      <div className="space-y-4">
        {comments.map((comment) => {
          const voteCount = comment.votes.reduce(
            (acc, vote) => acc + vote.value,
            0
          );
          const userVote = comment.votes[0]?.value || 0;

          return (
            <div key={comment.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex">
                <div className="mr-4">
                  <VoteButtons
                    id={comment.id}
                    type="comment"
                    initialVotes={voteCount}
                    userVote={userVote}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span>u/{comment.author.name}</span>
                    <span className="mx-1">•</span>
                    <span>
                      {formatDistanceToNow(new Date(comment.createdAt))} ago
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 