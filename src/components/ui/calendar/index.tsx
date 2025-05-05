import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "../button"

export type CalendarProps = {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
  initialFocus?: boolean
}

export function Calendar({
  selected,
  onSelect,
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  
  const handleDateSelect = (day: Date) => {
    if (onSelect) {
      if (selected && isSameDay(day, selected)) {
        onSelect(undefined)
      } else {
        onSelect(day)
      }
    }
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Generate day names
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  return (
    <div className={cn("p-3", className)}>
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousMonth}
          className="h-7 w-7"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium">
          {format(currentMonth, "MMMM yyyy")}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMonth}
          className="h-7 w-7"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Calendar grid */}
      <div>
        {/* Day names */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const isSelected = selected && isSameDay(day, selected)
            
            return (
              <Button
                key={day.toString()}
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 p-0 font-normal",
                  !isSameMonth(day, currentMonth) && "text-muted-foreground opacity-50",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                )}
                onClick={() => handleDateSelect(day)}
              >
                <time dateTime={format(day, "yyyy-MM-dd")}>{format(day, "d")}</time>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
} 