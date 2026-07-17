import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  options: DropdownOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  noneLabel?: string;
  icon?: React.ReactNode;
  showSearch?: boolean;
  triggerClassName?: string;
  renderTrigger?: (selected: DropdownOption | null) => React.ReactNode;
  renderOption?: (
    option: DropdownOption,
    isSelected: boolean,
  ) => React.ReactNode;
}

export function Dropdown({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  noneLabel,
  icon,
  showSearch = true,
  triggerClassName,
  renderTrigger,
  renderOption,
}: DropdownProps) {
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex items-center justify-between px-3 py-2 text-sm bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors h-11",
            triggerClassName,
          )}
        >
          {renderTrigger ? (
            renderTrigger(selected)
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              {icon}
              <span
                className={cn(
                  "whitespace-nowrap",
                  selected ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {selected ? selected.label : placeholder}
              </span>
            </div>
          )}
          <ChevronDown
            className={cn(
              "ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-(--radix-popover-trigger-width)"
        align="start"
      >
        <Command>
          {showSearch && <CommandInput placeholder={searchPlaceholder} />}
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {noneLabel && (
                <CommandItem
                  value="__none__"
                  onSelect={() => {
                    onValueChange(null);
                    setOpen(false);
                  }}
                >
                  {!value && <Check className="mr-2 h-4 w-4" />}
                  {noneLabel}
                </CommandItem>
              )}
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? null : currentValue);
                    setOpen(false);
                  }}
                >
                  {renderOption ? (
                    renderOption(option, value === option.value)
                  ) : (
                    <>
                      {value === option.value && (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      {icon && <span className="mr-2">{icon}</span>}
                      {option.label}
                    </>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
