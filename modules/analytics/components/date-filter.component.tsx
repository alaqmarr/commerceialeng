"use client";
import React from "react";
import { Calendar, Loader2 } from "lucide-react";

interface DateFilterProps {
  currentDays: number;
  onDaysChange: (days: number) => void;
  isPending?: boolean;
}

const OPTIONS = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last 90 Days", days: 90 },
];

export function DateFilter({
  currentDays,
  onDaysChange,
  isPending,
}: DateFilterProps) {
  return (
    <div className="inline-flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200">
      <div className="pl-2 pr-1 text-gray-500">
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 text-red-600 animate-spin" />
        ) : (
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
        )}
      </div>

      {OPTIONS.map((opt) => {
        const isActive = currentDays === opt.days;
        return (
          <button
            key={opt.days}
            type="button"
            disabled={isPending}
            onClick={() => onDaysChange(opt.days)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? "bg-red-600 text-white shadow-sm"
                : "bg-transparent text-gray-700 hover:text-gray-900 hover:bg-gray-200/60"
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
