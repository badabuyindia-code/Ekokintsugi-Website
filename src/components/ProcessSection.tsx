import { Recycle, Cpu, Scissors, Package } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../lib/LanguageContext";

export default function ProcessSection() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Recycle,
      step: "01",
      location: t("step1.loc"),
      title: t("step1.title"),
      description: t("step1.desc")
    },
    {
      icon: Cpu,
      step: "02",
      location: t("step2.loc"),
      title: t("step2.title"),
      description: t("step2.desc")
    },
    {
      icon: Scissors,
      step: "03",
      location: t("step3.loc"),
      title: t("step3.title"),
      description: t("step3.desc")
    },
    {
      icon: Package,
      step: "04",
      location: t("step4.loc"),
      title: t("step4.title"),
      description: t("step4.desc")
    }
  ];

  return (
    <section id="process" className="py-16 md:py-32 bg-muted/20 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 sm:mb-24">
          <div className="section-badge mb-6">
            <span className="section-badge-label">{t("process.badge")}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif text-primary mb-4 sm:mb-6">{t("process.title")}</h2>
          <p className="text-sm sm:text-base md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">{t("process.desc")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-16 md:mb-24">
          {steps.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 sm:p-12 border border-primary/10 bg-card rounded-3xl relative overflow-hidden group hover:shadow-strong transition-all text-left"
            >
              <div className="absolute -top-6 sm:-top-12 -right-4 sm:-right-8 text-[8rem] sm:text-[14rem] font-bold text-primary/5 select-none pointer-events-none group-hover:text-accent/[0.08] transition-colors leading-none font-serif italic">
                {item.step}
              </div>
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="p-3 sm:p-4 rounded-xl bg-primary text-primary-foreground shadow-lg group-hover:bg-accent group-hover:text-accent-foreground transition-colors shrink-0">
                    <item.icon className="w-6 h-6 sm:w-10 sm:h-10" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono tracking-widest text-accent uppercase font-black mb-1">{item.location}</p>
                    <h3 className="text-xl sm:text-3xl font-serif text-primary font-bold leading-tight">{item.title}</h3>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed text-xs sm:text-base md:text-lg">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="relative mb-6 lg:mb-0">
            <div className="rounded-3xl overflow-hidden shadow-strong aspect-video relative z-10 border-4 sm:border-[8px] border-card">
              <img 
                src="/images/sections/ai-tech.jpg" 
                alt="AI Technology"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
            </div>
            <div className="absolute -inset-4 border-2 border-accent/20 rounded-3xl -z-10" />
          </div>
          <div className="text-left">
            <h3 className="text-2xl sm:text-4xl font-serif text-primary mb-4 sm:mb-8 font-bold leading-tight">{t("process.ai_intel")}</h3>
            <p className="text-sm sm:text-lg text-muted-foreground mb-6 sm:mb-10 leading-relaxed italic">
              {t("process.ai_quote")}
            </p>
            <div className="grid grid-cols-2 gap-4 sm:gap-8">
              <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-card border border-accent/30 shadow-sm group hover:bg-accent transition-colors">
                <p className="text-3xl sm:text-5xl font-bold text-primary mb-1 sm:mb-2 group-hover:text-white transition-colors">35%</p>
                <p className="text-[10px] font-mono tracking-tight uppercase font-black text-accent group-hover:text-white transition-colors">{t("process.faster_sorting")}</p>
              </div>
              <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-card border border-accent/30 shadow-sm group hover:bg-accent transition-colors">
                <p className="text-3xl sm:text-5xl font-bold text-primary mb-1 sm:mb-2 group-hover:text-white transition-colors">40%</p>
                <p className="text-[10px] font-mono tracking-tight uppercase font-black text-accent group-hover:text-white transition-colors">{t("process.lower_rejection")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
