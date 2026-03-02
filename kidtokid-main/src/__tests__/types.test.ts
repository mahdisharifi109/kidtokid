import { describe, it, expect } from "vitest"
import { getConditionLabel, conditionLabels } from "@/src/types"

describe("Types & Helpers", () => {
  describe("getConditionLabel", () => {
    it("should return Portuguese label for valid conditions", () => {
      expect(getConditionLabel("novo")).toBe("Novo")
      expect(getConditionLabel("como-novo")).toBe("Como Novo")
      expect(getConditionLabel("bom")).toBe("Bom Estado")
      expect(getConditionLabel("usado")).toBe("Usado")
    })

    it("should return English legacy labels", () => {
      expect(getConditionLabel("new")).toBe("Novo")
      expect(getConditionLabel("good")).toBe("Bom Estado")
      expect(getConditionLabel("used")).toBe("Usado")
    })

    it("should return the original string for unknown conditions", () => {
      expect(getConditionLabel("unknown-condition")).toBe("unknown-condition")
    })
  })

  describe("conditionLabels", () => {
    it("should be an object with all mappings", () => {
      expect(typeof conditionLabels).toBe("object")
      expect(Object.keys(conditionLabels).length).toBeGreaterThanOrEqual(4)
    })
  })
})
