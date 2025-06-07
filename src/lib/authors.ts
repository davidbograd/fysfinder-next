export interface Author {
  slug: string;
  name: string;
  givenName: string;
  familyName: string;
  jobTitle: string[];
  description: string;
  image: string;
  linkedinUrl?: string;
  education: {
    degree: string;
    institution: string;
    institutionUrl?: string;
  };
  expertise: string[];
  knowsAbout: string[];
  affiliations: Array<{
    name: string;
    type: "MedicalOrganization" | "Organization";
    url?: string;
    description?: string;
  }>;
  workExamples: Array<{
    name: string;
    url: string;
    description: string;
  }>;
  bio: string[];
  isFounder?: boolean;
  awards?: string[];
  memberOf?: {
    name: string;
    description: string;
  };
}

export const authors: Author[] = [
  {
    slug: "joachim-bograd",
    name: "Joachim Bograd",
    givenName: "Joachim",
    familyName: "Bograd",
    jobTitle: ["Fysioterapeut & Founder af Fysfinder"],
    description:
      "Fysioterapeut, forfatter og stifter af FysFinder. Specialist i muskuloskeletal fysioterapi, smertevidenskab og træning.",
    image: "/images/om-os/joachimbograd-fysfinder.png",
    linkedinUrl: "https://www.linkedin.com/in/joachim-bograd-43b0a120a/",
    education: {
      degree: "Bachelor i fysioterapi",
      institution: "Københavns Professionshøjskole",
      institutionUrl: "https://www.kp.dk",
    },
    expertise: [
      "Muskuloskeletal fysioterapi",
      "Smertevidenskab",
      "Træning og bevægelse",
    ],
    knowsAbout: [
      "Fysioterapi",
      "Muskuloskeletal fysioterapi",
      "Smertevidenskab",
      "Træning",
      "Skadesforebyggelse",
      "Bevægelse",
      "Neurofysiologi",
      "Ryg- og nakkeproblemer",
      "Komplekse smerteproblematikker",
    ],
    affiliations: [
      {
        name: "FysFinder",
        type: "MedicalOrganization",
        url: "https://fysfinder.dk",
        description: "Danmarks platform til at finde fysioterapeuter",
      },
      {
        name: "Smertelinjen",
        type: "Organization",
        description: "Frivillig rådgiver",
      },
    ],
    workExamples: [
      {
        name: "FysFinder Blog",
        url: "https://fysfinder.dk/blog",
        description: "Faglige artikler om fysioterapi og sundhed",
      },
      {
        name: "FysFinder Ordbog",
        url: "https://fysfinder.dk/ordbog",
        description:
          "Faglig ordbog med fysioterapeutiske termer og forklaringer",
      },
    ],
    bio: [
      "Joachim Bograd er uddannet fysioterapeut fra Københavns Professionshøjskole og har opbygget stor erfaring med at arbejde med mennesker i sin daglige praksis som behandler.",
      "Han har videreuddannet sig gennem kurser inden for muskuloskeletal fysioterapi, smertevidenskab og træning – områder, der har givet ham en særlig ekspertise i komplekse smerteproblematikker, ryg- og nakkeproblemer, skadesforebyggelse, bevægelse og neurofysiologi.",
      "Joachim har desuden solid erfaring som skribent og har bidraget med faglige artikler på flere sundhedsfaglige platforme.",
      "Han har også arbejdet som frivillig rådgiver på Smertelinjen, hvor han har styrket sine kompetencer inden for kommunikation og formidling af viden om smerter.",
      "Som stifter af FysFinder brænder Joachim for at gøre fysioterapi mere tilgængeligt for alle. I sit arbejde som forfatter på platformen fokuserer han på at formidle viden i et klart og letforståeligt sprog, så flere kan få indsigt i deres egen krop, forstå deres smerter og tage aktivt del i deres egen behandling.",
    ],
    isFounder: true,
    awards: ["Stifter af Danmarks førende platform for fysioterapisøgning"],
    memberOf: {
      name: "Danske Fysioterapeuter",
      description: "Professionel organisation for fysioterapeuter i Danmark",
    },
  },
  {
    slug: "natasja-sorensen",
    name: "Natasja Sørensen",
    givenName: "Natasja",
    familyName: "Sørensen",
    jobTitle: ["Fysioterapeut, Vanecoach & Sundhedsfaglig konsulent"],
    description:
      "Fysioterapeut, vanecoach og sundhedsfaglig konsulent. Specialist i livsstilsændringer, træning og skræddersyede behandlingsforløb.",
    image: "/images/forfatter-billeder/natasja-sorensen.jpeg",
    linkedinUrl: "https://www.linkedin.com/in/natasja-s%C3%B8rensen-11652a233/",
    education: {
      degree: "Bachelor i fysioterapi",
      institution: "Professionshøjskolen Absalon",
      institutionUrl: "https://phabsalon.dk",
    },
    expertise: [
      "Vanecoaching",
      "Livsstilsændringer",
      "Pilates",
      "Yoga",
      "Styrketræning",
      "Calisthenics",
      "Løb",
    ],
    knowsAbout: [
      "Fysioterapi",
      "Vanecoaching",
      "Livsstilsændringer",
      "Træning",
      "Pilates",
      "Yoga",
      "Styrketræning",
      "Calisthenics",
      "Løb",
      "Sundhedsfaglig rådgivning",
      "Behandlingsforløb",
    ],
    affiliations: [
      {
        name: "FysFinder",
        type: "MedicalOrganization",
        url: "https://fysfinder.dk",
        description: "Danmarks platform til at finde fysioterapeuter",
      },
      {
        name: "MadroInstitutet",
        type: "Organization",
        description: "Vanecoach uddannelse",
      },
      {
        name: "Sedgwick",
        type: "Organization",
        description: "Sundhedsfaglig konsulent",
      },
    ],
    workExamples: [
      {
        name: "FysFinder Blog",
        url: "https://fysfinder.dk/blog",
        description: "Faglige artikler om fysioterapi og sundhed",
      },
      {
        name: "FysFinder Ordbog",
        url: "https://fysfinder.dk/ordbog",
        description:
          "Faglig ordbog med fysioterapeutiske termer og forklaringer",
      },
    ],
    bio: [
      "Natasja Sørensen er uddannet fysioterapeut fra Professionshøjskolen Absalon og har solid erfaring både som praktiserende fysioterapeut og som sundhedsfaglig konsulent.",
      "Hun har videreuddannet sig som vanecoach gennem MadroInstitutet og er specialiseret i at støtte mennesker i deres livsstilsændringer og opbygning af nye, bæredygtige vaner. Natasja har desuden en stærk baggrund inden for træning og har arbejdet indgående med blandt andet pilates, yoga, styrketræning, calisthenics og løb.",
      "Som sundhedsfaglig konsulent har hun opnået indgående kendskab til forskellige behandlingsformer og har et særligt fokus på at skræddersy behandlingsforløb ud fra den enkeltes behov og forudsætninger.",
      "Natasja bidrager til FysFinder som forfatter og formidler, hvor hun kombinerer sin faglige indsigt med en passion for at gøre ny viden inden for sundhed tilgængelig for alle.",
    ],
    memberOf: {
      name: "Danske Fysioterapeuter",
      description: "Professionel organisation for fysioterapeuter i Danmark",
    },
  },
  {
    slug: "anders-hammer",
    name: "Anders Hammer",
    givenName: "Anders",
    familyName: "Hammer",
    jobTitle: ["Fysioterapeut & Personlig træner"],
    description:
      "Fysioterapeut og personlig træner med specialisering i smertevidenskab. Tager MSc i Clinical Management of Pain på University of Edinburgh.",
    image: "/images/forfatter-billeder/anders-hammer.jpeg",
    linkedinUrl: "https://www.linkedin.com/in/anders-hammer-186999266/",
    education: {
      degree: "Bachelor i fysioterapi",
      institution: "Københavns Professionshøjskole",
      institutionUrl: "https://www.kp.dk",
    },
    expertise: [
      "Smertevidenskab",
      "Muskuloskeletal fysioterapi",
      "Styrketræning",
      "Styrkeløft",
      "Sportsrelaterede skader",
      "Rygsmerter",
      "Længerevarende smerter",
    ],
    knowsAbout: [
      "Fysioterapi",
      "Smertevidenskab",
      "Muskuloskeletal fysioterapi",
      "Styrketræning",
      "Styrkeløft",
      "Sportsrelaterede skader",
      "Rygsmerter",
      "Længerevarende smerteproblematikker",
      "Funktionelle problematikker",
      "Smertehåndtering",
      "Rehabilitering",
      "Træning",
    ],
    affiliations: [
      {
        name: "FysFinder",
        type: "MedicalOrganization",
        url: "https://fysfinder.dk",
        description: "Danmarks platform til at finde fysioterapeuter",
      },
      {
        name: "University of Edinburgh",
        type: "Organization",
        description: "MSc i Clinical Management of Pain (igangværende)",
      },
      {
        name: "Paul Petersens Idrætsinstitut",
        type: "Organization",
        description: "Tidligere personlig træner",
      },
    ],
    workExamples: [
      {
        name: "FysFinder Blog",
        url: "https://fysfinder.dk/blog",
        description: "Faglige artikler om fysioterapi og sundhed",
      },
      {
        name: "FysFinder Ordbog",
        url: "https://fysfinder.dk/ordbog",
        description:
          "Faglig ordbog med fysioterapeutiske termer og forklaringer",
      },
    ],
    bio: [
      "Anders er uddannet fysioterapeut fra Københavns Professionshøjskole og har en solid baggrund som personlig træner fra Paul Petersens Idrætsinstitut. Han er aktuelt i gang med en international videreuddannelse i smertevidenskab på University of Edinburgh, hvor han tager en MSc i Clinical Management of Pain.",
      "Med mange års erfaring inden for både træning og fysioterapi arbejder Anders målrettet med behandling af smerter og funktionelle problematikker, især med fokus på en helhedsorienteret tilgang, der integrerer både bevægelse og forståelse for kroppen som helhed.",
      "Anders har særlig interesse for længerevarende smerteproblematikker, rygsmerter og sportsrelaterede udfordringer. Med mere end 14 års erfaring inden for styrketræning og styrkeløft har han en dyb indsigt i træningens rolle i smertehåndtering og rehabilitering.",
      "Han har derudover gennemført grundkurser i muskuloskeletal fysioterapi og smertevidenskab, hvilket har styrket hans forståelse for komplekse smertetilstande. Anders er aktiv inden for både klinikarbejde og undervisning, og brænder for at formidle ny viden og skabe bedre forståelse for kroppens signaler hos sine patienter.",
    ],
    memberOf: {
      name: "Danske Fysioterapeuter",
      description: "Professionel organisation for fysioterapeuter i Danmark",
    },
  },
];

export function getAuthor(slug: string): Author | undefined {
  return authors.find((author) => author.slug === slug);
}

export function getAllAuthors(): Author[] {
  return authors;
}

export function getAuthorForStructuredData(
  authorSlug: string = "joachim-bograd"
) {
  const author = getAuthor(authorSlug);
  if (!author) return null;

  return {
    "@type": "Person",
    name: author.name,
    jobTitle: author.jobTitle[0],
    description: `${author.education.degree} fra ${author.education.institution}`,
    sameAs: author.linkedinUrl ? [author.linkedinUrl] : undefined,
    affiliation: {
      "@type": "MedicalOrganization",
      name: "FysFinder",
      url: "https://fysfinder.dk",
    },
  };
}
