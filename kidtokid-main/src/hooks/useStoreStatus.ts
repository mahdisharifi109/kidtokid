import { useState, useEffect } from 'react'

export function useStoreStatus(
  weekdayHours: string,
  saturdayHours: string,
  sundayHours: string
) {
  const [isOpen, setIsOpen] = useState(false)
  const [closingSoon, setClosingSoon] = useState(false) // optional: less than 1 hour

  useEffect(() => {
    function checkStatus() {
      // Current Lisbon time
      const now = new Date()
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Lisbon',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
        weekday: 'short'
      })
      const parts = formatter.formatToParts(now)
      const hourStr = parts.find(p => p.type === 'hour')?.value || '0'
      const minStr = parts.find(p => p.type === 'minute')?.value || '0'
      const weekdayStr = parts.find(p => p.type === 'weekday')?.value || ''

      const currentHour = parseInt(hourStr, 10)
      const currentMin = parseInt(minStr, 10)
      const currentMinutes = currentHour * 60 + currentMin

      let todayHoursRange = weekdayHours
      if (weekdayStr === 'Sat') {
        todayHoursRange = saturdayHours
      } else if (weekdayStr === 'Sun') {
        todayHoursRange = sundayHours
      }

      if (!todayHoursRange || todayHoursRange.toLowerCase().includes('fechado') || todayHoursRange.toLowerCase().includes('closed')) {
        setIsOpen(false)
        setClosingSoon(false)
        return
      }

      // Expected format "10:00 - 19:00" or similar
      const match = todayHoursRange.match(/(\d{1,2}):(\d{2})\s*(?:-|a|até|to)\s*(\d{1,2}):(\d{2})/)
      if (match) {
        const openH = parseInt(match[1], 10)
        const openM = parseInt(match[2], 10)
        const closeH = parseInt(match[3], 10)
        const closeM = parseInt(match[4], 10)

        const openMinutes = openH * 60 + openM
        const closeMinutes = closeH * 60 + closeM

        if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
          setIsOpen(true)
          if (closeMinutes - currentMinutes <= 60) {
            setClosingSoon(true)
          } else {
            setClosingSoon(false)
          }
        } else {
          setIsOpen(false)
          setClosingSoon(false)
        }
      } else {
        setIsOpen(false) // couldn't parse
        setClosingSoon(false)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 60000) // check every minute
    return () => clearInterval(interval)
  }, [weekdayHours, saturdayHours, sundayHours])

  return { isOpen, closingSoon }
}
