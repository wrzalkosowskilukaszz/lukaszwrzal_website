import type { Category, Locale } from "./types";

/**
 * Page chrome only. Project copy comes from the en/pl blocks in projects.json.
 *
 * The prototypes keyed this dictionary by the exact English string and walked
 * text nodes to substitute matches. That was a prototype technique; the
 * handoff says to replace it. Semantic keys here, English included as a real
 * locale so nothing is implicit.
 *
 * When you add chrome copy, add its PL value in the same commit.
 */
export const CHROME = {
  en: {
    // Nav
    navWork: "Work",
    navAbout: "About",
    navConnect: "Connect",
    navCta: "Let's meet",
    langLabel: "Language",
    skipToContent: "Skip to content",

    // Homepage
    heroTitle: "Hi! I'm Luke, Creative Designer & AI Director.",
    heroLedeA: "Focused on digital products, visual systems, and clear user experiences.",
    heroLedeB: "Powered by AI. Designed for humans.",
    recentWorks: "Recent works",
    showAll: "Show all",
    aboutEyebrow: "About",
    aboutTitle: "Nice to meet you.",
    aboutIntro:
      "I'm Łukasz — over ten years in the design and creative industry, most of it spent making complicated things feel obvious.",
    aboutPoint1Title: "Brand systems that outlive the launch",
    aboutPoint1Body:
      "I build the rules, not just the artwork — so your team can keep shipping months after I've gone, without filing exceptions.",
    aboutPoint2Title: "Product interfaces people open daily",
    aboutPoint2Body:
      "Dashboards, portals, booking flows. The kind of screens where one saved click compounds into thousands of hours.",
    aboutPoint3Title: "AI direction, used honestly",
    aboutPoint3Body:
      "AI in the parts of the process where it genuinely helps, and human judgement everywhere it doesn't. You'll always know which is which.",

    clientsEyebrow: "Clients",
    clientsTitle: "Who trusted me.",
    clientsIntro: "A selection of the teams I've worked with over the last decade.",
    workedWith: "Worked with",

    // Work index
    workEyebrow: "Thirty projects · 2022—2026",
    workTitle: "All work",
    workLede:
      "Brand systems, product interfaces, print and packaging. Everything I can show publicly.",
    filterAll: "All",
    viewIndex: "Index",
    viewGrid: "Grid",
    viewGroup: "View as",

    // Case study
    chapterBrief: "Brief",
    chapterProcess: "Process",
    chapterSystem: "System",
    chapterOutcome: "Outcome",
    sectionBrief: "01 / Brief",
    sectionProcess: "02 / Process",
    sectionSystem: "03 / System",
    sectionOutcome: "04 / Outcome",
    metaClient: "Client",
    metaRole: "Role",
    metaScope: "Scope",
    metaTeam: "Team",
    expand: "Expand",
    drag: "Drag",
    closeEsc: "Close · esc",
    nextProject: "Next project",
    previousImage: "Previous image",
    nextImage: "Next image",

    // Footer
    footerTitle: "Prompt me with your next project.",
    footerLede:
      "Brand systems, product interfaces, the occasional weird idea. Fifteen minutes is usually enough to know if we should work together.",
    footerLedeShort:
      "Fifteen minutes is usually enough to know if we should work together.",
    footerEmailLine: "Pick a slot above, or reach me at hello@takealuke.studio",
    preferEmail: "I'd rather send an email",
    calendarFailed: "The booking calendar didn't load here.",
    openCalendar: "Open my calendar",
    bookCall: "Book a call",
    availability: "Warsaw · Available for new work",
    rights: "© 2026 Lukasz Wrzal",
  },

  pl: {
    navWork: "Projekty",
    navAbout: "O mnie",
    navConnect: "Kontakt",
    navCta: "Porozmawiajmy",
    langLabel: "Język",
    skipToContent: "Przejdź do treści",

    heroTitle: "Cześć! Jestem Luke — projektant kreatywny i dyrektor AI.",
    heroLedeA:
      "Skupiam się na produktach cyfrowych, systemach wizualnych i zrozumiałych doświadczeniach.",
    heroLedeB: "Napędzane przez AI. Zaprojektowane dla ludzi.",
    recentWorks: "Ostatnie projekty",
    showAll: "Zobacz wszystkie",
    aboutEyebrow: "O mnie",
    aboutTitle: "Miło Cię poznać.",
    aboutIntro:
      "Jestem Łukasz — ponad dziesięć lat w branży kreatywnej, w większości spędzone na sprawianiu, by skomplikowane rzeczy wydawały się oczywiste.",
    aboutPoint1Title: "Systemy marki, które przeżywają launch",
    aboutPoint1Body:
      "Buduję zasady, nie tylko grafiki — żeby Twój zespół mógł działać miesiącami po moim odejściu, bez zgłaszania odstępstw.",
    aboutPoint2Title: "Interfejsy, które ludzie otwierają codziennie",
    aboutPoint2Body:
      "Pulpity, portale, ścieżki rezerwacji. Ekrany, w których jedno zaoszczędzone kliknięcie zamienia się w tysiące godzin.",
    aboutPoint3Title: "Kierowanie AI, uczciwie",
    aboutPoint3Body:
      "AI tam, gdzie naprawdę pomaga, i ludzki sąd wszędzie tam, gdzie nie. Zawsze będziesz wiedzieć, co jest czym.",

    clientsEyebrow: "Klienci",
    clientsTitle: "Kto mi zaufał.",
    clientsIntro: "Wybór zespołów, z którymi pracowałem przez ostatnią dekadę.",
    workedWith: "Pracowałem z",

    workEyebrow: "Trzydzieści projektów · 2022—2026",
    workTitle: "Wszystkie projekty",
    workLede:
      "Systemy marki, interfejsy produktów, druk i opakowania. Wszystko, co mogę pokazać publicznie.",
    filterAll: "Wszystkie",
    viewIndex: "Lista",
    viewGrid: "Siatka",
    viewGroup: "Widok",

    chapterBrief: "Brief",
    chapterProcess: "Proces",
    chapterSystem: "System",
    chapterOutcome: "Efekt",
    sectionBrief: "01 / Brief",
    sectionProcess: "02 / Proces",
    sectionSystem: "03 / System",
    sectionOutcome: "04 / Efekt",
    metaClient: "Klient",
    metaRole: "Rola",
    metaScope: "Zakres",
    metaTeam: "Zespół",
    expand: "Powiększ",
    drag: "Przeciągnij",
    closeEsc: "Zamknij · esc",
    nextProject: "Następny projekt",
    previousImage: "Poprzedni obraz",
    nextImage: "Następny obraz",

    footerTitle: "Zacznij ze mną swój następny projekt.",
    footerLede:
      "Systemy marki, interfejsy produktów, czasem dziwny pomysł. Piętnaście minut zwykle wystarczy, żeby wiedzieć, czy powinniśmy pracować razem.",
    footerLedeShort:
      "Piętnaście minut zwykle wystarczy, żeby wiedzieć, czy powinniśmy pracować razem.",
    footerEmailLine: "Wybierz termin powyżej lub napisz na hello@takealuke.studio",
    preferEmail: "Wolę napisać maila",
    calendarFailed: "Kalendarz rezerwacji się nie wczytał.",
    openCalendar: "Otwórz mój kalendarz",
    bookCall: "Zarezerwuj rozmowę",
    availability: "Warszawa · Dostępny dla nowych projektów",
    rights: "© 2026 Lukasz Wrzal",
  },
} satisfies Record<Locale, Record<string, string>>;

export type ChromeKey = keyof (typeof CHROME)["en"];

export function t(locale: Locale, key: ChromeKey): string {
  return CHROME[locale][key] ?? CHROME.en[key];
}

/** Category filter labels. */
export const CATEGORY_LABELS: Record<Locale, Record<Category, string>> = {
  en: {
    identity: "Identity",
    product: "Product",
    brand: "Brand",
    web: "Web",
    ai: "AI",
    illustrations: "Illustrations",
  },
  pl: {
    identity: "Identyfikacja",
    product: "Produkt",
    brand: "Marka",
    web: "Web",
    ai: "AI",
    illustrations: "Ilustracje",
  },
};
