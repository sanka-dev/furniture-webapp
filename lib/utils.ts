import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createId(prefix = "id"): string {
  if (typeof globalThis !== "undefined") {
    const secureCrypto = globalThis.crypto
    if (secureCrypto && typeof secureCrypto.randomUUID === "function") {
      return secureCrypto.randomUUID()
    }
  }

  const randomPart = Math.random().toString(36).slice(2, 10)
  const timePart = Date.now().toString(36)
  return `${prefix}-${timePart}-${randomPart}`
}
