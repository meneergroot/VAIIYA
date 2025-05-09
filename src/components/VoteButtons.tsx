"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

interface VoteButtonsProps {
  id: string;
  type: "post" | "comment";
  initialVotes: number;
  userVote?: number;
}

export default function VoteButtons({
  id,
  type,
  initialVotes,
  userVote = 0,
}: VoteButtonsProps) {
  const { data: session } = useSession();
  const [votes, setVotes] = useState(initialVotes);
  const [currentVote, setCurrentVote] = useState(userVote);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (value: number) => {
    if (!session || isVoting) return;

    setIsVoting(true);
    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value,
          [type === "post" ? "postId" : "commentId"]: id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to vote");
      }

      const data = await response.json();

      if (data.message === "Vote removed") {
        setVotes((prev) => prev - currentVote);
        setCurrentVote(0);
      } else {
        setVotes((prev) => prev - currentVote + value);
        setCurrentVote(value);
      }
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => handleVote(1)}
        disabled={!session || isVoting}
        className={`p-1 rounded hover:bg-gray-100 ${
          currentVote === 1 ? "text-blue-500" : "text-gray-400"
        }`}
      >
        <ArrowUpIcon className="h-6 w-6" />
      </button>
      <span className="text-sm font-medium">{votes}</span>
      <button
        onClick={() => handleVote(-1)}
        disabled={!session || isVoting}
        className={`p-1 rounded hover:bg-gray-100 ${
          currentVote === -1 ? "text-red-500" : "text-gray-400"
        }`}
      >
        <ArrowDownIcon className="h-6 w-6" />
      </button>
    </div>
  );
} 