import { motion } from "motion/react";
import { Award, Newspaper, Quote } from "lucide-react";

const achievements = [
  { title: "Add your award title", year: "2025", desc: "Short description of this achievement or recognition." },
  { title: "Add your award title", year: "2025", desc: "Short description of this achievement or recognition." },
  { title: "Add your award title", year: "2024", desc: "Short description of this achievement or recognition." },
];

const pressMentions = [
  { outlet: "Publication Name", quote: "Short pull-quote or headline about EkoKintsugi from the feature.", link: "#" },
  { outlet: "Publication Name", quote: "Short pull-quote or headline about EkoKintsugi from the feature.", link: "#" },
];

export default function PressPage() {
  return (
    <div className="py-16 md:py-32 surface-gradient min-h-screen">
      <div className="max-w-7xl mx-auto px-6 space-y-16 md:space-y-24">

        <header className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-6">
          <span className="section-badge">
            <span className="section-badge-label">Recognition</span>
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif font-black text-primary tracking-tight">
            Media &amp; Press
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground italic leading-relaxed">
            Milestones, awards, and coverage from our journey toward circular craftsmanship.
          </p>
        </header>

        <section className="space-y-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary text-center">Achievements</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {achievements.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 400, damping: 25, delay: i * 0.05 }}
                className="bg-card border border-border/80 p-8 rounded-3xl flex flex-col hover:border-accent/40 hover:shadow-strong transition-all duration-300"
              >
                <Award className="w-8 h-8 text-accent mb-4" />
                <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-accent font-bold mb-2">{item.year}</p>
                <h3 className="text-xl font-serif font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground italic leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary text-center">In the Press</h2>
          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
            {pressMentions.map((item, i) => (
              <motion.a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 400, damping: 25, delay: i * 0.05 }}
                className="bg-card border border-border/80 p-8 rounded-3xl flex flex-col hover:border-accent/40 hover:shadow-strong transition-all duration-300"
              >
                <Newspaper className="w-6 h-6 text-accent mb-4" />
                <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-accent font-bold mb-3">{item.outlet}</p>
                <div className="flex gap-2">
                  <Quote className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                  <p className="text-base text-muted-foreground italic leading-relaxed">{item.quote}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
