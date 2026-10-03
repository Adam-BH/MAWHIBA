-- Formations (certifications) ship with the schema so production has them;
-- the dev seed no longer inserts them. Idempotent: re-running updates content by slug.

insert into public.certifications (slug, title, description, lessons, quiz, answer_key, pass_score) values
(
  'coaching-inclusif-autisme',
  $t$Initiation au coaching inclusif (autisme)$t$,
  $t$Cinq leçons courtes pour accueillir sereinement les enfants et adultes autistes en séance, puis un quiz de validation. Réussite : 4 bonnes réponses sur 5.$t$,
  $j$[
    {"title": "Routine et prévisibilité", "body": [
      "Beaucoup de personnes autistes se sentent en sécurité quand elles savent ce qui va se passer. Une séance prévisible réduit l'anxiété et libère de l'énergie pour apprendre.",
      "Gardez la même structure à chaque séance : accueil, échauffement, exercice principal, retour au calme. Annoncez les transitions quelques minutes à l'avance (« encore deux longueurs, puis on change »).",
      "Si un changement est inévitable (lieu, horaire, exercice), prévenez le plus tôt possible et expliquez simplement pourquoi."
    ]},
    {"title": "Communication claire et visuelle", "body": [
      "Utilisez des phrases courtes, concrètes et une consigne à la fois. Évitez l'ironie, les sous-entendus et les expressions imagées qui peuvent être prises au pied de la lettre.",
      "Montrez plutôt que d'expliquer : démonstration, pictogrammes, planning visuel de la séance sur une feuille ou un téléphone.",
      "Laissez du temps pour répondre. Le silence n'est pas un refus : la personne traite peut-être l'information."
    ]},
    {"title": "Sensorialité", "body": [
      "Bruits, lumières, contacts physiques, odeurs de chlore… certaines sensations peuvent être très inconfortables. Demandez à l'avance ce qui gêne ou rassure.",
      "Choisissez si possible des créneaux calmes, prévoyez un coin de retrait et autorisez casque anti-bruit, lunettes ou vêtements adaptés.",
      "Demandez toujours avant de toucher, par exemple pour corriger une posture, et proposez une alternative visuelle."
    ]},
    {"title": "Adapter les exercices", "body": [
      "Découpez chaque geste en petites étapes et valorisez chaque réussite de façon concrète (« ton bras était bien tendu »).",
      "Appuyez-vous sur les centres d'intérêt de la personne pour motiver : compter, chronométrer, collectionner des défis.",
      "Prévoyez des pauses régulières et acceptez qu'une séance soit plus courte. La régularité compte davantage que l'intensité."
    ]},
    {"title": "Travailler avec les parents", "body": [
      "Les parents et aidants sont des experts de leur enfant. Avant la première séance, échangez sur ses besoins, ses signaux de stress et ce qui l'apaise.",
      "Faites un retour court et factuel après chaque séance : ce qui a bien marché, ce que vous essaierez la prochaine fois.",
      "Respectez la confidentialité et le rythme de la famille. La note de réservation (« besoins particuliers ») est un bon point de départ."
    ]}
  ]$j$::jsonb,
  $j$[
    {"question": "Comment annoncer un changement d'exercice ?", "options": ["Sans prévenir, pour garder l'effet de surprise", "Quelques minutes à l'avance, simplement", "Seulement si la personne le demande"]},
    {"question": "Quelle consigne est la plus adaptée ?", "options": ["« Fais comme tu le sens »", "« Bras tendus, puis on souffle »", "« Vas-y, tu connais la chanson ! »"]},
    {"question": "Avant de corriger une posture en touchant la personne, je…", "options": ["demande d'abord son accord", "agis vite pour ne pas la gêner", "laisse un autre élève le faire"]},
    {"question": "Une séance est plus courte que prévu à cause de la fatigue. C'est…", "options": ["un échec à éviter absolument", "acceptable : la régularité compte davantage", "une raison d'arrêter le suivi"]},
    {"question": "Qui connaît le mieux les besoins de l'enfant au départ ?", "options": ["Le coach", "Les autres parents du club", "Ses parents ou aidants"]}
  ]$j$::jsonb,
  '{1,1,0,1,2}'::int[],
  4
),
(
  'premiers-secours-seance',
  $t$Premiers secours en séance$t$,
  $t$Cinq leçons pour réagir calmement face à un malaise, une chute ou un coup de chaleur, et savoir quand appeler les secours. Réussite : 4 bonnes réponses sur 5.$t$,
  $j$[
    {"title": "Se préparer avant la séance", "body": [
      "Ayez toujours une trousse de secours à portée de main : compresses, désinfectant, pansements, bande de contention, poche de froid instantané, gants jetables et couverture de survie.",
      "Avant la première séance, demandez au client s'il a un problème de santé, une allergie ou un traitement à connaître (asthme, diabète, problème cardiaque).",
      "Gardez votre téléphone chargé et repérez l'adresse exacte du lieu pour pouvoir la donner aux secours sans hésiter."
    ]},
    {"title": "Réagir à un malaise", "body": [
      "Arrêtez immédiatement l'exercice. Allongez la personne ou faites-la asseoir, selon ce qui la soulage, et ne la laissez pas seule.",
      "Posez des questions simples : où a-t-elle mal, a-t-elle déjà eu ce malaise, prend-elle un traitement ? Ne donnez aucun médicament vous-même.",
      "Si la personne ne répond plus, respire mal, a une douleur dans la poitrine ou si le malaise ne passe pas en quelques minutes, appelez les secours."
    ]},
    {"title": "Chute, entorse : repos, glace, compression, élévation", "body": [
      "Après une chute, ne relevez pas la personne tout de suite. Laissez-la reprendre ses esprits et vérifiez qu'elle bouge normalement avant de l'aider.",
      "En cas d'entorse ou de choc sur un membre, appliquez le protocole : repos (arrêt de l'activité), glace (enveloppée dans un linge, 15 à 20 minutes), compression légère avec une bande, élévation du membre.",
      "Ne massez pas la zone et ne faites pas « marcher pour chauffer ». Une déformation, une douleur très vive ou l'impossibilité de poser le pied demandent un avis médical."
    ]},
    {"title": "Chaleur et hydratation", "body": [
      "En été, privilégiez les créneaux du matin ou du soir, faites des pauses à l'ombre et rappelez de boire régulièrement, avant d'avoir soif.",
      "Maux de tête, nausées, crampes et grande fatigue sont des signes d'alerte : arrêtez la séance, mettez la personne à l'ombre et faites-la boire par petites gorgées.",
      "Une peau très chaude, une confusion ou un arrêt de la transpiration peuvent signaler un coup de chaleur. Refroidissez la personne (linges mouillés, éventail) et appelez les secours sans attendre."
    ]},
    {"title": "Appeler les secours", "body": [
      "En Tunisie, composez le 190 pour le SAMU (urgence médicale) ou le 198 pour la Protection civile.",
      "Donnez votre nom, l'adresse précise, ce qui s'est passé, l'état de la personne (consciente, respire, saigne) et répondez aux questions. Ne raccrochez pas le premier.",
      "En attendant, restez auprès de la personne, couvrez-la si besoin et prévenez un proche. Après l'incident, notez ce qui s'est passé et informez le client ou sa famille."
    ]}
  ]$j$::jsonb,
  $j$[
    {"question": "Un client se tord la cheville. Que faites-vous en premier ?", "options": ["Le faire marcher pour « chauffer » l'articulation", "Repos, glace, compression, élévation", "Masser fortement la zone douloureuse"]},
    {"question": "Quel numéro composer pour joindre le SAMU en Tunisie ?", "options": ["190", "198", "Aucun, il faut se rendre aux urgences"]},
    {"question": "Par forte chaleur, un participant a la peau très chaude, semble confus et ne transpire plus. Vous…", "options": ["lui donnez une boisson sucrée et reprenez la séance", "le laissez se reposer seul au soleil", "le mettez à l'ombre, le refroidissez et appelez les secours"]},
    {"question": "Comment appliquer la glace sur une entorse ?", "options": ["Directement sur la peau pendant une heure", "Enveloppée dans un linge, 15 à 20 minutes", "Seulement le lendemain de la blessure"]},
    {"question": "Une personne fait un malaise mais reste consciente. Vous…", "options": ["l'allongez ou l'asseyez, la rassurez et restez avec elle", "lui faites reprendre l'exercice doucement pour voir", "lui donnez un médicament de votre trousse"]}
  ]$j$::jsonb,
  '{1,0,2,1,0}'::int[],
  4
),
(
  'coacher-les-enfants',
  $t$Coacher les enfants (6–12 ans)$t$,
  $t$Cinq leçons pour construire des séances adaptées aux enfants : attention, jeu, sécurité, encouragement et relation avec les parents. Réussite : 4 bonnes réponses sur 5.$t$,
  $j$[
    {"title": "Une attention courte", "body": [
      "Un enfant de 6 à 8 ans se concentre rarement plus de quelques minutes sur la même consigne. Prévoyez des exercices courts et changez d'activité souvent.",
      "Donnez une consigne à la fois, avec des mots simples, puis montrez le geste. Vérifiez la compréhension en demandant à un enfant de répéter.",
      "Rassemblez le groupe avec un signal toujours identique (sifflet, main levée) plutôt qu'en haussant la voix."
    ]},
    {"title": "Apprendre par le jeu", "body": [
      "Les enfants apprennent mieux quand ils jouent. Transformez les exercices techniques en défis, relais ou petites histoires (« traverser la rivière sans toucher l'eau »).",
      "Faites en sorte que chacun touche souvent le ballon ou bouge beaucoup : évitez les longues files d'attente et les jeux où l'on est éliminé tôt.",
      "Si un enfant échoue plusieurs fois, simplifiez l'exercice pour qu'il réussisse, puis augmentez la difficulté petit à petit."
    ]},
    {"title": "Sécurité", "body": [
      "Vérifiez le terrain et le matériel avant la séance : sol dégagé, buts fixés, matériel adapté à la taille des enfants. Prévoyez des pauses pour boire.",
      "Organisez les séances dans un lieu ouvert ou visible, avec un parent présent ou joignable. Évitez de vous retrouver seul avec un enfant à l'écart des regards.",
      "Notez à l'avance les allergies, problèmes de santé et le contact d'un parent. À la fin, ne laissez partir l'enfant qu'avec la personne prévue."
    ]},
    {"title": "Encourager sans comparer", "body": [
      "Félicitez l'effort et le geste précis plutôt que le résultat (« tu as bien gardé les yeux sur le ballon »).",
      "Ne comparez pas les enfants entre eux et ne corrigez jamais un enfant de façon humiliante devant le groupe. Une remarque discrète suffit.",
      "Terminez chaque séance sur une réussite, même petite. L'enfant doit avoir envie de revenir."
    ]},
    {"title": "Travailler avec les parents", "body": [
      "Présentez aux parents vos objectifs et le déroulé des séances dès le départ. Ils sauront à quoi s'attendre.",
      "Expliquez le rôle de chacun : le coach donne les consignes, les parents encouragent. Si un parent intervient trop depuis le bord du terrain, parlez-lui calmement après la séance.",
      "Faites un retour court sur les progrès de l'enfant. Si vous remarquez un problème (douleur, tristesse inhabituelle), signalez-le aux parents avec tact."
    ]}
  ]$j$::jsonb,
  $j$[
    {"question": "Combien de temps faire durer un même exercice avec des enfants de 6 à 8 ans ?", "options": ["Trente minutes sans pause", "Quelques minutes, puis on change", "Jusqu'à ce que tout le monde réussisse parfaitement"]},
    {"question": "Quelle félicitation est la plus utile ?", "options": ["« Tu es le meilleur du groupe ! »", "« Bien, mais ton frère fait mieux »", "« Tu as bien gardé les yeux sur le ballon »"]},
    {"question": "Un enfant rate un exercice plusieurs fois de suite. Vous…", "options": ["simplifiez l'exercice pour qu'il réussisse", "le mettez sur le banc pour qu'il regarde les autres", "le corrigez devant tout le groupe"]},
    {"question": "Où organiser une séance avec un enfant ?", "options": ["Dans un lieu fermé, à l'écart, pour qu'il se concentre", "Dans un lieu ouvert ou visible, avec un parent présent ou joignable", "Peu importe, du moment que les parents ont réservé"]},
    {"question": "Un parent crie des consignes depuis le bord du terrain pendant toute la séance. Vous…", "options": ["arrêtez la séance et lui demandez de partir", "l'ignorez à chaque fois", "lui parlez calmement après la séance pour expliquer le rôle de chacun"]}
  ]$j$::jsonb,
  '{1,2,0,1,2}'::int[],
  4
),
(
  'prevenir-les-blessures',
  $t$Prévenir les blessures$t$,
  $t$Cinq leçons pour limiter les blessures de vos clients : échauffement, progression de la charge, technique, récupération et signaux d'alerte. Réussite : 4 bonnes réponses sur 5.$t$,
  $j$[
    {"title": "L'échauffement", "body": [
      "Un échauffement de 10 à 15 minutes prépare les muscles, les articulations et le cœur. Il va du général (marche rapide, footing léger) au spécifique (gestes du sport pratiqué).",
      "Préférez des mouvements dynamiques (montées de genoux, rotations, fentes) aux étirements longs et immobiles, qui conviennent mieux après la séance.",
      "Allongez l'échauffement quand il fait froid, tôt le matin ou avec un client qui reprend après une longue pause."
    ]},
    {"title": "Augmenter la charge progressivement", "body": [
      "La plupart des blessures de surcharge viennent d'une hausse trop rapide du volume ou de l'intensité. Augmentez par petites étapes, d'une semaine à l'autre.",
      "Ne changez qu'un paramètre à la fois : la durée, la vitesse ou le poids, pas les trois en même temps.",
      "Prévoyez régulièrement une semaine plus légère, surtout avant une compétition ou après une période chargée."
    ]},
    {"title": "La technique avant la charge", "body": [
      "Un geste mal exécuté répété des centaines de fois finit par blesser. Apprenez le mouvement à vide ou avec une charge légère avant d'alourdir.",
      "Observez votre client sous plusieurs angles et filmez-le si besoin, avec son accord, pour lui montrer ce qu'il faut corriger.",
      "Quand la fatigue dégrade la technique en fin de série, arrêtez la série ou allégez. Finir « coûte que coûte » expose à la blessure."
    ]},
    {"title": "Récupération et sommeil", "body": [
      "Le corps progresse pendant la récupération, pas seulement pendant l'effort. Alternez les séances intenses et les séances plus calmes.",
      "Le sommeil est le premier outil de récupération. Un client qui dort mal plusieurs nuits de suite doit alléger son entraînement.",
      "Un retour au calme de quelques minutes (marche, respiration, étirements doux) aide à terminer la séance en douceur."
    ]},
    {"title": "Repérer les signaux d'alerte", "body": [
      "Une courbature diffuse un ou deux jours après un nouvel exercice est normale. Une douleur vive, localisée, ou qui augmente pendant l'effort ne l'est pas.",
      "Fatigue persistante, baisse des performances, irritabilité ou sommeil perturbé peuvent signaler un surentraînement. Réduisez la charge.",
      "Au moindre doute, arrêtez l'exercice et orientez le client vers un médecin ou un kinésithérapeute. Ne posez pas de diagnostic vous-même."
    ]}
  ]$j$::jsonb,
  $j$[
    {"question": "Un bon échauffement…", "options": ["dure 10 à 15 minutes et va du général au spécifique", "consiste surtout en étirements longs et immobiles", "est inutile pour les sportifs expérimentés"]},
    {"question": "Votre client veut doubler son volume d'entraînement dès la semaine prochaine. Vous…", "options": ["acceptez, sa motivation est là", "augmentez le volume par petites étapes", "lui conseillez d'arrêter le sport"]},
    {"question": "En fin de série, la fatigue dégrade nettement la technique de votre client. Vous…", "options": ["lui faites terminer la série coûte que coûte", "ajoutez de la charge pour le motiver", "arrêtez la série ou allégez"]},
    {"question": "Lequel de ces signes doit faire arrêter l'exercice ?", "options": ["Une courbature diffuse deux jours après un nouvel exercice", "Une douleur vive et localisée qui augmente pendant l'effort", "Un léger essoufflement pendant l'échauffement"]},
    {"question": "Quel est le premier outil de récupération ?", "options": ["Un sommeil suffisant", "Une séance intense chaque jour", "Des étirements longs avant l'effort"]}
  ]$j$::jsonb,
  '{0,1,2,1,0}'::int[],
  4
),
(
  'nutrition-hydratation',
  $t$Bases de la nutrition et de l'hydratation du sportif$t$,
  $t$Cinq leçons de repères simples pour conseiller vos clients sur l'alimentation et l'hydratation, y compris pendant le Ramadan, sans sortir de votre rôle. Réussite : 4 bonnes réponses sur 5.$t$,
  $j$[
    {"title": "Une assiette équilibrée", "body": [
      "Pour la plupart des sportifs amateurs, une alimentation variée suffit : féculents (pain, pâtes, couscous, riz), protéines (œufs, poisson, viande, légumineuses), légumes, fruits et un peu de matières grasses.",
      "Les féculents fournissent l'énergie de l'effort ; les protéines aident à reconstruire les muscles. Il n'est pas nécessaire de supprimer une famille d'aliments.",
      "Limitez les produits très sucrés, les fritures et les boissons gazeuses, sans en faire un interdit."
    ]},
    {"title": "Avant, pendant et après la séance", "body": [
      "Conseillez un repas léger 2 à 3 heures avant la séance, ou une petite collation (fruit, yaourt, pain) une heure avant. Un repas copieux et gras juste avant gêne l'effort.",
      "Pour une séance de moins d'une heure, l'eau suffit généralement pendant l'effort.",
      "Après la séance, un repas ou une collation avec des féculents et des protéines aide à récupérer."
    ]},
    {"title": "L'hydratation", "body": [
      "Buvez régulièrement tout au long de la journée, puis avant, pendant et après l'effort, sans attendre d'avoir soif. La soif est déjà un signe de début de déshydratation.",
      "Des urines foncées signalent souvent un manque d'eau ; des urines claires indiquent en général une bonne hydratation.",
      "Par forte chaleur, prévoyez plus d'eau et des pauses à l'ombre. Les boissons énergisantes ne sont pas des boissons d'hydratation."
    ]},
    {"title": "S'entraîner pendant le Ramadan", "body": [
      "Pendant le jeûne, réduisez l'intensité et la durée des séances. L'objectif est d'entretenir la forme, pas de battre des records.",
      "Les créneaux les plus prudents sont peu avant l'iftar pour une séance légère, ou après l'iftar, une fois le repas digéré, pour une séance plus soutenue. Évitez l'effort intense aux heures chaudes de la journée.",
      "Entre l'iftar et le shour, encouragez à boire régulièrement par petites quantités. Les clients qui ont un problème de santé doivent demander l'avis de leur médecin avant de s'entraîner en jeûnant."
    ]},
    {"title": "Connaître les limites de votre rôle", "body": [
      "Le coach donne des repères généraux. Il ne prescrit pas de régime, de compléments alimentaires ni de médicaments.",
      "Orientez vers un médecin ou un diététicien les clients qui ont un objectif de poids important, une maladie (diabète, problème rénal ou cardiaque), une grossesse ou des questions sur les compléments.",
      "Si un client mange très peu, parle de son poids avec angoisse ou s'entraîne de façon excessive, abordez le sujet avec bienveillance et encouragez-le à consulter."
    ]}
  ]$j$::jsonb,
  $j$[
    {"question": "Quand faut-il boire ?", "options": ["Uniquement quand on a très soif", "Régulièrement, avant, pendant et après l'effort", "Seulement à la fin de la séance"]},
    {"question": "Un client vous demande quel complément alimentaire prendre. Vous…", "options": ["lui recommandez celui que vous utilisez", "lui conseillez d'en essayer plusieurs pour comparer", "l'orientez vers un médecin ou un diététicien"]},
    {"question": "Pendant le Ramadan, quand placer une séance soutenue ?", "options": ["En milieu de journée, aux heures chaudes", "Après l'iftar, une fois le repas digéré", "N'importe quand, le corps s'adapte"]},
    {"question": "Des urines foncées indiquent souvent…", "options": ["un manque d'hydratation", "une bonne hydratation", "un excès de protéines"]},
    {"question": "Que manger avant une séance ?", "options": ["Un repas copieux et gras juste avant", "Rien du tout depuis la veille", "Un repas léger 2 à 3 heures avant, ou une petite collation"]}
  ]$j$::jsonb,
  '{1,2,1,0,2}'::int[],
  4
),
(
  'lancer-son-activite',
  $t$Lancer son activité de coach sur MAWHIBA$t$,
  $t$Cinq leçons pour bien démarrer sur la plateforme : profil, offres, fiabilité, communication et sécurité. Réussite : 4 bonnes réponses sur 5.$t$,
  $j$[
    {"title": "Un profil complet et vérifié", "body": [
      "Votre profil est la première chose que voit un client. Ajoutez une photo nette de vous, une présentation courte et concrète, vos sports, votre zone et vos disponibilités.",
      "Complétez votre CV : parcours sportif, expériences de coaching, diplômes et certifications. L'équipe MAWHIBA vérifie ces informations avant d'afficher le badge « vérifié ».",
      "Restez exact : n'inventez ni diplôme ni résultat. Une modification de votre CV repasse par la vérification."
    ]},
    {"title": "Des offres claires", "body": [
      "Chaque offre doit dire ce que le client achète : type de séance, public, durée, lieu et prix. Un client qui comprend tout de suite réserve plus facilement.",
      "Vous pouvez avoir jusqu'à six offres actives. Mieux vaut quelques offres bien décrites qu'une longue liste de variantes.",
      "Fixez un prix cohérent avec votre expérience et le marché local, et mettez-le à jour plutôt que de le négocier en dehors de la plateforme."
    ]},
    {"title": "Ponctualité, annulations et avis", "body": [
      "Arrivez quelques minutes en avance, avec le matériel prêt. La ponctualité est le premier critère de confiance.",
      "En cas d'empêchement, prévenez le client au plus tôt (son numéro apparaît sur la séance une fois confirmée) et proposez un autre créneau. Une absence sans prévenir abîme durablement votre réputation.",
      "Les avis des clients aident les autres à vous choisir. Prenez les critiques calmement, retenez ce qui peut être amélioré et ne demandez jamais de faux avis."
    ]},
    {"title": "Communiquer uniquement via la plateforme", "body": [
      "Passez par MAWHIBA pour tout ce qui précède la séance : demandes, propositions, réservation et paiement. La plateforme garde une trace des accords (horaire, lieu, prix) et protège les deux parties en cas de litige.",
      "La plateforme bloque les numéros de téléphone et les adresses e-mail dans les demandes et les propositions. N'essayez pas de les contourner (chiffres écrits en lettres, espaces, pseudonymes de réseaux sociaux).",
      "Restez professionnel : tenue correcte, messages courtois, réponses rapides. Si un client veut vos coordonnées avant de réserver, expliquez simplement que tout passe par la plateforme : les coordonnées s'échangent une fois la séance confirmée."
    ]},
    {"title": "Sécurité et assurance", "body": [
      "Chaque séance réservée et payée sur MAWHIBA est couverte par l'assurance Star incluse dans le prix. Une séance arrangée en dehors de la plateforme n'est pas assurée, ni pour vous ni pour le client.",
      "Choisissez des lieux sûrs et adaptés : terrain en bon état, salle autorisée, espace public fréquenté. Gardez une trousse de secours avec vous.",
      "Demandez au client s'il a un problème de santé à connaître. En cas de doute sur son aptitude, conseillez-lui un avis médical avant de commencer."
    ]}
  ]$j$::jsonb,
  $j$[
    {"question": "Avant de réserver, un client voudrait votre numéro de téléphone. Vous…", "options": ["l'écrivez en lettres dans votre proposition", "l'invitez à réserver sur la plateforme", "lui donnez votre adresse e-mail à la place"]},
    {"question": "Une offre claire indique…", "options": ["le type de séance, la durée, le lieu et le prix", "seulement un prix « à discuter »", "un texte général sur votre passion du sport"]},
    {"question": "La veille d'une séance, vous avez un empêchement. Vous…", "options": ["ne venez pas, le client comprendra", "envoyez un ami vous remplacer sans prévenir", "prévenez le client au plus tôt et proposez un autre créneau"]},
    {"question": "Un client laisse un avis négatif. Vous…", "options": ["le prenez personnellement et laissez tomber ce client", "restez calme et retenez ce qui peut être amélioré", "demandez à des amis de publier des avis positifs"]},
    {"question": "Une séance organisée en dehors de MAWHIBA est…", "options": ["couverte par l'assurance Star comme les autres", "couverte seulement si le client paie en espèces", "non couverte : seules les séances réservées et payées sur la plateforme sont assurées"]}
  ]$j$::jsonb,
  '{1,0,2,1,2}'::int[],
  4
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  lessons = excluded.lessons,
  quiz = excluded.quiz,
  answer_key = excluded.answer_key,
  pass_score = excluded.pass_score;
