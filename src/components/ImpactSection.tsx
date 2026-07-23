import { TrendingDown, Leaf, Users, Award, Rocket, Scale, Sprout, CircleCheckBig, Globe2, Landmark } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../lib/LanguageContext";

function CertificationLogo({
  mark,
  accent,
  icon: Icon
}: {
  mark: string;
  accent: string;
  icon: typeof Globe2;
}) {
  return (
    <div className="flex items-center gap-3 text-primary-foreground">
      <Icon className="w-6 h-6 text-accent dark:text-primary-foreground/90 shrink-0" strokeWidth={1.8} />
      <div className="leading-none">
        <div className="font-mono text-[9px] tracking-[0.38em] uppercase text-primary-foreground/55">
          {accent}
        </div>
        <div className="font-serif text-2xl font-bold tracking-[0.18em] text-primary-foreground/92">
          {mark}
        </div>
      </div>
    </div>
  );
}

export default function ImpactSection() {
  const { t } = useLanguage();

  const metrics = [
    {
      icon: TrendingDown,
      value: "5.3kg",
      label: t("impactsection.metrics.co2"),
      desc: t("impactsection.metrics.co2_desc")
    },
    {
      icon: Leaf,
      value: "70%",
      label: t("impactsection.metrics.circular"),
      desc: t("impactsection.metrics.circular_desc")
    },
    {
      icon: Users,
      value: "500+",
      label: t("impactsection.metrics.artisans"),
      desc: t("impactsection.metrics.artisans_desc")
    },
    {
      icon: Award,
      value: "100%",
      label: t("impactsection.metrics.traceable"),
      desc: t("impactsection.metrics.traceable_desc")
    }
  ];

  const certs = [
    {
      title: "EU Digital Product Passport",
      mark: "DPP",
      icon: Globe2,
      accent: "EU",
      desc: t("impactsection.certs.dpp_desc")
    },
    {
      title: "MSME-Udyam Certified",
      mark: "MSME",
      icon: Landmark,
      accent: "UDYAM",
      desc: t("impactsection.certs.msme_desc")
    },
    {
      title: "Startup India Recognized",
      mark: "SI",
      icon: Rocket,
      accent: "INDIA",
      desc: t("impactsection.certs.startup_desc")
    },
    {
      title: "ISO Quality Standards",
      mark: "ISO",
      icon: CircleCheckBig,
      accent: "9001",
      desc: t("impactsection.certs.iso_desc")
    },
    {
      title: "Fair Trade Practices",
      mark: "FT",
      icon: Scale,
      accent: "FAIR",
      desc: t("impactsection.certs.fair_desc")
    },
    {
      title: "Carbon Neutral Operations",
      mark: "CN",
      icon: Sprout,
      accent: "ZERO",
      desc: t("impactsection.certs.carbon_desc")
    }
  ];

  return (
    <section id="impact" className="py-16 md:py-32 relative overflow-hidden bg-primary text-center">
      <div className="absolute top-0 left-0 w-full h-full opacity-40 bg-[radial-gradient(circle_at_20%_20%,var(--color-accent)_0%,transparent_50%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-primary-foreground">
        <div className="text-center mb-12 sm:mb-24">
          <div className="section-badge mb-8">
            <span className="section-badge-label">
              {t("impactsection.badge")}
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif font-bold mb-4 sm:mb-8 leading-tight">
            {t("impactsection.title")}
          </h2>
          <p className="text-sm sm:text-base md:text-xl text-primary-foreground/80 dark:text-primary-foreground/90 max-w-2xl mx-auto font-medium leading-relaxed italic">
            {t("impactsection.desc")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 mb-12 md:mb-32">
          {metrics.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-5 sm:p-8 md:p-10 text-center bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/15 rounded-2xl sm:rounded-[2.5rem] hover:bg-primary-foreground/20 hover:scale-105 transition-all shadow-xl group"
            >
              <div className="flex justify-center mb-6 sm:mb-10">
                <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-accent text-accent-foreground shadow-lg group-hover:rotate-12 transition-transform">
                  <item.icon className="w-6 h-6 sm:w-8 sm:h-8 shrink-0" />
                </div>
              </div>
              <p className="text-3xl sm:text-5xl md:text-6xl font-black font-serif mb-2 sm:mb-3 tracking-tighter">{item.value}</p>
              <p className="text-sm sm:text-base md:text-lg font-bold mb-3 sm:mb-4 uppercase tracking-widest text-accent dark:text-primary-foreground">
                {item.label}
              </p>
              <p className="text-xs sm:text-sm text-primary-foreground/75 dark:text-primary-foreground/85 leading-relaxed font-medium">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="p-5 sm:p-10 md:p-16 rounded-[2rem] sm:rounded-[3rem] bg-black/20 backdrop-blur-xl border border-primary-foreground/20 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-8 sm:mb-16">
            <div className="hidden sm:block h-px flex-1 bg-primary-foreground/20" />
            <h3 className="text-xl sm:text-3xl font-serif text-center font-bold px-6 leading-tight">{t("impactsection.certs.title")}</h3>
            <div className="hidden sm:block h-px flex-1 bg-primary-foreground/20" />
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
            {certs.map((cert, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl border border-primary-foreground/12 bg-gradient-to-r from-primary-foreground/6 via-primary-foreground/4 to-transparent group hover:border-accent/35 hover:from-accent/10 hover:via-primary-foreground/8 hover:to-transparent transition-all cursor-default"
              >
                <div className="shrink-0 group-hover:translate-x-1 transition-transform">
                  <CertificationLogo mark={cert.mark} accent={cert.accent} icon={cert.icon} />
                </div>
                <div>
                  <span className="block font-mono text-[11px] tracking-[0.2em] uppercase font-black group-hover:text-primary-foreground transition-colors">
                    {cert.title}
                  </span>
                  <span className="block mt-2 text-xs text-primary-foreground/60 italic leading-relaxed">
                    {cert.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
