import type { Locale } from "@/lib/types";

export function PersonSchema({ locale }: { locale: Locale }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Lukasz Wrzal",
    jobTitle: "Creative Designer & AI Director",
    url: `https://takealuke.studio/${locale}`,
    email: "hello@takealuke.studio",
    address: { "@type": "PostalAddress", addressLocality: "Warsaw", addressCountry: "PL" },
    sameAs: ["https://www.linkedin.com/in/lukaszwrzal/"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
