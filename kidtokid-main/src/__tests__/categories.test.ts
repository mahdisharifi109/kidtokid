import { describe, it, expect } from "vitest"
import {
  CATEGORIES,
  CATEGORY_NAMES,
  CATEGORY_OPTIONS,
  CONDITIONS,
  GENDERS,
  SIZES,
  CATALOGUE,
  LEGACY_SLUG_MAP,
  resolveSlug,
  resolveCategoryName,
} from "@/src/constants/categories"

describe("Categories Constants", () => {
  it("should have exactly 7 parent categories", () => {
    expect(CATEGORIES.length).toBe(7)
  })

  it("each category should have slug, label, and image", () => {
    CATEGORIES.forEach((cat) => {
      expect(cat.slug).toBeTruthy()
      expect(cat.label).toBeTruthy()
      expect(cat.image).toBeTruthy()
    })
  })

  it("slugs should be unique", () => {
    const slugs = CATEGORIES.map((c) => c.slug)
    const unique = new Set(slugs)
    expect(unique.size).toBe(slugs.length)
  })

  it("CATEGORY_NAMES should map all slugs", () => {
    CATEGORIES.forEach((cat) => {
      expect(CATEGORY_NAMES[cat.slug]).toBe(cat.label)
    })
  })

  it("CATEGORY_OPTIONS should match CATEGORIES count", () => {
    expect(CATEGORY_OPTIONS.length).toBe(CATEGORIES.length)
  })

  it("CONDITIONS should have 4 entries", () => {
    expect(CONDITIONS.length).toBe(4)
    expect(CONDITIONS.map((c) => c.value)).toContain("novo")
    expect(CONDITIONS.map((c) => c.value)).toContain("usado")
  })

  it("GENDERS should have 3 entries", () => {
    expect(GENDERS.length).toBe(3)
  })

  it("SIZES should have at least 10 entries", () => {
    expect(SIZES.length).toBeGreaterThanOrEqual(10)
  })

  it("CATALOGUE should have subcategories for each category", () => {
    Object.values(CATALOGUE).forEach((cat) => {
      expect(cat.id).toBeTruthy()
      expect(cat.nome).toBeTruthy()
      expect(cat.subcategorias.length).toBeGreaterThan(0)
    })
  })

  it("CATALOGUE keys should match CATEGORIES slugs", () => {
    const catalogueKeys = Object.keys(CATALOGUE).sort()
    const categorySlugs = CATEGORIES.map((c) => c.slug).sort()
    expect(catalogueKeys).toEqual(categorySlugs)
  })

  it("LEGACY_SLUG_MAP should resolve old slugs to valid new slugs", () => {
    const validSlugs = new Set(CATEGORIES.map((c) => c.slug))
    Object.entries(LEGACY_SLUG_MAP).forEach(([oldSlug, newSlug]) => {
      expect(validSlugs.has(newSlug)).toBe(true)
      // Old slug should NOT be in current categories
      expect(validSlugs.has(oldSlug)).toBe(false)
    })
  })

  it("resolveSlug should return the correct slug for legacy slugs", () => {
    expect(resolveSlug("menina")).toBe("roupa")
    expect(resolveSlug("menino")).toBe("roupa")
    expect(resolveSlug("babygrows")).toBe("bebe")
    expect(resolveSlug("puericultura")).toBe("equipamento")
    expect(resolveSlug("equipamentos")).toBe("equipamento")
    expect(resolveSlug("carnaval")).toBe("ocasioes")
    expect(resolveSlug("agasalhos")).toBe("roupa")
    expect(resolveSlug("praia")).toBe("roupa")
    expect(resolveSlug("acessorios")).toBe("roupa")
    // Current slugs should pass through unchanged
    expect(resolveSlug("roupa")).toBe("roupa")
    expect(resolveSlug("calcado")).toBe("calcado")
    expect(resolveSlug("brinquedos")).toBe("brinquedos")
  })

  it("resolveCategoryName should return a label for legacy slugs", () => {
    expect(resolveCategoryName("menina")).toBe("Roupa")
    expect(resolveCategoryName("equipamentos")).toBe("Equipamento e Puericultura")
    expect(resolveCategoryName("carnaval")).toBe("Ocasiões Especiais")
    expect(resolveCategoryName("roupa")).toBe("Roupa")
    expect(resolveCategoryName("nonexistent")).toBeUndefined()
  })
})
