import { Link, StyleSheet, Text, View } from "@react-pdf/renderer";
import { THEME } from "@/features/cv/pdf/theme";
import type { CoachFull } from "@/features/cv/queries";

const c = THEME.colors;

export const styles = StyleSheet.create({
  page: { fontFamily: THEME.fonts.family, fontSize: 9.5, color: c.foreground, lineHeight: 1.4 },
  h1: { fontSize: 24, fontWeight: "bold", lineHeight: 1.2 },
  tagline: { fontSize: 11, marginTop: 4, lineHeight: 1.3 },
  sectionTitle: { fontSize: 9, fontWeight: "bold", letterSpacing: 1.2, textTransform: "uppercase", color: c.primary,
    borderBottomWidth: 1.5, borderBottomColor: c.accent, paddingBottom: 2, marginBottom: 4, marginTop: 9 },
  row: { flexDirection: "row", marginBottom: 4 },
  year: { width: 34, fontWeight: "bold", color: c.primary },
  bold: { fontWeight: "bold" },
  muted: { color: c.mutedForeground },
  verified: { color: c.success, fontSize: 8, fontWeight: "bold" },
  chip: { fontSize: 8, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 8, marginRight: 4, marginBottom: 4 },
  cta: { fontFamily: THEME.fonts.family, marginTop: 8, fontSize: 9, fontWeight: "bold", color: c.accentForeground, backgroundColor: c.accent,
    paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10, alignSelf: "flex-start", textDecoration: "none" },
});

export type Labels = (key: string, values?: Record<string, string | number>) => string;

export function SectionTitle({ children, color }: { children: string; color?: string }) {
  return <Text style={[styles.sectionTitle, color ? { color, borderBottomColor: c.accent } : {}]}>{children}</Text>;
}

export function Achievements({ coach, t }: { coach: CoachFull; t: Labels }) {
  if (!coach.achievements.length) return null;
  return (
    <View>
      <SectionTitle>{t("achievements")}</SectionTitle>
      {coach.achievements.map((a) => (
        <View key={a.id} style={styles.row} wrap={false}>
          <Text style={styles.year}>{a.year}</Text>
          <View style={{ flex: 1 }}>
            <Text>
              <Text style={styles.bold}>{a.title}</Text>{a.result ? ` — ${a.result}` : ""}
              {a.verified ? <Text style={styles.verified}>  · {t("verified")}</Text> : null}
            </Text>
            {a.competition ? <Text style={styles.muted}>{a.competition} · {t(`levels.${a.level}`)}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

export function Experience({ coach, t }: { coach: CoachFull; t: Labels }) {
  if (!coach.experiences.length) return null;
  return (
    <View>
      <SectionTitle>{t("experience")}</SectionTitle>
      {coach.experiences.map((e) => (
        <View key={e.id} style={{ marginBottom: 6 }} wrap={false}>
          <Text><Text style={styles.bold}>{e.role}</Text> · {e.organization}
            <Text style={styles.muted}>  ({e.start_date.slice(0, 4)} – {e.end_date ? e.end_date.slice(0, 4) : t("today")})</Text></Text>
          {e.description ? <Text style={styles.muted}>{e.description}</Text> : null}
        </View>
      ))}
    </View>
  );
}

export function Education({ coach, t }: { coach: CoachFull; t: Labels }) {
  if (!coach.education.length) return null;
  return (
    <View>
      <SectionTitle>{t("education")}</SectionTitle>
      {coach.education.map((e) => <Text key={e.id}><Text style={styles.bold}>{e.degree}</Text> · {e.school} ({e.year})</Text>)}
    </View>
  );
}

export function Certifications({ coach, t, onDark = false }: { coach: CoachFull; t: Labels; onDark?: boolean }) {
  if (!coach.stats.badges.length && !coach.certifications.length) return null;
  const sub = onDark ? { color: c.primaryForeground, opacity: 0.8 } : styles.muted;
  return (
    <View>
      <SectionTitle color={onDark ? c.primaryForeground : undefined}>{t("certifications")}</SectionTitle>
      {coach.stats.badges.map((b) => (
        <View key={b.slug} style={{ marginBottom: 4 }}>
          <Text style={styles.bold}>{b.title}</Text>
          <Text style={[styles.verified, onDark ? { color: c.accent } : {}]}>{t("issuedByMawhibaShort")}</Text>
        </View>
      ))}
      {coach.certifications.map((x) => (
        <View key={x.id} style={{ marginBottom: 4 }}>
          <Text style={styles.bold}>{x.title}{x.verified ? ` · ${t("verified")}` : ""}</Text>
          <Text style={sub}>{x.issuer} · {x.year}</Text>
        </View>
      ))}
    </View>
  );
}

export function Activity({ coach, t, onDark = false }: { coach: CoachFull; t: Labels; onDark?: boolean }) {
  const s = coach.stats;
  return (
    <View>
      <SectionTitle color={onDark ? c.primaryForeground : undefined}>{t("activity")}</SectionTitle>
      <Text>{t("sessions", { count: s.completedSessions })}</Text>
      <Text>{t("clients", { count: s.distinctClients })}</Text>
      <Text>{s.ratingCount ? t("rating", { rating: s.ratingAvg.toFixed(1), count: s.ratingCount }) : t("noRating")}</Text>
      <Text style={[styles.verified, onDark ? { color: c.accent } : {}]}>{t("verifiedData")}</Text>
    </View>
  );
}

export function BookLink({ url, label, center = false }: { url: string; label: string; center?: boolean }) {
  return <Link src={url} style={[styles.cta, center ? { alignSelf: "center" } : {}]}>{label}</Link>;
}
