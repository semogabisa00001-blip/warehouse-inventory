"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchableSelectProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)

  const filteredOptions = React.useMemo(() => {
    if (!search) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    )
  }, [options, search])

  const selectedOption = options.find((option) => option.value === value)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setOpen(false)
    setSearch("")
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
    setSearch("")
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between bg-white hover:bg-gray-50"
        disabled={disabled}
        onClick={() => setOpen(!open)}
      >
        <span className={cn("text-gray-900", !value && "text-gray-400")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-2">
          {value && !disabled && (
            <X
              className="h-4 w-4 shrink-0 text-gray-500 hover:text-gray-700"
              onClick={handleClear}
            />
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-gray-500" />
        </div>
      </Button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
          <div className="p-2 border-b border-gray-200">
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors",
                    "hover:bg-green-50 hover:text-green-900",
                    value === option.value && "bg-green-100 text-green-900 font-medium"
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-green-600",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="text-gray-900">{option.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
