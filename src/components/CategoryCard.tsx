import { Link } from "react-router-dom"
import { Card } from "@/components/ui/card"

interface CategoryCardProps {
  name: string
  productCount?: number
  href: string
  imageSrc: string
}

export function CategoryCard({ name, href, imageSrc }: CategoryCardProps) {
  return (
    <Link to={href}>
      <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
        <div className="aspect-square overflow-hidden bg-k2k-gray">
          <img
            src={imageSrc || "/placeholder.svg"}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 text-white">
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold line-clamp-1">{name}</h3>
          </div>
        </div>
      </Card>
    </Link>
  )
}
