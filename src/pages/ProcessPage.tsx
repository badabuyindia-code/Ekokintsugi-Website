import { motion } from "motion/react";
import { Cpu, Repeat, MapPin, Truck, CheckCircle2 } from "lucide-react";

export default function ProcessPage() {
  return (
    <div className="py-10 sm:py-20 min-h-screen surface-gradient">
      <div className="max-w-7xl mx-auto px-6">
        
        <header className="mb-12 sm:mb-20 text-center">
          <span className="section-badge mb-4">
            <span className="section-badge-label">Operational Architecture</span>
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif text-primary font-bold text-center mb-4 sm:mb-6">Dual-State Efficiency.</h1>
          <p className="text-base sm:text-xl text-muted-foreground italic text-center max-w-2xl mx-auto">
            A hybrid model that unlocks government subsidies, guarantees the lowest cost per pair, and ensures high quality consistency across India.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12 sm:mb-20 text-primary">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -8, scale: 1.015 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="p-6 sm:p-10 border-2 border-border/80 rounded-3xl sm:rounded-[2.5rem] relative overflow-hidden bg-card group cursor-pointer hover:border-accent/40 hover:shadow-strong transition-all duration-300 text-left"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-125 group-hover:bg-primary/10" />
            <MapPin className="text-accent w-10 h-10 mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
            <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-2">Jharkhand</h3>
            <p className="text-accent font-mono text-xs font-bold tracking-widest uppercase mb-8">Processing & Recycling</p>
            
            <ul className="space-y-4 font-sans text-muted-foreground text-sm flex flex-col gap-2">
              <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Waste sorting</li>
              <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Removal of contaminants</li>
              <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Leather mince conversion</li>
              <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> Recycled mosaic sheet creation</li>
              <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> Tribal workforce empowerment</li>
            </ul>
             <div className="mt-8 border-t border-border pt-4">
              <span className="text-xs font-mono tracking-widest font-bold uppercase text-muted-foreground">Lead Time: 30 Days</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -8, scale: 1.015 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="p-6 sm:p-10 border-2 border-primary rounded-3xl sm:rounded-[2.5rem] relative overflow-hidden bg-primary text-primary-foreground group cursor-pointer hover:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.35)] transition-shadow duration-300 text-left"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/15 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-125 group-hover:bg-accent/25" />
            <MapPin className="text-primary-foreground/50 w-10 h-10 mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
            <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-2">Uttar Pradesh</h3>
            <p className="text-accent dark:text-primary-foreground font-mono text-xs font-bold tracking-widest uppercase mb-8">Cutting, Assembly & Export</p>
            
            <ul className="space-y-4 font-sans text-primary-foreground/80 text-sm flex flex-col gap-2">
              <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> Upper construction</li>
              <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> Sole assembly</li>
              <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> Stitching</li>
              <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> Packaging</li>
              <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> Export documentation & logistics</li>
            </ul>
            <div className="mt-8 border-t border-primary-foreground/20 pt-4 flex flex-col sm:flex-row gap-3 sm:gap-6">
              <span className="text-xs font-mono tracking-widest font-bold uppercase text-primary-foreground/80">Lead Time: 30 Days</span>
              <span className="text-xs font-mono tracking-widest font-bold uppercase text-accent dark:text-primary-foreground flex items-center gap-2"><Truck className="w-4 h-4"/> Transport: 45 Days</span>
            </div>
          </motion.div>
        </div>

        <section className="bg-card border border-border p-6 sm:p-12 md:p-20 rounded-[2rem] sm:rounded-[3rem] shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary mb-8 sm:mb-12 flex items-center gap-3 sm:gap-4 justify-center text-center">
            <Cpu className="w-8 h-8 text-accent" /> The Technology Advantage
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
             {[
               { title: "AI-powered QC", desc: "Automating visual quality metrics for European compliance." },
               { title: "AI Waste Sorting", desc: "Predicting yields and enabling contaminant elimination algorithms." },
               { title: "Material Dashboard", desc: "Intelligent analytics for transparent closed-loop tracking." },
               { title: "DPP Ready", desc: "Built straight into the database for the 2026 Passport mandates." },
               { title: "Yield Analytics", desc: "Production forecasting down to the gram." },
               { title: "EU Exclusive", desc: "Exclusive technology access tailored for Taleco Handles GmbH." }
              ].map((tech, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="p-6 rounded-2xl bg-muted/40 hover:bg-muted/80 transition-all duration-300 group cursor-pointer hover:shadow-soft border border-transparent hover:border-accent/10 text-left"
                >
                   <h4 className="font-bold text-primary font-mono text-sm tracking-tight mb-2 flex items-center gap-2">
                     <Repeat className="w-4 h-4 text-accent transition-transform duration-500 group-hover:rotate-180" /> {tech.title}
                   </h4>
                   <p className="text-muted-foreground text-sm">{tech.desc}</p>
                </motion.div>
              ))}
          </div>
        </section>

      </div>
    </div>
  );
}
