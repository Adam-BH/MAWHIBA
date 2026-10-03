import type { Database } from "../../src/lib/supabase/database.types";

type Level = Database["public"]["Enums"]["achievement_level"];
/** [year, title, competition, level, result] */
export type CvLine = [number, string, string, Level, string];

export type SeedCoach = {
  email: string;
  name: string;
  city: string;
  sports: string[];
  price: number;
  headline: string;
  achievements: string;
  bio: string;
  club?: string;
  cv?: CvLine[];
  inclusive?: boolean;
};

export const DEMO_COACH: SeedCoach = {
  email: "coach@mawhiba.tn",
  name: "Amira Ben Salah",
  city: "La Marsa",
  sports: ["Natation"],
  price: 40, // = cheapest of her offers ("à partir de")
  headline: "Nageuse de l'équipe nationale, coach bienveillante",
  achievements: "Équipe nationale de natation (2016-2022) · Médaillée d'or aux Jeux panarabes 2019 (200 m dos)",
  bio: "J'accompagne enfants et adultes, du premier plongeon au perfectionnement technique. Séances adaptées aux profils neuro-atypiques.",
  inclusive: true,
};

const c = (
  slug: string, name: string, city: string, sports: string[], price: number,
  headline: string, bio: string, club: string, cv: CvLine[], inclusive = false,
): SeedCoach => ({
  email: `${slug}@coach.mawhiba.tn`, name, city, sports, price, headline, bio, club, cv, inclusive,
  achievements: cv.map(([, title]) => title).join(" · "),
});

