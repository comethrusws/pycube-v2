import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs"
import { join } from "path"
import type { SeedData } from "./types"
import { generateSeed } from "../scripts/seed-generator"

let cache: SeedData | null = null

function getSeedPath(): string {
  return join(process.cwd(), "data", "seed.json")
}

export function loadData(): SeedData {
  if (cache) return cache
  const file = getSeedPath()
  if (existsSync(file)) {
    const raw = readFileSync(file, { encoding: "utf-8" })
    cache = JSON.parse(raw) as SeedData
    return cache
  }
  // Generate if missing
  const dir = join(process.cwd(), "data")
  if (!existsSync(dir)) mkdirSync(dir)
  const data = generateSeed()
  writeFileSync(file, JSON.stringify(data), { encoding: "utf-8" })
  cache = data
  return cache
}

export function resetData(newData?: SeedData) {
  cache = newData ?? null
}

