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

// 일일 카운터 (자정 Asia/Seoul 리셋, 명세 §4.7)
export interface DayInfo {
  quizDone: boolean;
  encUsed: number;
  solveCount: number;
  battleUsed: number;
  exploreLimit: number;
  solveLimit: number;
  battleLimit: number;
}

// 배틀 포켓몬 시스템 (M4/M5)
export interface GameInfo {
  starter: number | null;
  battlePid: number;
  wins: Record<string, number>;
  evoCount: number;
}

export interface ClassSettings {
  moveDiff: boolean;
  exploreLimit?: number;
  solveLimit?: number;
  battleLimit?: number;
}

export interface ClassInfo {
  name: string;
  class_code: string;
  settings: ClassSettings;
}

export interface ApiQuestion {
  id: string;
  body: string;
  options: string[];
  answer_idx: number;
  difficulty: Difficulty;
  tag: string;
}

// 문제풀이 탭용: 정답 인덱스를 클라이언트에 노출하지 않는다 (포인트가 걸려 있어서)
export interface SolveQuestion {
  id: string;
  body: string;
  options: string[];
  difficulty: Difficulty;
  tag: string;
}
