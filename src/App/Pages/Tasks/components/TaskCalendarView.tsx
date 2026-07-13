import { useState, useMemo, useCallback } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import type { Task } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { Calendar, Folder, Target, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

interface TaskCalendarViewProps {
  tasks: Task[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TaskCalendarView({ tasks }: TaskCalendarViewProps) {
  const today = new Date();
  const [selected, setSelected] = useState<Date>(today);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((task) => {
      if (task.due_date) {
        const key = format(new Date(task.due_date), "yyyy-MM-dd");
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(task);
      }
    });
    return map;
  }, [tasks]);

  const selectedDayTasks = useMemo(() => {
    const key = format(selected, "yyyy-MM-dd");
    return tasksByDate.get(key) ?? [];
  }, [selected, tasksByDate]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const prevMonth = useCallback(() => {
    setCurrentMonth(prev => subMonths(prev, 1));
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentMonth(prev => addMonths(prev, 1));
  }, []);

  const handleToday = useCallback(() => {
    setSelected(new Date());
    setCurrentMonth(startOfMonth(new Date()));
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="lg:w-100 shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 dark:border-0 p-6">
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-['Spline_Sans',sans-serif] text-[16px] font-semibold text-slate-900">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            <button
              onClick={nextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-[11px] font-semibold text-slate-500 text-center h-8 flex items-center justify-center uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dayTasks = tasksByDate.get(dateStr);
              const isSelected = isSameDay(day, selected);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDay = isToday(day);
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelected(day)}
                  className={cn(
                    "h-[56px] rounded-xl text-[15px] font-medium flex flex-col items-center pt-3.75 transition-colors",
                    isSelected
                      ? "bg-primary text-white font-semibold shadow-sm"
                      : isCurrentMonth
                        ? "text-slate-700 hover:bg-slate-100"
                        : "text-slate-300",
                    isTodayDay && !isSelected && "ring-2 ring-primary ring-offset-2",
                  )}
                >
                  <span className="leading-none">{format(day, "d")}</span>
                  <div className="flex gap-[3px] items-center leading-none mt-2 min-h-[5px]">
                    {dayTasks && dayTasks.length > 0 && (
                      dayTasks.length <= 5
                        ? dayTasks.map((t: Task, i: number) => (
                            <span
                              key={i}
                              className={cn(
                                "w-[5px] h-[5px] rounded-full",
                                t.status === "done" ? "bg-emerald-500" : "bg-primary",
                                isSelected && "bg-white/70",
                              )}
                            />
                          ))
                        : (
                          <>
                            {dayTasks.slice(0, 4).map((t: Task, i: number) => (
                              <span
                                key={i}
                                className={cn(
                                  "w-[5px] h-[5px] rounded-full",
                                  t.status === "done" ? "bg-emerald-500" : "bg-primary",
                                  isSelected && "bg-white/70",
                                )}
                              />
                            ))}
                            <span className={cn("w-[5px] h-[5px] rounded-full bg-slate-400", isSelected && "bg-white/70")} />
                          </>
                        )
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-center mt-5 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="rounded-lg text-xs h-8 px-3"
            >
              Today
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 dark:border-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-['Spline_Sans',sans-serif] text-[16px] font-semibold text-slate-900">
              {format(selected, "MMMM d, yyyy")}
            </h3>
            <span className="text-xs text-slate-500 px-2 py-1 bg-slate-100 rounded-full">
              {selectedDayTasks.length} {selectedDayTasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>

          {selectedDayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Calendar className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">
                No tasks due on this day
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {selectedDayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                      task.status === "done"
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-300 bg-white",
                    )}
                  >
                    {task.status === "done" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {task.priority && task.priority !== "none" && (
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            task.priority === "urgent" && "bg-red-500",
                            task.priority === "high" && "bg-orange-500",
                            task.priority === "medium" && "bg-blue-500",
                            task.priority === "low" && "bg-slate-400",
                          )}
                        />
                      )}
                      <h4
                        className={cn(
                          "font-['Spline_Sans',sans-serif] text-[15px] leading-[1.3] font-semibold truncate",
                          task.status === "done"
                            ? "text-slate-500 line-through"
                            : "text-slate-900",
                        )}
                      >
                        {task.title}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      {task.projects?.title && (
                        <div className="flex items-center gap-1.5 text-[13px] text-slate-500">
                          <Folder className="w-3.5 h-3.5 text-primary" />
                          <span>{task.projects.title}</span>
                        </div>
                      )}
                      {task.goals?.title && (
                        <div className="flex items-center gap-1.5 text-[13px] text-slate-500">
                          <Target className="w-3.5 h-3.5 text-primary" />
                          <span>{task.goals.title}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0",
                      task.status === "todo" &&
                        "bg-slate-100 text-slate-600",
                      task.status === "in_progress" &&
                        "bg-blue-50 text-blue-600",
                      task.status === "done" &&
                        "bg-emerald-50 text-emerald-600",
                    )}
                  >
                    {task.status === "in_progress"
                      ? "In Progress"
                      : task.status === "done"
                        ? "Done"
                        : "Todo"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
