import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants.js";
import { buildLibrary } from "./scripts/build-library.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {};

// 빌드·개발 서버를 시작할 때 기본 문제 은행(public/library)을 문제 파일에서 새로 만든다
export default function config(phase) {
  if (phase === PHASE_PRODUCTION_BUILD || phase === PHASE_DEVELOPMENT_SERVER) buildLibrary();
  return nextConfig;
}
