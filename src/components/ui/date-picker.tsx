import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, placeholder, className }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-12 w-full rounded-xl border-slate-200 font-normal justify-start text-left",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 size-4 shrink-0" />
          {value ? format(value, "PPP") : <span>{placeholder ?? "Pick a date"}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="single"
          selected={value}
          onSelect={onChange}
          autoFocus
          classNames={{
            root: "p-3",
            months: "flex flex-col sm:flex-row gap-2",
            month: "flex flex-col gap-1",
            month_caption: "flex items-center justify-center h-8 relative mx-10",
            caption_label: "text-sm font-medium",
            nav: "absolute inset-x-0 top-0 flex justify-between items-center",
            button_previous: "z-10 h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent cursor-pointer",
            button_next: "z-10 h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent cursor-pointer",
            weeks: "w-full border-collapse",
            weekdays: "flex",
            weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            week: "flex mt-1",
            day: "p-0",
            day_button: "h-9 w-9 text-center text-sm rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer aria-selected:bg-primary aria-selected:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            today: "bg-accent text-accent-foreground",
            selected: "!bg-primary !text-primary-foreground",
            outside: "text-muted-foreground opacity-50",
            disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
            hidden: "invisible",
            week_number: "text-muted-foreground text-xs",
          }}
          components={{
            Chevron: (props) =>
              props.orientation === "left" ? (
                <ChevronLeft className="size-4" {...props} />
              ) : (
                <ChevronRight className="size-4" {...props} />
              ),
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
