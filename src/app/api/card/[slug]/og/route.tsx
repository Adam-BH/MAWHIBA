import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { THEME } from "@/features/cv/pdf/theme";
import { getCoachFull, resolveCoach } from "@/features/cv/queries";
import { sportFamily } from "@/lib/athlete-card";

const SIZES = { og: { width: 1200, height: 630 }, story: { width: 1080, height: 1350 } };

/** Share card (Open Graph 1200×630, or Instagram 1080×1350 with ?format=story). Public coaches only. */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ref = await resolveCoach(slug);
  const coach = ref ? await getCoachFull(ref.user_id) : null;
  if (!coach?.verified) return new Response("Not found", { status: 404 });

  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "story" ? "story" : "og";
  const { width, height } = SIZES[format];
  const story = format === "story";
  const t = await getTranslations("athleteCard");
  const c = THEME.colors;
  const sport = coach.primary_sport ?? coach.sports[0] ?? "";
  const avatar = coach.profile.avatar_url && /\.(png|jpe?g)(\?|$)/i.test(coach.profile.avatar_url) ? coach.profile.avatar_url : null;
  const initials = coach.profile.full_name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const stats = [
    [t("rating"), coach.stats.ratingCount ? coach.stats.ratingAvg.toFixed(1) : "—"],
    [t("sessions"), String(coach.stats.completedSessions)],
    [t("years"), coach.years_practice !== null ? String(coach.years_practice) : "—"],
  ];
  const badges = [t("badges.verified"), ...(coach.inclusive ? [t("badges.inclusive")] : [])];
  const avatarSize = story ? 300 : 220;

  return new ImageResponse(
    (
      <div style={{ width, height, display: "flex", flexDirection: story ? "column" : "row", alignItems: "center", justifyContent: "center",
        gap: story ? 48 : 64, padding: 64, color: c.primaryForeground,
        background: `linear-gradient(150deg, ${THEME.sport[sportFamily(sport)]} 0%, ${c.primary} 75%)` }}>
        <div style={{ display: "flex", width: avatarSize, height: avatarSize, borderRadius: avatarSize, border: `10px solid ${c.primaryForeground}40`,
          background: c.accent, color: c.accentForeground, alignItems: "center", justifyContent: "center", fontSize: avatarSize / 2.6, fontWeight: 700, overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> only */}
          {avatar ? <img src={avatar} width={avatarSize} height={avatarSize} alt="" style={{ objectFit: "cover" }} /> : initials}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: story ? "center" : "flex-start", maxWidth: story ? 900 : 760, textAlign: story ? "center" : "left" }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: c.accent }}>MAWHIBA</div>
          <div style={{ display: "flex", fontSize: story ? 84 : 68, fontWeight: 700, lineHeight: 1.05 }}>{coach.profile.full_name}</div>
          <div style={{ display: "flex", fontSize: 34, opacity: 0.85, marginTop: 8 }}>{[sport, coach.profile.city].filter(Boolean).join(" · ")}</div>
          {coach.tagline && <div style={{ display: "flex", fontSize: 30, marginTop: 16, opacity: 0.95 }}>« {coach.tagline} »</div>}
          <div style={{ display: "flex", gap: 20, marginTop: 32 }}>
            {stats.map(([label, value]) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 26px", borderRadius: 24, background: `${c.primaryForeground}1f` }}>
                <div style={{ display: "flex", fontSize: 46, fontWeight: 700 }}>{value}</div>
                <div style={{ display: "flex", fontSize: 20, opacity: 0.75, textTransform: "uppercase" }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            {badges.map((b) => (
              <div key={b} style={{ display: "flex", padding: "8px 20px", borderRadius: 999, background: c.accent, color: c.accentForeground, fontSize: 24, fontWeight: 700 }}>{b}</div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width, height,
      headers: {
        "Cache-Control": "public, max-age=3600",
        ...(url.searchParams.get("download") ? { "Content-Disposition": `attachment; filename="carte-mawhiba-${coach.slug}.png"` } : {}),
      },
    },
  );
}
