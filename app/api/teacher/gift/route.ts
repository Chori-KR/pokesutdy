import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/teacherApi";
import { jsonError } from "@/lib/api";
import { BALLS, MEDS, ShopItem } from "@/lib/game";

// 학생 선물 (명세 §5.5): 포인트 또는 아이템을 수업 보상으로 지급. 서버 권위.
export async function POST(req: NextRequest) {
  const auth = await requireTeacher(req);
  if (auth instanceof NextResponse) return auth;
  const { supa, cls } = auth;

  const body = await req.json().catch(() => null);
  const studentId = String(body?.student_id ?? "");
  const points = Math.max(0, Math.min(100000, Math.round(Number(body?.points) || 0)));
  const item = body?.item ? (String(body.item) as ShopItem) : null;
  const count = Math.max(0, Math.min(99, Math.round(Number(body?.count) || 0)));

  if (!studentId) return jsonError(400, "학생을 선택해주세요.");
  if (points === 0 && (!item || count === 0)) return jsonError(400, "지급할 포인트나 아이템을 정해주세요.");
  if (item && !(item in BALLS) && !(item in MEDS)) return jsonError(400, "그런 아이템은 없어요.");

  const { data: student } = await supa
    .from("students")
    .select("id, nickname, points, inventory")
    .eq("id", studentId)
    .eq("class_id", cls.id) // 내 학급 학생만
    .single();
  if (!student) return jsonError(404, "학생을 찾을 수 없어요.");

  const inventory = { ...student.inventory };
  if (item && count > 0) inventory[item] = (inventory[item] ?? 0) + count;
  const newPoints = student.points + points;

  const { error } = await supa
    .from("students")
    .update({ points: newPoints, inventory })
    .eq("id", student.id);
  if (error) return jsonError(500, "지급에 실패했어요.");

  return NextResponse.json({
    ok: true,
    nickname: student.nickname,
    points: newPoints,
    gave: { points, item, count },
  });
}
