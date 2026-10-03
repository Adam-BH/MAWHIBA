import { redirect } from "next/navigation";

/** Créneaux now live in Séances; kept so old links still work. */
export default function SlotsPage() {
  redirect("/sessions?tab=slots");
}
