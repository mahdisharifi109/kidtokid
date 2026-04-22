import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { getStoreSettings, defaultSettings, type StoreSettings } from "@/src/services/settingsService"
import { useStoreStatus } from "@/src/hooks/useStoreStatus"

interface StoreHoursProps {
  className?: string;
  iconClassName?: string;
}

export function StoreHours({ className = "", iconClassName = "h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0 mt-1.5" }: StoreHoursProps) {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings)
  const { isOpen } = useStoreStatus(settings.weekdayHours, settings.saturdayHours, settings.sundayHours)

  useEffect(() => {
    getStoreSettings().then(setSettings)
  }, [])

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <Clock className={iconClassName} />
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Horário</p>
          <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium w-fit ${isOpen ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isOpen ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
            {isOpen ? "Aberto" : "Fechado"}
          </div>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4 items-center">
            <span className="text-gray-500 dark:text-gray-400">Segunda a Sexta</span>
            <span className="text-gray-700 dark:text-gray-300">{settings.weekdayHours}</span>
          </div>
          <div className="flex justify-between gap-4 items-center">
            <span className="text-gray-500 dark:text-gray-400">Sábado</span>
            <span className="text-gray-700 dark:text-gray-300">{settings.saturdayHours}</span>
          </div>
          <div className="flex justify-between gap-4 items-center">
            <span className="text-gray-500 dark:text-gray-400">Domingo</span>
            <span className="text-gray-700 dark:text-gray-300">{settings.sundayHours}</span>
          </div>
        </div>
        <p className="mt-2.5 text-xs text-gray-400 dark:text-gray-500"> 
          Compras de artigos aceites até uma hora antes do fecho.    
        </p>
      </div>
    </div>
  )
}
