import { Document, Font, Image, Page, Text, View } from "@react-pdf/renderer";
import { Achievements, Activity, BookLink, Certifications, Education, Experience, SectionTitle, styles, type Labels } from "@/features/cv/pdf/cv-blocks";
import { THEME } from "@/features/cv/pdf/theme";
import type { CoachFull } from "@/features/cv/queries";
import type { CvTemplate } from "@/lib/config";

Font.register({
  family: THEME.fonts.family,
  fonts: [
    { src: THEME.fonts.files.regular },
    { src: THEME.fonts.files.bold, fontWeight: "bold" },
  ],
});
Font.registerHyphenationCallback((word) => [word]);

const c = THEME.colors;

type Props = { coach: CoachFull; template: CvTemplate; qr: string; t: Labels; urls: { cv: string; profile: string }; generated: string };

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function Avatar({ name, size, dark }: { name: string; size: number; dark: boolean }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: dark ? c.accent : c.primary, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: size / 2.6, fontWeight: "bold", color: dark ? c.accentForeground : c.primaryForeground }}>{initials(name)}</Text>
    </View>
  );
}

function headline(coach: CoachFull, t: Labels) {
  return [coach.primary_sport ?? coach.sports[0], coach.profile.city, coach.highest_level && t(`levels.${coach.highest_level}`)].filter(Boolean).join(" · ");
}

function Footer({ qr, t, generated, urls, light, size = 70 }: Pick<Props, "qr" | "t" | "generated" | "urls"> & { light?: boolean; size?: number }) {
  return (
    <View style={{ alignItems: "center" }}>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image, not an HTML img */}
      <Image src={qr} style={{ width: size, height: size }} />
      <Text style={{ fontSize: 7, textAlign: "center", color: light ? c.primaryForeground : c.mutedForeground, marginTop: 2 }}>
        {t("qrHint")}{"\n"}{t("generated", { date: generated })}{"\n"}{urls.cv.replace(/^https?:\/\//, "")}
      </Text>
    </View>
  );
}

function Modern({ coach, qr, t, urls, generated }: Props) {
  return (
    <Page size="A4" style={[styles.page, { flexDirection: "row" }]}>
      <View style={{ width: 190, backgroundColor: c.primary, color: c.primaryForeground, padding: 22, justifyContent: "space-between" }}>
        <View>
          <Avatar name={coach.profile.full_name} size={86} dark />
          <Activity coach={coach} t={t} onDark />
          <Certifications coach={coach} t={t} onDark />
          {coach.languages.length > 0 && <View><SectionTitle color={c.primaryForeground}>{t("languages")}</SectionTitle><Text>{coach.languages.join(" · ")}</Text></View>}
          {coach.specialties.length > 0 && <View><SectionTitle color={c.primaryForeground}>{t("specialties")}</SectionTitle><Text>{coach.specialties.join(" · ")}</Text></View>}
        </View>
        <Footer qr={qr} t={t} generated={generated} urls={urls} light />
      </View>
      <View style={{ flex: 1, padding: 28 }}>
        <Text style={[styles.h1, { color: c.primary }]}>{coach.profile.full_name}</Text>
        {coach.tagline ? <Text style={styles.tagline}>{coach.tagline}</Text> : null}
        <Text style={[styles.muted, { marginTop: 4 }]}>{headline(coach, t)}</Text>
        <BookLink url={urls.profile} label={t("bookOn")} />
        {coach.bio ? <View><SectionTitle>{t("summary")}</SectionTitle><Text>{coach.bio}</Text></View> : null}
        <Achievements coach={coach} t={t} />
        <Experience coach={coach} t={t} />
        <Education coach={coach} t={t} />
      </View>
    </Page>
  );
}

function Classic({ coach, qr, t, urls, generated }: Props) {
  return (
    <Page size="A4" style={[styles.page, { paddingHorizontal: 40, paddingVertical: 32 }]}>
      <View style={{ alignItems: "center", borderBottomWidth: 1, borderBottomColor: c.border, paddingBottom: 10 }}>
        <Text style={[styles.h1, { color: c.foreground }]}>{coach.profile.full_name}</Text>
        {coach.tagline ? <Text style={styles.tagline}>{coach.tagline}</Text> : null}
        <Text style={[styles.muted, { marginTop: 4 }]}>{headline(coach, t)}</Text>
        <BookLink url={urls.profile} label={t("bookOn")} center />
      </View>
      {coach.bio ? <View><SectionTitle>{t("summary")}</SectionTitle><Text>{coach.bio}</Text></View> : null}
      <Achievements coach={coach} t={t} />
      <Experience coach={coach} t={t} />
      <Education coach={coach} t={t} />
      <Certifications coach={coach} t={t} />
      <View style={{ flexDirection: "row", gap: 20 }} wrap={false}>
        <View style={{ flex: 1 }}><Activity coach={coach} t={t} /></View>
        <View style={{ flex: 1 }}>
          {coach.languages.length > 0 && <View><SectionTitle>{t("languages")}</SectionTitle><Text>{coach.languages.join(" · ")}</Text></View>}
          {coach.specialties.length > 0 && <View><SectionTitle>{t("specialties")}</SectionTitle><Text>{coach.specialties.join(" · ")}</Text></View>}
        </View>
        <View style={{ width: 120, paddingTop: 10 }}><Footer qr={qr} t={t} generated={generated} urls={urls} size={56} /></View>
      </View>
    </Page>
  );
}

/** A4 CV, same content as the web CV. */
export function CvDocument(props: Props) {
  return (
    <Document title={`CV MAWHIBA · ${props.coach.profile.full_name}`} author="MAWHIBA" language="fr">
      {props.template === "classique" ? <Classic {...props} /> : <Modern {...props} />}
    </Document>
  );
}