export const VERIFIED_COACHES: SeedCoach[] = [
  c("youssef.trabelsi", "Youssef Trabelsi", "Tunis", ["Football"], 50, "Ex-milieu de l'Espérance, technique & tactique",
    "Formé à l'Espérance, j'ai joué trois saisons en Ligue 1 avant une blessure au genou. Je travaille surtout avec les 10-16 ans : conduite de balle, jeu sans ballon, prise d'information. Chaque séance part d'une situation de match.",
    "École de football Ennasr", [
      [2014, "Champion de Tunisie U19", "Championnat national U19", "national", "Titre"],
      [2016, "Trois saisons en Ligue 1", "Ligue 1 tunisienne", "national", "41 matchs"],
    ]),
  c("sarra.jaziri", "Sarra Jaziri", "Ariana", ["Tennis"], 70, "Tennis loisir et compétition",
    "Classée dans le top 10 national pendant mes études, j'enseigne depuis cinq ans au Tennis Club d'Ariana. J'aime reprendre les bases avec les adultes qui ont arrêté longtemps : revers, placement, endurance.",
    "Tennis Club d'Ariana", [
      [2018, "Championne universitaire", "Championnat universitaire de Tunisie", "national", "1re place"],
      [2017, "Top 10 national", "Classement FTT", "national", "8e"],
    ]),
  c("mehdi.hammami", "Mehdi Hammami", "Sousse", ["Boxe", "Fitness"], 40, "Boxe éducative et condition physique",
    "Je fais découvrir la boxe sans prendre de coups : travail aux pattes d'ours, corde, déplacements. C'est un excellent moyen de se remettre en forme et de gagner en confiance. Débutants bienvenus, gants fournis.",
    "Boxing Club Sahel", [
      [2019, "Champion régional du Sahel (-75 kg)", "Championnat régional", "regional", "Titre"],
      [2017, "Sélection nationale junior", "Tournoi international de Tunis", "international", "Quart de finale"],
    ]),
  c("ines.gharbi", "Ines Gharbi", "Sfax", ["Athlétisme"], 35, "Sprint et préparation physique",
    "Ancienne spécialiste du 400 m, je prépare des sprinteurs mais aussi des joueurs de sports collectifs qui veulent gagner en vitesse. J'accompagne aussi des jeunes autistes : séances en petits blocs, toujours dans le même ordre.",
    "Club Sportif Sfaxien", [
      [2019, "Vice-championne de Tunisie du 400 m", "Championnats de Tunisie élite", "national", "2e place"],
      [2018, "Relais 4×400 m", "Jeux méditerranéens", "international", "Finaliste"],
    ], true),
  c("karim.bouazizi", "Karim Bouazizi", "Monastir", ["Natation"], 55, "Natation sportive, toutes nages",
    "Nageur de l'équipe nationale junior, spécialiste du papillon. J'entraîne des nageurs de club qui préparent des compétitions et des adultes qui veulent enfin nager un crawl propre. Vidéo sous-marine possible.",
    "Club de natation de Monastir", [
      [2015, "Record régional 100 m papillon", "Meeting de Monastir", "regional", "Record"],
      [2014, "Équipe nationale junior", "Championnats d'Afrique juniors", "international", "Finaliste"],
    ]),
  c("nour.mansour", "Nour Mansour", "La Marsa", ["Yoga", "Fitness"], 30, "Yoga dynamique et mobilité",
    "Ex-gymnaste, je suis passée au yoga après une blessure au dos. Mes cours mélangent mobilité, respiration et renforcement doux. Idéal si vous passez vos journées assis. J'adapte les postures à chaque corps.",
    "Studio Mansour Yoga", [
      [2012, "Sélection régionale de gymnastique", "Championnat régional de Tunis", "regional", "3e au sol"],
    ], true),
  c("aymen.chaabane", "Aymen Chaabane", "Ben Arous", ["Basketball"], 45, "Basket : shoot, dribble, lecture du jeu",
    "Meneur au Club Africain pendant six saisons. En séance individuelle, on décortique le shoot et on travaille le dribble sous pression. Pour les ados qui visent une sélection, je prépare aussi les tests physiques.",
    "Club Africain (jeunes)", [
      [2013, "Équipe nationale U20", "Afrobasket U20", "international", "4e place"],
      [2016, "Vainqueur de la Coupe de Tunisie", "Coupe de Tunisie", "national", "Titre"],
    ]),
  c("rania.khelifi", "Rania Khelifi", "Nabeul", ["Volleyball"], 35, "Volley-ball en salle et beach",
    "Championne de Tunisie de beach-volley, je donne mes séances sur la plage de Nabeul l'été et en salle l'hiver. Réception, passe, smash : on progresse vite à deux ou en petit groupe.",
    "Nabeul Beach Volley", [
      [2021, "Championne de Tunisie de beach-volley", "Championnat national de beach-volley", "national", "Titre"],
      [2019, "Tournoi arabe de beach-volley", "Championnat arabe", "international", "Bronze"],
    ]),
  c("hamza.saidi", "Hamza Saïdi", "Bizerte", ["Taekwondo"], 40, "Taekwondo enfants et ados",
    "Ceinture noire 3e dan, j'enseigne aux enfants à partir de 6 ans. Le taekwondo leur apprend la concentration, le respect et la coordination. Préparation aux passages de grades et aux compétitions.",
    "Association Taekwondo Bizerte", [
      [2018, "Médaille de bronze", "Championnats d'Afrique", "international", "3e place"],
      [2017, "Champion de Tunisie (-68 kg)", "Championnat national", "national", "Titre"],
    ]),
  c("yasmine.ferchichi", "Yasmine Ferchichi", "Tunis", ["Judo"], 45, "Judo et self-défense",
    "Membre de l'équipe nationale en -57 kg pendant sept ans. Je donne des cours de judo pour enfants et des stages de self-défense pour femmes : chutes, dégagements, gestion du stress.",
    "Judo Club El Menzah", [
      [2020, "Championne arabe (-57 kg)", "Championnats arabes", "international", "Titre"],
      [2018, "Championne de Tunisie (-57 kg)", "Championnat national", "national", "Titre"],
    ]),
  c("omar.belhadj", "Omar Belhadj", "Sousse", ["Handball"], 40, "Handball : gardien et arrière",
    "Gardien puis arrière à l'Étoile du Sahel. Je fais des séances spécifiques gardiens (réflexes, placement) et du travail de tir pour les arrières. Je suis aussi les jeunes de 12 à 18 ans en club.",
    "Étoile du Sahel (centre de formation)", [
      [2015, "Champion d'Afrique des clubs", "Ligue des champions d'Afrique", "international", "Titre"],
      [2014, "Champion de Tunisie", "Championnat national", "national", "Titre"],
    ]),
  c("salma.riahi", "Salma Riahi", "Ariana", ["Fitness"], 30, "Renforcement et remise en forme",
    "Diplômée de l'ISSEP, je construis des programmes simples à suivre : trois séances par semaine, du poids du corps aux haltères. Beaucoup de mamans après grossesse et de personnes qui reprennent le sport.",
    "Salle Fit'Ariana", [
      [2019, "Finaliste ligue universitaire de crossfit", "Ligue universitaire", "national", "5e place"],
    ]),
  c("bilel.jendoubi", "Bilel Jendoubi", "Sfax", ["Football", "Fitness"], 35, "Préparation physique du footballeur",
    "Quatre saisons en Ligue 2, puis préparateur physique. Je prépare les joueurs à la reprise : vitesse, explosivité, prévention des blessures. Séances sur terrain avec ballon dès que possible.",
    "Club Sportif Sfaxien (préformation)", [
      [2017, "Quatre saisons en Ligue 2", "Ligue 2 tunisienne", "national", "Capitaine en 2017"],
      [2013, "Champion régional de Sfax", "Championnat régional", "regional", "Titre"],
    ]),
  c("asma.dridi", "Asma Dridi", "Monastir", ["Tennis"], 80, "Tennis haute performance",
    "Ancienne joueuse du circuit ITF, j'entraîne des juniors qui visent les classements nationaux. Planification, analyse vidéo des matchs, préparation mentale. Exigeante, mais toujours à l'écoute.",
    "Académie de tennis de Monastir", [
      [2015, "Championne de Tunisie", "Championnats de Tunisie seniors", "national", "Titre"],
      [2014, "Circuit ITF", "ITF Women's Circuit", "international", "Meilleur classement : 612e"],
    ]),
  c("walid.zouari", "Walid Zouari", "Tunis", ["Athlétisme", "Fitness"], 40, "Course à pied, du 5 km au semi",
    "Je prépare des coureurs du dimanche à leur premier 10 km ou semi-marathon. Plan sur 8 à 12 semaines, séances au parc du Belvédère, travail d'allure et de posture. Pas besoin d'être rapide pour commencer.",
    "Running Club Belvédère", [
      [2016, "Champion de Tunisie de cross universitaire", "Cross universitaire national", "national", "Titre"],
      [2022, "Semi-marathon de Carthage", "Semi-marathon de Carthage", "local", "1 h 12"],
    ]),
];

