import type { Difficulty, Inventory } from "@/lib/game";

// API 응답 형태 (클라이언트 공용)
export interface StudentData {
  id: string;
  nickname: string;
  points: number;
  inventory: Inventory;
  hp: number;
  level: number;
  xp: number;
}

export interface ClassInfo {
  name: string;
  class_code: string;
  settings: { moveDiff: boolean };
}

export interface ApiQuestion {
  id: string;
  body: string;
  options: string[];
  answer_idx: number;
  difficulty: Difficulty;
  tag: string;
}
