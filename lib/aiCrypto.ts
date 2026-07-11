// AI 키 암호화 (AES-256-GCM, 명세 §5.3 "서버 저장 시 암호화 필수") — 서버 전용.
// 별도 환경 변수를 늘리지 않도록 STUDENT_JWT_SECRET에서 키를 유도한다.
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

function encKey(): Buffer {
  const s = process.env.STUDENT_JWT_SECRET;
  if (!s) throw new Error("STUDENT_JWT_SECRET이 설정되지 않았습니다");
  return createHash("sha256").update(`ai-key:${s}`).digest();
}

export function encryptApiKey(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString("base64");
}

export function decryptApiKey(stored: string): string {
  const buf = Buffer.from(stored, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", encKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}
