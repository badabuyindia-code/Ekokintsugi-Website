import { motion } from "motion/react";
import { Phone, Mail, MapPin, Send, CheckCircle } from "lucide-react";
import React, { useState } from "react";
import { useLanguage } from "../lib/LanguageContext";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/contact/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || t("Unable to send your message right now."));
      }

      setSubmitted(true);
      e.currentTarget.reset();
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      setError(err.message || t("Unable to send your message right now."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-10 sm:py-20 min-h-screen surface-gradient">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16 md:mb-24">
          <div className="section-badge mb-6">
            <span className="section-badge-label">{t("contact.badge")}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif text-primary mb-6 sm:mb-8 font-bold leading-tight">
            {t("contact.title_part1")} <br />
            <span className="text-accent underline decoration-4 underline-offset-8 transition-all hover:decoration-primary">
              {t("contact.title_accent")}
            </span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground italic max-w-2xl mx-auto">
            {t("contact.desc")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -6, scale: 1.008 }} 
            transition={{ type: "spring", stiffness: 400, damping: 25 }} 
            className="p-6 sm:p-10 md:p-12 bg-card border-2 border-primary/20 rounded-3xl sm:rounded-[2.5rem] shadow-none relative h-fit group hover:border-primary hover:shadow-strong transition-all duration-300"
          >
            <div className="absolute top-0 right-12 w-20 h-2 bg-accent rounded-b-full" />
            {!submitted ? (
              <form className="space-y-6 sm:space-y-8 text-left" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-primary mb-2 sm:mb-3 font-mono uppercase tracking-[0.2em]">{t("contact.form.name")}</label>
                    <input required name="name" type="text" placeholder={t("contact.form.placeholder_name")} className="w-full px-5 py-4 rounded-xl bg-transparent border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-base sm:text-lg placeholder:text-muted-foreground/50" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-primary mb-2 sm:mb-3 font-mono uppercase tracking-[0.2em]">{t("contact.form.email")}</label>
                    <input required name="email" type="email" placeholder="example@email.com" className="w-full px-5 py-4 rounded-xl bg-transparent border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-base sm:text-lg placeholder:text-muted-foreground/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-primary mb-2 sm:mb-3 font-mono uppercase tracking-[0.2em]">{t("contact.form.subject")}</label>
                  <input required name="subject" type="text" placeholder={t("contact.form.placeholder_subject")} className="w-full px-5 py-4 rounded-xl bg-transparent border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-base sm:text-lg placeholder:text-muted-foreground/50" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-primary mb-2 sm:mb-3 font-mono uppercase tracking-[0.2em]">{t("contact.form.message")}</label>
                  <textarea required name="message" rows={5} placeholder={t("contact.form.placeholder_message")} className="w-full px-5 py-4 rounded-xl bg-transparent border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all resize-none font-medium text-base sm:text-lg placeholder:text-muted-foreground/50" />
                </div>
                {error && (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-800">{error}</p>
                )}
                <button disabled={isSubmitting} type="submit" className="w-full py-4 sm:py-5 bg-primary text-primary-foreground font-black text-[12px] tracking-[0.3em] uppercase rounded-2xl flex items-center justify-center gap-4 hover:bg-accent hover:text-accent-foreground transition-all shadow-xl group disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer">
                  {isSubmitting ? t("contact.form.sending") : t("contact.form.send")} 
                  <Send className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 group-hover:-translate-y-2 transition-all duration-300" />
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 sm:py-20 text-center"
              >
                <div className="inline-flex p-6 bg-accent/10 rounded-full text-accent mb-6">
                  <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-primary mb-4">{t("contact.success.title")}</h3>
                <p className="text-sm sm:text-base text-muted-foreground italic">{t("contact.success.desc")}</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-8 sm:mt-10 text-[10px] font-black uppercase tracking-widest text-accent border-b-2 border-accent pb-1 cursor-pointer"
                >
                  {t("contact.success.btn")}
                </button>
              </motion.div>
            )}
          </motion.div>

          <div className="flex flex-col gap-6 sm:gap-10 text-left">
            <motion.div whileHover={{ y: -6, scale: 1.008 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="p-6 sm:p-10 md:p-12 bg-primary text-primary-foreground rounded-3xl sm:rounded-[2.5rem] shadow-strong relative overflow-hidden group hover:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.35)] transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-full bg-accent/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl font-serif mb-6 sm:mb-12 font-bold decoration-accent decoration-2">{t("contact.direct")}</h3>
                <div className="space-y-6 sm:space-y-12">
                  <div className="flex items-center gap-4 sm:gap-8">
                    <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md text-accent ring-1 ring-white/20 group-hover:rotate-12 transition-transform shrink-0">
                      <Phone className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono tracking-[0.3em] uppercase font-black text-accent mb-1.5 sm:mb-2">{t("contact.speak")}</p>
                      <a href="tel:+919359546639" className="text-xl sm:text-2xl font-serif hover:text-accent transition-colors">+91 93595 46639</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-8">
                    <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md text-accent ring-1 ring-white/20 group-hover:-rotate-12 transition-transform shrink-0">
                      <Mail className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono tracking-[0.3em] uppercase font-black text-accent mb-1.5 sm:mb-2">{t("contact.digital")}</p>
                      <a href="mailto:info@ekokintsugi.com" className="text-lg sm:text-2xl font-serif hover:text-accent transition-colors break-all">info@ekokintsugi.com</a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -6, scale: 1.008 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="p-6 sm:p-10 md:p-12 bg-card border-2 border-primary/20 rounded-3xl sm:rounded-[2.5rem] shadow-none group hover:border-accent/40 hover:shadow-strong relative overflow-hidden transition-all duration-300 cursor-pointer">
              <div className="flex items-start gap-4 sm:gap-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-125 group-hover:bg-accent/10 pointer-events-none" />
                <div className="p-4 sm:p-5 rounded-2xl bg-accent/20 text-accent transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 shrink-0">
                  <MapPin className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <p className="text-[10px] font-mono tracking-[0.3em] uppercase font-black text-primary mb-1.5 sm:mb-2">{t("contact.hub")}</p>
                  <p className="text-lg sm:text-2xl font-serif text-primary leading-tight font-bold whitespace-pre-line">{t("contact.address")}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
