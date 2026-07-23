import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { useEffect, useState } from "react";
import { useLanguage } from "../lib/LanguageContext";

export default function TreePreviewSection() {
  const { session, user } = useAuth();
  const [treeCount, setTreeCount] = useState(4);
  const { t } = useLanguage();

  useEffect(() => {
    if (!user) {
      setTreeCount(4);
      return;
    }
    const controller = new AbortController();
    fetch("/api/impact", {
      signal: controller.signal,
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.treeCount === "number") {
          setTreeCount(data.treeCount);
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [user, session?.access_token]);

  return (
    <section className="py-16 md:py-28 surface-gradient border-t border-border/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10 md:mb-14 text-center">
          <span className="section-badge">
            <span className="section-badge-label">{t("tree.preview.badge")}</span>
          </span>
          <h2 className="mt-6 text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-primary leading-tight">{t("dashboard.tree.title")}</h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-lg text-muted-foreground italic leading-relaxed">
            {t("tree.preview.desc")}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12">
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            <div className="bg-card border border-border p-4 sm:p-5 rounded-3xl shadow-strong aspect-video relative overflow-hidden">
              <img src="/images/sections/reforestation-map.jpg" alt="Reforestation map" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-x-3 bottom-3 sm:inset-x-5 sm:bottom-5 bg-background/90 backdrop-blur border border-border rounded-xl sm:rounded-2xl px-3 py-2.5 sm:px-5 sm:py-4 font-mono text-[8px] sm:text-[10px] tracking-widest text-primary uppercase">
                {user ? t("dashboard.tree.map_live") : t("dashboard.tree.map_demo")}
              </div>
            </div>

            <div className="bg-card p-5 sm:p-10 rounded-3xl border border-border shadow-soft text-left">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
                <div>
                  <h3 className="text-lg sm:text-2xl font-serif font-bold text-primary">{t("dashboard.tree.stats_title")}</h3>
                  <p className="text-xs sm:text-sm font-mono text-accent dark:text-primary font-bold">{t("dashboard.tree.allocated")}: {treeCount}</p>
                </div>
                <div className="bg-primary/5 px-4 py-2 rounded-lg text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-widest w-fit">
                  {t("dashboard.tree.active_growth")}
                </div>
              </div>

              <div className="flex justify-between items-end gap-1.5 sm:gap-2 h-20">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <div
                    key={value}
                    className={`flex-1 rounded-t-md sm:rounded-t-lg transition-all ${value <= Math.min(treeCount, 10) ? "bg-accent" : "bg-muted/30"}`}
                    style={{ height: `${value * 10}%` }}
                  />
                ))}
              </div>

              <p className="text-center mt-6 text-[10px] sm:text-xs font-mono text-muted-foreground uppercase font-bold tracking-widest">
                {treeCount > 0 ? t("dashboard.tree.factor_healthy") : t("dashboard.tree.factor_awaiting")}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video lg:aspect-[3/4] bg-muted/20 rounded-3xl border border-dashed border-border flex items-center justify-center overflow-hidden">
              <img src="/images/sections/forest.jpg" className="w-full h-full object-cover grayscale opacity-50 transition-all hover:grayscale-0 hover:opacity-100" alt="Tree canopy" />
            </div>

            <div className="bg-primary text-primary-foreground rounded-3xl p-6 sm:p-8 shadow-strong relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-accent/20 blur-3xl" />
              <div className="relative z-10">
                <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-accent dark:text-primary-foreground font-black mb-4">{t("tree.preview.sub")}</p>
                <h3 className="text-xl sm:text-3xl font-serif font-bold mb-4">{t("tree.preview.dpp")}</h3>
                <p className="text-xs sm:text-base text-primary-foreground/75 leading-relaxed mb-6">
                  {t("tree.preview.desc")}
                </p>
                <Link
                  to="/?impact=open"
                  className="inline-flex rounded-2xl bg-accent px-6 py-3 text-[10px] font-mono uppercase tracking-widest font-black text-accent-foreground hover:bg-primary-foreground hover:text-primary transition-colors"
                >
                  {t("tree.preview.btn")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
