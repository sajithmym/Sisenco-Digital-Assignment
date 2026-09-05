"use client";

import * as React from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      fixedWeeks
      className={cn("w-full p-2", className)}
      classNames={{
        ...defaultClassNames,
        root: cn(defaultClassNames.root, "relative w-full"),
        months: cn(defaultClassNames.months, "w-full"),
        month: cn(defaultClassNames.month, "w-full space-y-2"),
        month_caption: cn(
          defaultClassNames.month_caption,
          "flex h-10 items-center justify-center px-10"
        ),
        caption_label: cn(
          defaultClassNames.caption_label,
          "text-sm font-semibold tracking-tight text-foreground"
        ),
        nav: cn(
          defaultClassNames.nav,
          "absolute inset-x-0 top-1 flex h-8 items-center justify-between px-1"
        ),
        button_previous: cn(
          defaultClassNames.button_previous,
          "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        ),
        button_next: cn(
          defaultClassNames.button_next,
          "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        ),
        month_grid: cn(defaultClassNames.month_grid, "w-full border-collapse"),
        weekdays: cn(defaultClassNames.weekdays, "border-b border-border/70"),
        weekday: cn(
          defaultClassNames.weekday,
          "h-9 w-10 text-center text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground"
        ),
        week: cn(defaultClassNames.week, "mt-1"),
        day: cn(
          defaultClassNames.day,
          "h-10 w-10 p-0 text-center text-sm"
        ),
        day_button: cn(
          defaultClassNames.day_button,
          "mx-auto flex h-9 w-9 items-center justify-center rounded-lg font-medium text-foreground transition-all hover:bg-accent hover:text-accent-foreground focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        ),
        selected:
          "[&>button]:bg-primary [&>button]:font-semibold [&>button]:text-primary-foreground [&>button]:shadow-sm [&>button]:hover:bg-primary/90 [&>button]:hover:text-primary-foreground",
        today:
          "[&>button]:border [&>button]:border-primary/35 [&>button]:bg-primary/10 [&>button]:font-semibold [&>button]:text-primary",
        outside: "[&>button]:text-muted-foreground/45",
        disabled: "[&>button]:cursor-not-allowed [&>button]:text-muted-foreground/35",
        range_middle: "[&>button]:rounded-none [&>button]:bg-accent",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName }) => {
          const Icon =
            orientation === "right"
              ? ChevronRight
              : orientation === "up"
                ? ChevronUp
                : orientation === "down"
                  ? ChevronDown
                  : ChevronLeft;
          return (
            <Icon
              aria-hidden="true"
              className={cn("h-4 w-4", chevronClassName)}
            />
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
