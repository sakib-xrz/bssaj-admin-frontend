"use client";

import { useId, useState, useMemo, useEffect } from "react";
import { CheckIcon, ChevronDownIcon, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";

type Option = {
  label: string;
  value: string;
};

interface BaseSearchSelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  emptyMessage?: string;
}

interface StaticSearchSelectProps extends BaseSearchSelectProps {
  options: Option[];
}

interface DynamicSearchSelectProps extends BaseSearchSelectProps {
  useSearchQuery: (params: Record<string, unknown>) => {
    data?: unknown;
    isLoading?: boolean;
  };
  searchParams?: Record<string, unknown>;
  transformData: (data: unknown) => Option[];
  debounceMs?: number;
  selectedOptionLabel?: string; // Add this to allow external control of selected display
}

type SearchSelectProps = StaticSearchSelectProps | DynamicSearchSelectProps;

// Static Search Select Component
function StaticSearchSelect({
  label,
  options,
  placeholder = "Select option",
  value,
  onChange,
  className,
  emptyMessage = "No result found.",
}: StaticSearchSelectProps) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("*:not-first:mt-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value
                ? options.find((option) => option.value === value)?.label
                : placeholder}
            </span>
            <ChevronDownIcon
              size={16}
              className="text-muted-foreground/80 shrink-0"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                    {value === option.value && (
                      <CheckIcon size={16} className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Dynamic Search Select Component
function DynamicSearchSelect({
  label,
  placeholder = "Select option",
  value,
  onChange,
  className,
  useSearchQuery,
  searchParams = {},
  transformData,
  debounceMs = 300,
  emptyMessage = "No result found.",
  selectedOptionLabel,
}: DynamicSearchSelectProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  // Debounce search term for API calls
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  // Build dynamic search parameters
  const dynamicSearchParams = useMemo(
    () => ({
      ...searchParams,
      ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
    }),
    [searchParams, debouncedSearchTerm]
  );

  // Always call the hook (no conditional calls)
  const searchResult = useSearchQuery(dynamicSearchParams);
  const isLoading = searchResult?.isLoading || false;

  // Transform API data to options
  const options = useMemo(() => {
    if (!searchResult?.data) return [];
    return transformData(searchResult.data);
  }, [searchResult?.data, transformData]);

  // Update selectedOption when value changes - maintain selection even if not in current options
  useEffect(() => {
    if (value) {
      // Only update if we don't have a selectedOption or if the value actually changed
      if (!selectedOption || selectedOption.value !== value) {
        const foundOption = options.find((option) => option.value === value);
        if (foundOption) {
          setSelectedOption(foundOption);
        }
        // Don't clear selectedOption if not found - it might be from a previous search
      }
    } else {
      setSelectedOption(null);
    }
  }, [value, selectedOption, options]);

  // Clear search when popover closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  return (
    <div className={cn("*:not-first:mt-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value
                ? selectedOptionLabel ||
                  selectedOption?.label ||
                  "Selected item"
                : placeholder}
            </span>
            {isLoading ? (
              <Loader2
                size={16}
                className="text-muted-foreground/80 shrink-0 animate-spin"
              />
            ) : (
              <ChevronDownIcon
                size={16}
                className="text-muted-foreground/80 shrink-0"
                aria-hidden="true"
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Type to search..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Searching..." : emptyMessage}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      if (currentValue === value) {
                        onChange("");
                        setSelectedOption(null);
                      } else {
                        onChange(currentValue);
                        setSelectedOption(option);
                      }
                      setOpen(false);
                    }}
                  >
                    {option.label}
                    {value === option.value && (
                      <CheckIcon size={16} className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Main exported component that chooses between static and dynamic
export function SearchSelect(props: SearchSelectProps) {
  // Type guard to determine which component to use
  if ("options" in props) {
    return <StaticSearchSelect {...props} />;
  } else {
    return <DynamicSearchSelect {...props} />;
  }
}