const pending = (slug: string, name: string, city: string, sport: string, price: number, headline: string, bio: string): SeedCoach =>
  ({ email: `${slug}@coach.mawhiba.tn`, name, city, sports: [sport], price, headline, bio, achievements: "" });

export const PENDING_COACHES: SeedCoach[] = [
  pending("firas.lamine", "Firas Lamine", "Tunis", "Boxe", 45, "Boxe anglaise",
    "Champion régional de Tunis en 2022, je donne des cours de boxe anglaise technique, du débutant au compétiteur amateur."),
  pending("hela.ben.amor", "Hela Ben Amor", "Nabeul", "Natation", 40, "Natation pour enfants",
    "Maître-nageuse l'été à Hammamet, j'apprends aux enfants à nager en confiance dès 4 ans."),
  pending("anis.messaoudi", "Anis Messaoudi", "Sousse", "Basketball", 50, "Basket jeunes",
    "Ancien sélectionné U18, j'entraîne les jeunes sur les fondamentaux : dribble, passe, shoot."),
];

export const EXTRA_CLIENTS = [
  { email: "leila.client@mawhiba.tn", name: "Leila Mejri", city: "Tunis" },
  { email: "sami.client@mawhiba.tn", name: "Sami Ayari", city: "Sousse" },
  { email: "maryem.client@mawhiba.tn", name: "Maryem Kefi", city: "Ariana" },
  { email: "nizar.client@mawhiba.tn", name: "Nizar Hamdi", city: "Sfax" },
  { email: "dorra.client@mawhiba.tn", name: "Dorra Snoussi", city: "La Marsa" },
];

export const REVIEW_COMMENTS = [
  "Séance top, très pédagogue et à l'écoute.",
  "Excellent coach, mon fils a adoré !",
  "Beaucoup de professionnalisme, exercices adaptés à mon niveau.",
  "Super ambiance, j'ai beaucoup progressé en une séance.",
  "Ponctualité, motivation et plein de bons conseils.",
  "Patience et pédagogie, je recommande vivement.",
  "Bonne séance, un peu courte mais efficace.",
  "Beaucoup de passion, on sent l'expérience du haut niveau.",
  "Ma fille attend la séance du samedi toute la semaine.",
  "Des conseils concrets que je peux refaire seul entre deux séances.",
  "Séance exigeante mais toujours bienveillante.",
  "Très bon suivi, avec un plan à refaire après la séance.",
];

export const LOCATIONS: Record<string, string> = {
  Natation: "Piscine olympique de Radès",
  Football: "Stade municipal",
  Tennis: "Club de tennis",
  Basketball: "Salle omnisports",
  Default: "Complexe sportif",
};
