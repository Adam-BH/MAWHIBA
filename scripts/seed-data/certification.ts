import { INCLUSIVE_CERT_SLUG } from "../../src/lib/config";

export const INCLUSIVE_CERTIFICATION = {
  slug: INCLUSIVE_CERT_SLUG,
  title: "Initiation au coaching inclusif (autisme)",
  description:
    "Cinq leçons courtes pour accueillir sereinement les enfants et adultes autistes en séance, puis un quiz de validation. Réussite : 4 bonnes réponses sur 5.",
  pass_score: 4,
  lessons: [
    {
      title: "Routine et prévisibilité",
      body: [
        "Beaucoup de personnes autistes se sentent en sécurité quand elles savent ce qui va se passer. Une séance prévisible réduit l'anxiété et libère de l'énergie pour apprendre.",
        "Gardez la même structure à chaque séance : accueil, échauffement, exercice principal, retour au calme. Annoncez les transitions quelques minutes à l'avance (« encore deux longueurs, puis on change »).",
        "Si un changement est inévitable (lieu, horaire, exercice), prévenez le plus tôt possible et expliquez simplement pourquoi.",
      ],
    },
    {
      title: "Communication claire et visuelle",
      body: [
        "Utilisez des phrases courtes, concrètes et une consigne à la fois. Évitez l'ironie, les sous-entendus et les expressions imagées qui peuvent être prises au pied de la lettre.",
        "Montrez plutôt que d'expliquer : démonstration, pictogrammes, planning visuel de la séance sur une feuille ou un téléphone.",
        "Laissez du temps pour répondre. Le silence n'est pas un refus : la personne traite peut-être l'information.",
      ],
    },
    {
      title: "Sensorialité",
      body: [
        "Bruits, lumières, contacts physiques, odeurs de chlore… certaines sensations peuvent être très inconfortables. Demandez à l'avance ce qui gêne ou rassure.",
        "Choisissez si possible des créneaux calmes, prévoyez un coin de retrait et autorisez casque anti-bruit, lunettes ou vêtements adaptés.",
        "Demandez toujours avant de toucher, par exemple pour corriger une posture, et proposez une alternative visuelle.",
      ],
    },
    {
      title: "Adapter les exercices",
      body: [
        "Découpez chaque geste en petites étapes et valorisez chaque réussite de façon concrète (« ton bras était bien tendu »).",
        "Appuyez-vous sur les centres d'intérêt de la personne pour motiver : compter, chronométrer, collectionner des défis.",
        "Prévoyez des pauses régulières et acceptez qu'une séance soit plus courte. La régularité compte davantage que l'intensité.",
      ],
    },
    {
      title: "Travailler avec les parents",
      body: [
        "Les parents et aidants sont des experts de leur enfant. Avant la première séance, échangez sur ses besoins, ses signaux de stress et ce qui l'apaise.",
        "Faites un retour court et factuel après chaque séance : ce qui a bien marché, ce que vous essaierez la prochaine fois.",
        "Respectez la confidentialité et le rythme de la famille. La note de réservation (« besoins particuliers ») est un bon point de départ.",
      ],
    },
  ],
  quiz: [
    {
      question: "Comment annoncer un changement d'exercice ?",
      options: ["Sans prévenir, pour garder l'effet de surprise", "Quelques minutes à l'avance, simplement", "Seulement si la personne le demande"],
    },
    {
      question: "Quelle consigne est la plus adaptée ?",
      options: ["« Fais comme tu le sens »", "« Bras tendus, puis on souffle »", "« Vas-y, tu connais la chanson ! »"],
    },
    {
      question: "Avant de corriger une posture en touchant la personne, je…",
      options: ["demande d'abord son accord", "agis vite pour ne pas la gêner", "laisse un autre élève le faire"],
    },
    {
      question: "Une séance est plus courte que prévu à cause de la fatigue. C'est…",
      options: ["un échec à éviter absolument", "acceptable : la régularité compte davantage", "une raison d'arrêter le suivi"],
    },
    {
      question: "Qui connaît le mieux les besoins de l'enfant au départ ?",
      options: ["Le coach", "Les autres parents du club", "Ses parents ou aidants"],
    },
  ],
  answer_key: [1, 1, 0, 1, 2],
};
