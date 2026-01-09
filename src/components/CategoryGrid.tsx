

import { CategoryCard } from "./CategoryCard"

const categories = [
  {
    name: "Brinquedos",
    productCount: 1267,
    href: "/categoria/brinquedos",
    imageSrc: "/colorful-kids-toys.png",
  },
  {
    name: "Babygrows",
    productCount: 1563,
    href: "/categoria/babygrows",
    imageSrc: "/baby-clothes-onesie.jpg",
  },
  {
    name: "Menina",
    productCount: 14075,
    href: "/categoria/menina",
    imageSrc: "/diverse-girls-clothing.png",
  },
  {
    name: "Menino",
    productCount: 10724,
    href: "/categoria/menino",
    imageSrc: "/boys-clothing.png",
  },
  {
    name: "Calçado",
    productCount: 2351,
    href: "/categoria/calcado",
    imageSrc: "/kids-shoes-sneakers.jpg",
  },
  {
    name: "Maternidade",
    productCount: 175,
    href: "/categoria/maternidade",
    imageSrc: "/maternity-clothes.jpg",
  },
  {
    name: "Puericultura",
    productCount: 337,
    href: "/categoria/puericultura",
    imageSrc: "/baby-care-products.png",
  },
  {
    name: "Equipamentos",
    productCount: 209,
    href: "/categoria/equipamentos",
    imageSrc: "/baby-equipment-stroller.jpg",
  },
  {
    name: "Acessórios",
    productCount: 366,
    href: "/categoria/acessorios",
    imageSrc: "/kids-accessories.jpg",
  },
  {
    name: "Agasalhos",
    productCount: 387,
    href: "/categoria/agasalhos",
    imageSrc: "/kids-winter-coats-jackets.jpg",
  },
  {
    name: "Praia",
    productCount: 520,
    href: "/categoria/praia",
    imageSrc: "/kids-beach-swimwear.jpg",
  },
  {
    name: "Carnaval / Halloween",
    productCount: 79,
    href: "/categoria/carnaval",
    imageSrc: "/kids-carnival-costumes.jpg",
  },
]

export function CategoryGrid() {
  return (
    <section className="mb-12">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.name}
            name={category.name}
            productCount={category.productCount}
            href={category.href}
            imageSrc={category.imageSrc}
          />
        ))}
      </div>
    </section>
  )
}
