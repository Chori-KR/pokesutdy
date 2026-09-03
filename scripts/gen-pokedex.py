#!/usr/bin/env python3
"""전 세대 포켓몬 도감 데이터 생성기 → lib/pokedexData.ts

출처: PokeAPI 공개 데이터 (github.com/PokeAPI/pokeapi, data/v2/csv)
실행: python3 scripts/gen-pokedex.py     (네트워크 필요, 생성은 1회성)

생성 결과는 커밋되므로 앱 실행 중에는 외부 호출이 전혀 없다.

등급 배분:
  · 1~151(1세대)은 기존 수기 분류를 그대로 보존한다.
    자동 규칙을 적용하면 47종의 등급이 바뀌어(피카츄는 2세대에 생긴 피츄 때문에
    '중간 단계'가 되는 식) 이미 운영 중인 학급의 밸런스가 흔들리기 때문.
  · 152번부터는 아래 자동 규칙을 적용한다.
      전설/환상            → legendary
      진화체가 없는 최종형   → rare
      중간 진화형           → special
      진화가 아예 없는 단독형 → special
      진화가 남은 기본형     → common
"""
import csv, io, json, os, urllib.request

BASE = "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv"
MAX_ID = 1025          # 9세대(복숭악동)까지
KOREAN = "3"           # local_language_id
TRIGGER_USE_ITEM = "3" # 아이템(돌) 진화

# 1세대 원본 데이터 (이름·타입·등급) — 기존 학급 밸런스 보존용. 변경 금지.
# 타입은 PokeAPI의 첫 번째 타입 대신 원본을 쓴다: 구구=flying, 푸린=fairy 처럼
# 아이들이 떠올리는 특징적 타입이라 색상·기술 이름이 여기에 맞춰져 있다.
_G1 = json.load(open(os.path.join(os.path.dirname(__file__), "gen1-original.json"), encoding="utf-8"))
G1_NAMES_TYPES = _G1["names_types"]
G1_LEGENDARY = set(_G1["legendary"])
G1_SPECIAL = set(_G1["special"])
G1_RARE = set(_G1["rare"])
G1_STONE = [tuple(x) for x in _G1["stone_pairs"]]


def fetch(name):
    with urllib.request.urlopen(f"{BASE}/{name}") as r:
        return list(csv.DictReader(io.StringIO(r.read().decode("utf-8"))))


