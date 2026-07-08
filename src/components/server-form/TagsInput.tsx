import { KeyboardEvent, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = ["Windows", "Linux", "Oracle", "SAP", "Critical", "DMZ", "Backup", "Web", "Produção", "Database"];

const COLORS: Record<string, string> = {
  windows: "bg-info/15 text-info border-info/30",
  linux: "bg-success/15 text-success border-success/30",
  oracle: "bg-critical/15 text-critical border-critical/30",
  sap: "bg-warning/15 text-warning border-warning/30",
  critical: "bg-critical/15 text-critical border-critical/30",
  dmz: "bg-emergency/15 text-emergency border-emergency/30",
  backup: "bg-muted text-muted-foreground border-border",
  web: "bg-info/15 text-info border-info/30",
  produção: "bg-success/15 text-success border-success/30",
  database: "bg-warning/15 text-warning border-warning/30",
};

export function tagColorClass(tag: string) {
  return COLORS[tag.toLowerCase()] ?? "bg-secondary text-secondary-foreground border-border";
}

export function TagsInput({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    if (value.some((x) => x.toLowerCase() === t.toLowerCase())) return;
    onChange([...value, t]);
    setDraft("");
  };

  const remove = (t: string) => onChange(value.filter((x) => x !== t));

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(draft); }
    else if (e.key === "Backspace" && !draft && value.length) { remove(value[value.length - 1]); }
  };

  const suggestions = SUGGESTIONS.filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()));

  return (
    <div className="space-y-2">
      <div className="min-h-[40px] flex flex-wrap gap-1.5 rounded-md border border-input bg-background px-2 py-1.5">
        {value.map((t) => (
          <Badge key={t} variant="outline" className={cn("gap-1 h-6 pl-2 pr-1 border", tagColorClass(t))}>
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => remove(t)} className="hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => draft && add(draft)}
          placeholder={value.length ? "" : "Type and press Enter"}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-7 flex-1 min-w-[120px] px-1"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] text-muted-foreground self-center">Suggestions:</span>
          {suggestions.slice(0, 8).map((s) => (
            <button key={s} type="button" onClick={() => add(s)}
              className="text-[11px] rounded-md border border-dashed border-border px-2 py-0.5 text-muted-foreground hover:text-foreground hover:border-solid transition-colors">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
