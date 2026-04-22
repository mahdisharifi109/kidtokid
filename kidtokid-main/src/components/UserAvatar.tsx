import { useState, useCallback } from "react"
import { User } from "lucide-react"

const FAILED_URLS_KEY = "k2k_failed_avatar_urls"

/** Guardar URLs que falharam para não voltar a tentar na mesma sessão */
function getFailedUrls(): Set<string> {
  try {
    const raw = sessionStorage.getItem(FAILED_URLS_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function markUrlAsFailed(url: string) {
  try {
    const failed = getFailedUrls()
    failed.add(url)
    sessionStorage.setItem(FAILED_URLS_KEY, JSON.stringify([...failed]))
  } catch {
    // ignore storage errors
  }
}

interface UserAvatarProps {
  src?: string | null
  alt?: string
  fallbackInitials?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-7 w-7 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "w-20 h-20 md:w-24 md:h-24 text-3xl md:text-4xl",
}

export function UserAvatar({ src, alt = "", fallbackInitials, size = "sm", className = "" }: UserAvatarProps) {
  const [prevSrc, setPrevSrc] = useState(src)
  const [imgFailed, setImgFailed] = useState(() => {
    if (!src) return true
    return getFailedUrls().has(src)
  })

  // Synchronously update state on prop change
  if (src !== prevSrc) {
    setPrevSrc(src)
    setImgFailed(() => {
      if (!src) return true
      return getFailedUrls().has(src)
    })
  }

  const handleError = useCallback(() => {
    if (src) markUrlAsFailed(src)
    setImgFailed(true)
  }, [src])

  const sizeClass = sizeClasses[size]

  if (src && !imgFailed) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClass} rounded-full object-cover ${className}`}
        onError={handleError}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    )
  }

  // Fallback: iniciais ou ícone genérico
  if (fallbackInitials) {
    return (
      <div className={`${sizeClass} flex items-center justify-center rounded-full bg-k2k-blue font-bold text-white ${className}`}>
        {fallbackInitials}
      </div>
    )
  }

  return (
    <div className={`${sizeClass} flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 ${className}`}>
      <User className="h-1/2 w-1/2 text-gray-400 dark:text-gray-500" />
    </div>
  )
}