def main():
    species = [r for r in fetch("pokemon_species.csv") if int(r["id"]) <= MAX_ID]
    names = {int(r["pokemon_species_id"]): r["name"]
             for r in fetch("pokemon_species_names.csv") if r["local_language_id"] == KOREAN}
    type_names = {r["id"]: r["identifier"] for r in fetch("types.csv")}
    slot1 = {int(r["pokemon_id"]): type_names[r["type_id"]]
             for r in fetch("pokemon_types.csv") if r["slot"] == "1" and int(r["pokemon_id"]) <= MAX_ID}
    evolution = fetch("pokemon_evolution.csv")
    # 진짜 '돌'(*-stone)만 돌 진화로 취급한다. 사과·찻잔·갑옷 같은 특수 아이템까지
    # 돌 진화로 묶으면 학생이 진화의돌 없이는 진화를 못 해 불리해진다.
    stone_items = {r["id"] for r in fetch("items.csv") if r["identifier"].endswith("-stone")}

    by_id = {int(r["id"]): r for r in species}

    # 진화 관계: 부모 → 자식들
    children = {}
    parent = {}
    for r in species:
        src = r["evolves_from_species_id"]
        if not src:
            continue
        p, c = int(src), int(r["id"])
        if p > MAX_ID:
            continue
        children.setdefault(p, []).append(c)
        parent[c] = p

    # 돌(아이템) 진화 쌍: 진화 결과 종의 부모 → 그 종
    stone = []
    for r in evolution:
        if r["evolution_trigger_id"] != TRIGGER_USE_ITEM:
            continue
        if r["trigger_item_id"] not in stone_items:
            continue
        to = int(r["evolved_species_id"])
        if to > MAX_ID or to not in parent:
            continue
        pair = (parent[to], to)
        if pair not in stone:
            stone.append(pair)

    def rarity(i):
        # 1세대는 기존 수기 분류 보존 (운영 중인 학급 밸런스 유지)
        if i <= 151:
            if i in G1_LEGENDARY:
                return 3
            if i in G1_RARE:
                return 2
            if i in G1_SPECIAL:
                return 1
            return 0
        r = by_id[i]
        if r["is_legendary"] == "1" or r["is_mythical"] == "1":
            return 3
        has_parent, has_child = i in parent, i in children
        if has_parent and not has_child:
            return 2   # 최종 진화형 → 희귀
        if has_parent and has_child:
            return 1   # 중간 진화형 → 특별
        if not has_child:
            return 1   # 진화 없는 단독형 → 특별
        return 0       # 진화가 남은 기본형 → 흔함

    rows, missing = [], []
    for i in range(1, MAX_ID + 1):
        if i <= 151:                       # 1세대는 원본 이름·타입 그대로
            nm, tp = G1_NAMES_TYPES[i - 1]
        else:
            nm, tp = names.get(i), slot1.get(i)
        if not nm or not tp:
            missing.append(i)
            continue
        rows.append((i, nm, tp, int(by_id[i]["generation_id"]), rarity(i)))
    if missing:
        raise SystemExit(f"데이터 누락: {missing[:20]}")

    def esc(s):
        return s.replace("\\", "\\\\").replace('"', '\\"')

    out = [
        "// 자동 생성 파일 — 직접 수정하지 마세요. (scripts/gen-pokedex.py 로 재생성)",
        "// 출처: PokeAPI 공개 데이터 (github.com/PokeAPI/pokeapi)",
        "// 앱 실행 중에는 외부 호출이 없습니다 — 아래 데이터만 사용합니다.",
        "",
        "// [한국어 이름, 타입, 세대, 등급] · 등급 0=흔함 1=특별 2=희귀 3=전설",
        "// 배열 위치 = 전국도감 번호 - 1 (POOL[id-1] 접근 유지)",
        "export const DEX: [string, string, number, number][] = [",
    ]
    for i, nm, tp, gen, rar in rows:
        out.append(f'  ["{esc(nm)}","{tp}",{gen},{rar}], // {i}')
    out.append("];")
    out.append("")
    out.append("// 진화: 진화 전 → 진화 후 후보들 (이브이처럼 여러 갈래 가능)")
    out.append("export const EVO: Record<number, number[]> = {")
    for p in sorted(children):
        kids = ",".join(str(c) for c in sorted(children[p]) if c <= MAX_ID)
        if kids:
            out.append(f"  {p}: [{kids}],")
    out.append("};")
    out.append("")
    out.append("// 돌(아이템)로만 진화하는 쌍")
    out.append("export const STONE: [number, number][] = [")
    # 1세대(양쪽 모두 151 이하)는 원본 목록을 그대로 사용 — 리전폼 데이터 혼입 방지
    stone = [p for p in stone if not (p[0] <= 151 and p[1] <= 151)] + G1_STONE
    for a, b in sorted(set(stone)):
        out.append(f"  [{a},{b}],")
    out.append("];")
    out.append("")

    with open("lib/pokedexData.ts", "w", encoding="utf-8") as f:
        f.write("\n".join(out))

    dist = {0: 0, 1: 0, 2: 0, 3: 0}
    for _, _, _, _, r in rows:
        dist[r] += 1
    print(f"생성 완료: {len(rows)}종")
    print(f"  흔함 {dist[0]} / 특별 {dist[1]} / 희귀 {dist[2]} / 전설 {dist[3]}")
    print(f"  진화 관계 {sum(len(v) for v in children.values())}건, 돌 진화 {len(stone)}쌍")


if __name__ == "__main__":
    main()
