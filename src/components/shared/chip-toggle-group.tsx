"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Multi-select chips; with `addLabel`, users can also add free tags. */
export function ChipToggleGroup({ options, value, onChange, max, label = (o) => o, addLabel, ariaLabel }: {
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  max?: number;
  label?: (option: string) => string;
  addLabel?: string;
  ariaLabel: string;
}) {
  const [custom, setCustom] = useState("");
  const all = [...options, ...value.filter((v) => !options.includes(v))];
  const full = max !== undefined && value.length >= max;

  function toggle(option: string) {
    if (value.includes(option)) onChange(value.filter((v) => v !== option));
    else if (!full) onChange([...value, option]);
  }

  function add() {
    const tag = custom.trim().slice(0, 30);
    if (tag.length >= 2 && !value.includes(tag) && !full) onChange([...value, tag]);
    setCustom("");
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
        {all.map((option) => {
          const on = value.includes(option);
          return (
            <button key={option} type="button" aria-pressed={on} disabled={!on && full} onClick={() => toggle(option)}
              className={cn("rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-40",
                on ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted")}>
              {label(option)}
            </button>
          );
        })}
      </div>
      {addLabel && (
        <div className="flex max-w-xs gap-2">
          <Input value={custom} maxLength={30} placeholder={addLabel} aria-label={addLabel} onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
          <Button type="button" variant="outline" size="icon" aria-label={addLabel} onClick={add}><Plus /></Button>
        </div>
      )}
    </div>
  );
}
