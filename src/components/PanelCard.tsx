import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PanelCard({
  title, subtitle, action, children, className, padded = true,
}: { title?: ReactNode; subtitle?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <Card className={cn("bg-gradient-card border-border shadow-elegant", className)}>
      {(title || action) && (
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2 pt-3 px-4">
          <div>
            {title && <CardTitle className="text-sm font-semibold tracking-tight">{title}</CardTitle>}
            {subtitle && <div className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</div>}
          </div>
          {action}
        </CardHeader>
      )}
      <CardContent className={cn(padded ? "p-4 pt-1" : "p-0")}>{children}</CardContent>
    </Card>
  );
}
