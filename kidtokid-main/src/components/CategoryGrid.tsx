

import { CategoryCard } from "./CategoryCard"
import { CATEGORIES } from "@/src/constants/categories"

export function CategoryGrid() {
  return (
    <section className="mb-8 md:mb-14">
      <h2 className="mb-5 md:mb-8 text-xl md:text-2xl font-semibold text-center tracking-tight text-gray-800">Categorias</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {CATEGORIES.map((category, index) => (
          <div key={category.slug} className="stagger-item" style={{ animationDelay: `${index * 0.04}s` }}>
            <CategoryCard
              name={category.label}
              href={`/categoria/${category.slug}`}
              imageSrc={category.image}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

