

import { CategoryCard } from "./CategoryCard"

const categories = [
  {
    name: "Brinquedos",
    href: "/categoria/brinquedos",
    imageSrc: "https://images.pexels.com/photos/3661193/pexels-photo-3661193.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Babygrows",
    href: "/categoria/babygrows",
    imageSrc: "https://images.pexels.com/photos/6849550/pexels-photo-6849550.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Menina",
    href: "/categoria/menina",
    imageSrc: "https://images.pexels.com/photos/5693889/pexels-photo-5693889.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Menino",
    href: "/categoria/menino",
    imageSrc: "https://images.pexels.com/photos/5693891/pexels-photo-5693891.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Calçado",
    href: "/categoria/calcado",
    imageSrc: "https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Maternidade",
    href: "/categoria/maternidade",
    imageSrc: "https://images.pexels.com/photos/3875225/pexels-photo-3875225.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Puericultura",
    href: "/categoria/puericultura",
    imageSrc: "https://images.pexels.com/photos/3845456/pexels-photo-3845456.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Equipamentos",
    href: "/categoria/equipamentos",
    imageSrc: "https://images.pexels.com/photos/4473871/pexels-photo-4473871.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Acessórios",
    href: "/categoria/acessorios",
    imageSrc: "https://images.pexels.com/photos/6203797/pexels-photo-6203797.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Agasalhos",
    href: "/categoria/agasalhos",
    imageSrc: "https://images.pexels.com/photos/6347888/pexels-photo-6347888.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Praia",
    href: "/categoria/praia",
    imageSrc: "https://images.pexels.com/photos/5623066/pexels-photo-5623066.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    name: "Carnaval / Halloween",
    href: "/categoria/carnaval",
    imageSrc: "https://images.pexels.com/photos/5765832/pexels-photo-5765832.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
]

export function CategoryGrid() {
  return (
    <section className="mb-8 md:mb-12">
      <h2 className="mb-4 md:mb-6 text-xl md:text-2xl font-bold text-center text-k2k-blue">Categorias</h2>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
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

