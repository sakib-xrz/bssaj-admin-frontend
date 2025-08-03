"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value?: string; // ISO string
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date and time",
  className = "",
  disabled = false,
}: DateTimePickerProps) {
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string>("12:00");
  const [isOpen, setIsOpen] = useState(false);

  // Initialize date and time from value prop
  useEffect(() => {
    if (value) {
      const dateObj = new Date(value);
      setDate(dateObj);

      // Format time as HH:MM
      const hours = dateObj.getHours().toString().padStart(2, "0");
      const minutes = dateObj.getMinutes().toString().padStart(2, "0");
      setTime(`${hours}:${minutes}`);
    }
  }, [value]);

  // Combine date and time and call onChange
  const handleDateTimeChange = (newDate?: Date, newTime?: string) => {
    const currentDate = newDate || date;
    const currentTime = newTime || time;

    if (currentDate && currentTime && onChange) {
      const [hours, minutes] = currentTime.split(":").map(Number);
      const combinedDateTime = new Date(currentDate);
      combinedDateTime.setHours(hours, minutes, 0, 0);

      onChange(combinedDateTime.toISOString());
    }
  };

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    handleDateTimeChange(newDate, time);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    handleDateTimeChange(date, newTime);
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {/* Date Picker with Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex-1 justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              handleDateChange(newDate);
              setIsOpen(false);
            }}
            disabled={disabled}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Time Picker */}
      <div className="relative">
        <Input
          type="time"
          value={time}
          onChange={handleTimeChange}
          disabled={disabled}
          className="w-32 pl-9 [&::-webkit-calendar-picker-indicator]:hidden"
          placeholder={placeholder}
        />
        <ClockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}
