import "@testing-library/jest-dom/vitest"
import { readFileSync, existsSync } from "fs"
import { resolve } from "path"

const envPath = resolve(process.cwd(), ".env.local")
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8")
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=")
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim()
        const val = trimmed.slice(idx + 1).trim()
        if (!process.env[key]) {
          process.env[key] = val
        }
      }
    }
  }
}
