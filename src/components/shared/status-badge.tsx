import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Enums } from "@/lib/supabase/database.types";

type Status = Enums<"booking_status"> | Enums<"withdrawal_status">;

const STYLES: Record<Status, string> = {
  pending: "bg-warning/20 text-warning-foreground",
  confirmed: "bg-secondary text-primary",
  completed: "bg-success/15 text-success",
  paid: "bg-success/15 text-success",
  declined: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
  rejected: "bg-destructive/10 text-destructive",
};

export function StatusBadge({ status }: { status: Status }) {
  const t = useTranslations("status");
  return <Badge className={cn("border-transparent", STYLES[status])}>{t(status)}</Badge>;
}
