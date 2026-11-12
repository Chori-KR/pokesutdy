import { POOL, EVOLVES_TO, evoWinsNeeded, evoPointCost, isStoneEvo, stageOf, genOf } from "../../../lib/game";
const R = ["common", "special", "rare", "legendary"];
const out = POOL.filter((p: any) => [1, 2, 9].includes(p.gen ?? genOf(p.id))).map((p: any) => ({
  id: p.id, name: p.name, type: p.type, gen: p.gen ?? genOf(p.id), rarity: typeof p.rarity === "string" ? p.rarity : R[p.rarity], stage: stageOf(p.id),
  evo: (EVOLVES_TO[p.id] ?? []).filter((t: number) => [1, 2, 9].includes(genOf(t))).map((t: number) => ({ to: t, stone: isStoneEvo(p.id, t), cost: evoPointCost(p.id, t) })),
  wins: evoWinsNeeded(p.id),
}));
await Bun.write("./gens_129.json", JSON.stringify(out));
console.log(out.length, out[0], out.find((p: any) => p.id === 152));
