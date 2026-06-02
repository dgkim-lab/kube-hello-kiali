export type Move = "rock" | "paper" | "scissors";

export type ChallengeResult = {
  playerMove: Move;
  serverMove: Move;
  result: "win" | "lose" | "draw";
  requestId: string;
};

