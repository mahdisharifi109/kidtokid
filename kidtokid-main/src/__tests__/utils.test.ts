import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("cn utility (tailwind-merge)", () => {
  it("should merge class names", () => {
    const result = cn("p-4", "text-red-500")
    expect(result).toContain("p-4")
    expect(result).toContain("text-red-500")
  })

  it("should handle conditional classes", () => {
    const isHidden = false
    const isVisible = true
    const result = cn("base", isHidden && "hidden", isVisible && "visible")
    expect(result).toContain("base")
    expect(result).toContain("visible")
    expect(result).not.toContain("hidden")
  })

  it("should deduplicate conflicting Tailwind classes", () => {
    const result = cn("p-2", "p-4")
    expect(result).toBe("p-4")
  })

  it("should handle undefined and null", () => {
    const result = cn("base", undefined, null)
    expect(result).toBe("base")
  })
})
