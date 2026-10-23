import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants.js";
import { buildLibrary } from "./scripts/build-library.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 서버(API)가 기본 문제 은행 파일을 직접 읽어 출제·채점한다 → 함수에 파일을 함께 싣는다
  outputFileTracingIncludes: { "/api/**/*": ["./public/library/**/*"] },
};

// 빌드·개발 서버를 시작할 때 기본 문제 은행(public/library)을 문제 파일에서 새로 만든다
export default function config(phase) {
  if (phase === PHASE_PRODUCTION_BUILD || phase === PHASE_DEVELOPMENT_SERVER) buildLibrary();
  return nextConfig;
}
