import type { SeedData } from "./types"
import { generateSeed } from "./seed"

let cached: SeedData | null = null

export function getStore(): SeedData {
  if (!cached) {
    // Default to 20k+ assets
    cached = generateSeed(20000, 1337)
  }
  return cached
}

export function resetStore(): void {
  cached = generateSeed(20000, 1337)
}


