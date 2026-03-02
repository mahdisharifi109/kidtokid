import { Link } from "react-router-dom"

interface CategoryCardProps {
  name: string
  productCount?: number
  href: string
  imageSrc: string
}

export function CategoryCard({ name, href, imageSrc }: CategoryCardProps) {
  return (
    <Link to={href} className="group">
      <div className="relative overflow-hidden rounded-2xl bg-k2k-gray shadow-sm transition-all duration-400 ease-out group-hover:shadow-xl group-hover:-translate-y-1">
        <div className="aspect-4/5 overflow-hidden">
          <img
            src={imageSrc || "/placeholder.svg"}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-600 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <h3 className="text-sm sm:text-base font-semibold text-white drop-shadow-sm">{name}</h3>
          </div>
        </div>
      </div>
    </Link>
  )
}

