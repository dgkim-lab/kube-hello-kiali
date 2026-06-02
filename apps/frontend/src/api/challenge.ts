import type { ChallengeResult, Move } from "../types";

const challengeApiUrl = "/api";

export async function playChallenge(move: Move): Promise<ChallengeResult> {
  const response = await fetch(`${challengeApiUrl}/challenges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ move }),
  });

  if (!response.ok) {
    throw new Error(`challenge-api returned ${response.status}`);
  }

  return response.json();
}

