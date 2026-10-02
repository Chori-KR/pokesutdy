// Supabase(PostgREST)는 한 번에 최대 1000줄만 돌려준다.
// 문제를 JSON으로 많이 가져오면 1000개를 넘을 수 있으므로 1000줄씩 끝까지 이어 받는다.
// page(from, to)는 .order(...)로 순서를 고정한 쿼리에 .range(from, to)를 붙여 돌려줘야 한다.
type Err = { message?: string; code?: string } | null;
type Page = PromiseLike<{ data: unknown[] | null; error: Err }>;

export async function fetchAll<T>(page: (from: number, to: number) => Page, size = 1000, max = 50000): Promise<{ data: T[] | null; error: Err }> {
  const out: T[] = [];
  for (let from = 0; from < max; from += size) {
    const { data, error } = await page(from, from + size - 1);
    if (error) return { data: null, error };
    out.push(...((data ?? []) as T[]));
    if (!data || data.length < size) break;
  }
  return { data: out, error: null };
}
