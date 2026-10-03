export type SeedCoach = {
  email: string;
  name: string;
  city: string;
  sports: string[];
  price: number;
  headline: string;
  achievements: string;
  bio: string;
  inclusive?: boolean;
};

export const DEMO_COACH: SeedCoach = {
  email: "coach@mawhiba.tn",
  name: "Amira Ben Salah",
  city: "La Marsa",
  sports: ["Natation"],
  price: 40, // = cheapest of her offers ("à partir de")
  headline: "Nageuse de l'équipe nationale, coach bienveillante",
  achievements: "Équipe nationale de natation (2016–2022) · Médaillée d'or aux Jeux panarabes 2019 (200 m dos)",
  bio: "J'accompagne enfants et adultes, du premier plongeon au perfectionnement technique. Séances adaptées aux profils neuro-atypiques.",
  inclusive: true,
};

const c = (
  slug: string, name: string, city: string, sports: string[], price: number,
  headline: string, achievements: string, inclusive = false,
): SeedCoach => ({
  email: `${slug}@coach.mawhiba.tn`, name, city, sports, price, headline, achievements, inclusive,
  bio: `Ancien(ne) athlète de haut niveau, je transmets ma passion du ${sports[0].toLowerCase()} avec méthode et bonne humeur. Tous niveaux bienvenus.`,
});

export const VERIFIED_COACHES: SeedCoach[] = [
  c("youssef.trabelsi", "Youssef Trabelsi", "Tunis", ["Football"], 50, "Ex-milieu de l'Espérance, technique & tactique", "Champion de Tunisie U19 · 3 saisons en Ligue 1"),
  c("sarra.jaziri", "Sarra Jaziri", "Ariana", ["Tennis"], 70, "Tennis loisir et compétition", "Classée top 10 nationale · Championne universitaire 2018"),
  c("mehdi.hammami", "Mehdi Hammami", "Sousse", ["Boxe", "Fitness"], 40, "Boxe éducative et condition physique", "Champion régional du Sahel (–75 kg) · Sélection nationale junior"),
  c("ines.gharbi", "Ines Gharbi", "Sfax", ["Athlétisme"], 35, "Sprint et préparation physique", "Vice-championne de Tunisie du 400 m · Ligue universitaire", true),
  c("karim.bouazizi", "Karim Bouazizi", "Monastir", ["Natation"], 55, "Natation sportive, toutes nages", "Équipe nationale junior · Record régional 100 m papillon"),
  c("nour.mansour", "Nour Mansour", "La Marsa", ["Yoga", "Fitness"], 30, "Yoga dynamique et mobilité", "Professeure certifiée 500 h · Ex-gymnaste de la sélection régionale", true),
  c("aymen.chaabane", "Aymen Chaabane", "Ben Arous", ["Basketball"], 45, "Basket : shoot, dribble, lecture du jeu", "Ex-meneur du Club Africain · Équipe nationale U20"),
  c("rania.khelifi", "Rania Khelifi", "Nabeul", ["Volleyball"], 35, "Volley-ball en salle et beach", "Championne de Tunisie de beach-volley 2021"),
  c("hamza.saidi", "Hamza Saïdi", "Bizerte", ["Taekwondo"], 40, "Taekwondo enfants et ados", "Ceinture noire 3e dan · Médaillé de bronze aux championnats d'Afrique"),
  c("yasmine.ferchichi", "Yasmine Ferchichi", "Tunis", ["Judo"], 45, "Judo et self-défense", "Équipe nationale de judo (–57 kg) · Championne arabe 2020"),
  c("omar.belhadj", "Omar Belhadj", "Sousse", ["Handball"], 40, "Handball : gardien et arrière", "Ex-joueur de l'Étoile du Sahel · Champion d'Afrique des clubs"),
  c("salma.riahi", "Salma Riahi", "Ariana", ["Fitness"], 30, "Renforcement et remise en forme", "Coach diplômée ISSEP · Ligue universitaire de crossfit"),
  c("bilel.jendoubi", "Bilel Jendoubi", "Sfax", ["Football", "Fitness"], 35, "Préparation physique du footballeur", "Champion régional de Sfax · Ligue 2 pendant 4 saisons"),
  c("asma.dridi", "Asma Dridi", "Monastir", ["Tennis"], 80, "Tennis haute performance", "Ex-joueuse du circuit ITF · Championne de Tunisie 2015"),
  c("walid.zouari", "Walid Zouari", "Tunis", ["Athlétisme", "Fitness"], 40, "Course à pied, du 5 km au semi", "Champion de Tunisie de cross universitaire"),
];

export const PENDING_COACHES: SeedCoach[] = [
  c("firas.lamine", "Firas Lamine", "Tunis", ["Boxe"], 45, "Boxe anglaise", "Champion régional de Tunis 2022"),
  c("hela.ben.amor", "Hela Ben Amor", "Nabeul", ["Natation"], 40, "Natation pour enfants", "Ligue universitaire de natation"),
  c("anis.messaoudi", "Anis Messaoudi", "Sousse", ["Basketball"], 50, "Basket jeunes", "Équipe nationale U18"),
];

export const EXTRA_CLIENTS = [
  { email: "leila.client@mawhiba.tn", name: "Leila Mejri", city: "Tunis", balance: 80 },
  { email: "sami.client@mawhiba.tn", name: "Sami Ayari", city: "Sousse", balance: 120 },
  { email: "maryem.client@mawhiba.tn", name: "Maryem Kefi", city: "Ariana", balance: 60 },
  { email: "nizar.client@mawhiba.tn", name: "Nizar Hamdi", city: "Sfax", balance: 200 },
  { email: "dorra.client@mawhiba.tn", name: "Dorra Snoussi", city: "La Marsa", balance: 95 },
];

export const REVIEW_COMMENTS = [
  "Séance top, très pédagogue et à l'écoute.",
  "Excellent coach, mon fils a adoré !",
  "Très professionnel, exercices adaptés à mon niveau.",
  "Super ambiance, j'ai beaucoup progressé en une séance.",
  "Ponctuel, motivant et plein de bons conseils.",
  "Patiente et rassurante, je recommande vivement.",
  "Bonne séance, un peu courte mais efficace.",
  "Un vrai passionné, on sent l'expérience du haut niveau.",
];

export const LOCATIONS: Record<string, string> = {
  Natation: "Piscine olympique de Radès",
  Football: "Stade municipal",
  Tennis: "Club de tennis",
  Basketball: "Salle omnisports",
  Default: "Complexe sportif",
};
