import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  Award,
  Download,
  History,
  Leaf,
  LogOut,
  Menu,
  QrCode,
  Share2,
  TreePine,
  TrendingDown,
  Wallet,
  UserRound,
  X
} from "lucide-react";
import { type FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { useLanguage } from "../lib/LanguageContext";

type ImpactRecord = {
  id: string;
  created_at: string;
  co2_saved_kg: number;
  waste_diverted_kg: number;
  tree_id: string | null;
};

type ImpactStats = {
  totalCo2: number;
  totalWaste: number;
  treeCount: number;
  credits: number;
  records: ImpactRecord[];
  trees: Array<{
    id: string;
    location: string;
    status: string;
    planted_at: string;
  }>;
};

const emptyImpactStats: ImpactStats = {
  totalCo2: 0,
  totalWaste: 0,
  treeCount: 0,
  credits: 0,
  records: [],
  trees: []
};

function normalizeImpactStats(payload: unknown): ImpactStats {
  if (!payload || typeof payload !== "object") {
    return emptyImpactStats;
  }

  const data = payload as Partial<ImpactStats>;
  const records = Array.isArray(data.records)
    ? data.records.map((record: any, index) => ({
        id: String(record?.id ?? `record-${index}`),
        created_at: typeof record?.created_at === "string" ? record.created_at : new Date().toISOString(),
        co2_saved_kg: Number(record?.co2_saved_kg ?? 0),
        waste_diverted_kg: Number(record?.waste_diverted_kg ?? 0),
        tree_id: record?.tree_id ? String(record.tree_id) : null
      }))
    : [];

  const trees = Array.isArray((data as any).trees)
    ? (data as any).trees.map((tree: any, index: number) => ({
        id: String(tree?.id ?? `tree-${index}`),
        location: String(tree?.location ?? "Agra Reforest Zone B-12"),
        status: String(tree?.status ?? "seed"),
        planted_at: typeof tree?.planted_at === "string" ? tree.planted_at : new Date().toISOString()
      }))
    : [];

  return {
    totalCo2: Number(data.totalCo2 ?? 0),
    totalWaste: Number(data.totalWaste ?? 0),
    treeCount: Number(data.treeCount ?? 0),
    credits: Number(data.credits ?? 0),
    records,
    trees
  };
}

const StatCard: FC<{
  icon: any;
  label: string;
  value: string | number;
  unit: string;
  delay?: number;
}> = ({
  icon: Icon,
  label,
  value,
  unit,
  delay = 0
}) => {
  const { t } = useLanguage();
  return (
    <motion.div whileHover={{ y: -6, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 350, damping: 22 }}
      className="p-8 bg-card border border-border/50 rounded-3xl shadow-soft group hover:border-accent/40 hover:shadow-strong transition-all duration-300 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-primary/5 rounded-xl text-primary group-hover:bg-accent group-hover:text-amber-50 transition-all">
          <Icon className="w-6 h-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" />
        </div>
        <span className="text-[10px] font-mono font-bold text-accent tracking-widest uppercase">{t("dashboard.wallet.verified")}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-serif font-black text-primary">
          {value}
        </motion.span>
        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{unit}</span>
      </div>
      <p className="text-xs font-mono text-muted-foreground uppercase tracking-tight">{label}</p>
    </motion.div>
  );
};

const TimelineItem: FC<{
  date: string;
  title: string;
  impact: string;
  icon: any;
  isLast: boolean;
}> = ({
  date,
  title,
  impact,
  icon: Icon,
  isLast
}) => (
  <div className="flex gap-6 relative">
    {!isLast && <div className="absolute left-[24px] top-[48px] bottom-0 w-0.5 bg-border/40" />}
    <div className={`z-10 p-3 rounded-full h-fit shadow-lg ${title.includes("Tree") || title.includes("sapling") || title.includes("Baum") || title.includes("Setzling") ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="pb-10">
      <p className="text-[10px] font-mono font-black text-accent uppercase mb-1 tracking-widest">{date}</p>
      <h4 className="text-xl font-serif font-bold text-primary mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground italic">{impact}</p>
    </div>
  </div>
);

export default function ImpactDashboard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "tree" | "certificate" | "wallet">("overview");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stats, setStats] = useState<ImpactStats>(emptyImpactStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { session, user, displayName, isLoading: authLoading, signOut } = useAuth();
  const { t } = useLanguage();

  const isDemo = !user;
  const walletSuffix = user?.id.split("-")[0] ?? "DEMO";
  const certificateName = isDemo ? (t("dashboard.demo_mode") === "Demo-Besuchermodus" ? "Artisan-Reisender" : "Artisan Voyager") : displayName;

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate("/", { replace: false });
  };

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab("overview");
    setIsMenuOpen(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || authLoading) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    async function loadImpact() {
      setLoading(true);
      setError("");

      try {
        const query = isDemo ? "?demo=true" : "";
        const response = await fetch(`/api/impact${query}`, {
          signal: controller.signal,
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : undefined
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(typeof payload?.error === "string" ? payload.error : "Unable to load impact data.");
        }

        setStats(normalizeImpactStats(payload));
      } catch (fetchError: any) {
        setStats(emptyImpactStats);
        setError(
          controller.signal.aborted
            ? "Impact data took too long to load. Please try again."
            : fetchError?.message || "Unable to load impact data right now."
        );
      } finally {
        setLoading(false);
        window.clearTimeout(timeoutId);
      }
    }

    loadImpact();

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [authLoading, isDemo, isOpen, session?.access_token]);

  const downloadCertificate = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Draw elegant beige double gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 800);
    bgGrad.addColorStop(0, "#F4F1EA");
    bgGrad.addColorStop(1, "#EAE6DF");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 800);

    // 2. Draw outer border
    ctx.lineWidth = 16;
    ctx.strokeStyle = "#1B4332"; // Eko Forest Green
    ctx.strokeRect(20, 20, 1160, 760);

    // 3. Draw inner thin gold border
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#C5A880"; // Gold
    ctx.strokeRect(36, 36, 1128, 728);

    // 4. Draw ornamental corner anchors
    const drawOrnament = (x: number, y: number) => {
      ctx.fillStyle = "#C5A880";
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    };
    drawOrnament(36, 36);
    drawOrnament(1164, 36);
    drawOrnament(36, 764);
    drawOrnament(1164, 764);

    // 5. Draw Header Text
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#C5A880";
    ctx.font = "bold 13px monospace";
    ctx.fillText(t("dashboard.cert.calligraphy.header"), 600, 120);

    // 6. Draw Title
    ctx.fillStyle = "#1B4332";
    ctx.font = "italic bold 40px Georgia, serif";
    ctx.fillText(t("dashboard.cert.calligraphy.title"), 600, 200);

    ctx.fillStyle = "#666666";
    ctx.font = "16px sans-serif";
    ctx.fillText(t("dashboard.cert.calligraphy.presented"), 600, 280);

    // 7. User Name
    ctx.fillStyle = "#1B4332";
    ctx.font = "bold 48px Georgia, serif";
    ctx.fillText(certificateName || "Artisan Voyager", 600, 350);

    // 8. Line separator
    ctx.beginPath();
    ctx.moveTo(450, 400);
    ctx.lineTo(750, 400);
    ctx.strokeStyle = "#C5A880";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 9. Contribution statement
    ctx.fillStyle = "#444444";
    ctx.font = "italic 18px Georgia, serif";
    ctx.fillText(t("dashboard.cert.calligraphy.recognition"), 600, 440);

    ctx.fillStyle = "#1B4332";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(`${stats.totalCo2.toFixed(1)} KG CO2 & ${stats.totalWaste.toFixed(1)} KG WASTE`, 600, 495);

    ctx.fillStyle = "#444444";
    ctx.font = "italic 16px Georgia, serif";
    ctx.fillText(t("dashboard.cert.calligraphy.sentence"), 600, 540);

    // 10. Draw Tree Allocations
    ctx.fillStyle = "#C5A880";
    ctx.font = "bold 13px monospace";
    ctx.fillText(`${t("dashboard.cert.calligraphy.reserve")}: ${stats.treeCount} ${t("dashboard.cert.calligraphy.saplings").toUpperCase()}`, 600, 590);

    // 11. Security QR Code / Certificate Hash
    ctx.fillStyle = "#777777";
    ctx.font = "11px monospace";
    const serial = `EK-CERT-${(user?.id || "DEMO").substring(0, 8).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    ctx.fillText(`${t("dashboard.cert.calligraphy.block")}: ${serial}`, 600, 640);

    // 12. Signatures
    ctx.font = "italic 14px Georgia, serif";
    ctx.fillStyle = "#1B4332";
    ctx.fillText(t("dashboard.cert.calligraphy.signature1"), 350, 715);
    ctx.fillText(t("dashboard.cert.calligraphy.signature2"), 850, 715);

    ctx.beginPath();
    ctx.moveTo(230, 695);
    ctx.lineTo(470, 695);
    ctx.moveTo(730, 695);
    ctx.lineTo(970, 695);
    ctx.strokeStyle = "#C5A880";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Export and trigger download
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `ekokintsugi-esg-certificate.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] surface-gradient flex flex-col md:flex-row overflow-hidden text-left">
      <div className="w-full md:w-80 bg-primary flex flex-col text-primary-foreground border-b md:border-b-0 md:border-r border-primary-foreground/10 shrink-0 relative">
        <div className="flex items-center justify-between p-5 md:p-8 md:mb-6 z-50">
          <div className="flex items-center gap-3">
            <span className="logo-surface shrink-0">
              <img src="/logo_eko.png" alt="Logo" className="h-7 md:h-8 w-auto" />
            </span>
            <div className="leading-tight">
              <h2 className="text-base md:text-xl font-serif font-bold">{t("dashboard.hub")}</h2>
              <p className="text-[9px] font-mono tracking-widest uppercase text-primary-foreground/75">
                {isDemo ? t("dashboard.demo_mode") : t("dashboard.personal_mode")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile Dropdown Menu Toggle (Visible below md: breakpoint) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex md:hidden p-2 rounded-full hover:bg-primary-foreground/10 text-primary-foreground cursor-pointer transition-colors"
              aria-label="Toggle Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-primary-foreground/10 text-primary-foreground cursor-pointer transition-colors" title={t("dashboard.back_to_site")}>
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Desktop Vertical Menu (Hidden on mobile) */}
        <nav className="hidden md:flex flex-col px-8 flex-1 space-y-2">
          {[
            { id: "overview", icon: TrendingDown, label: t("dashboard.tab.overview") },
            { id: "tree", icon: TreePine, label: t("dashboard.tab.tree") },
            { id: "certificate", icon: Award, label: t("dashboard.tab.cert") },
            { id: "wallet", icon: Wallet, label: t("dashboard.tab.wallet") },
            { id: "account", icon: UserRound, label: t("dashboard.tab.account") }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "account") {
                  onClose();
                  navigate("/account");
                } else {
                  setActiveTab(item.id as "overview" | "tree" | "certificate" | "wallet");
                }
              }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all cursor-pointer font-bold uppercase text-[10px] tracking-[0.2em] ${
                activeTab === item.id ? "bg-accent text-accent-foreground shadow-lg translate-x-2" : "hover:bg-primary-foreground/10 opacity-70"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex p-8 border-t border-primary-foreground/10 flex-col space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">
              {certificateName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-serif font-bold leading-tight">{certificateName}</p>
              <p className="text-[9px] font-mono opacity-60">Citizen #{walletSuffix}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent text-accent-foreground px-4 py-3 font-mono text-[9px] tracking-widest uppercase font-bold hover:bg-accent/80 transition-all cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> {t("dashboard.back_to_site")}
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/20 px-4 py-3 font-mono text-[9px] tracking-widest uppercase font-bold hover:bg-red-500 hover:border-red-500 hover:text-white transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> {isDemo ? t("dashboard.exit_preview") : t("dashboard.sign_out")}
          </button>
        </div>

        {/* Premium Mobile Glassmorphic Dropdown Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute top-[105%] left-4 right-4 p-6 rounded-[2rem] border border-primary-foreground/10 bg-primary/95 backdrop-blur-xl shadow-strong flex flex-col gap-6 md:hidden z-40 text-left text-primary-foreground"
            >
              {/* Navigation Links */}
              <div className="flex flex-col gap-4 border-b border-primary-foreground/15 pb-4">
                {[
                  { id: "overview", icon: TrendingDown, label: t("dashboard.tab.overview") },
                  { id: "tree", icon: TreePine, label: t("dashboard.tab.tree") },
                  { id: "certificate", icon: Award, label: t("dashboard.tab.cert") },
                  { id: "wallet", icon: Wallet, label: t("dashboard.tab.wallet") },
                  { id: "account", icon: UserRound, label: t("dashboard.tab.account") }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (item.id === "account") {
                        onClose();
                        navigate("/account");
                      } else {
                        setActiveTab(item.id as "overview" | "tree" | "certificate" | "wallet");
                      }
                    }}
                    className={`flex items-center gap-3 py-1.5 font-mono text-xs uppercase tracking-widest font-bold text-left cursor-pointer transition-colors ${
                      activeTab === item.id ? "text-accent" : "text-primary-foreground/80 hover:text-accent"
                    }`}
                  >
                    <item.icon className="w-4.5 h-4.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Citizen Card & Actions */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">
                    {certificateName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-serif font-bold leading-tight">{certificateName}</p>
                    <p className="text-[9px] font-mono opacity-60">Citizen #{walletSuffix}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-accent text-accent-foreground px-4 py-3 font-mono text-[9px] tracking-widest uppercase font-bold hover:bg-accent/80 transition-all cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0" /> {t("dashboard.back_to_site")}
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/20 px-4 py-3 font-mono text-[9px] tracking-widest uppercase font-bold hover:bg-red-500 hover:border-red-500 hover:text-white transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" /> {isDemo ? t("dashboard.exit_preview") : t("dashboard.sign_out")}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-8 md:p-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <span className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin" />
            <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground">{t("dashboard.loading")}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-6">
            <p className="text-red-500 font-mono italic text-sm">{error}</p>
            <button
              onClick={onClose}
              className="rounded-full bg-primary text-primary-foreground px-6 py-3 font-mono text-[10px] tracking-widest uppercase font-bold"
            >
              {t("dashboard.error_back")}
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-16">
                <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                  <div>
                    <p className="text-accent font-mono text-[10px] tracking-[0.4em] uppercase font-black mb-4">{t("dashboard.overview.badge")}</p>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-2">{t("dashboard.overview.title")}</h2>
                    <p className="text-muted-foreground italic">{t("dashboard.overview.desc")}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 bg-emerald-500/10 px-4 py-2.5 rounded-full border border-emerald-500/20 font-bold shrink-0 w-fit">
                    <Leaf className="w-4 h-4" /> {t("dashboard.overview.certified")}
                  </div>
                </header>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard icon={TrendingDown} label={t("dashboard.stat.co2")} value={stats.totalCo2.toFixed(1)} unit="KG" delay={0.05} />
                  <StatCard icon={History} label={t("dashboard.stat.waste")} value={stats.totalWaste.toFixed(1)} unit="KG" delay={0.1} />
                  <StatCard icon={TreePine} label={t("dashboard.stat.trees")} value={stats.treeCount} unit="Unit" delay={0.15} />
                  <StatCard icon={Wallet} label={t("dashboard.stat.wallet")} value={stats.credits.toFixed(3)} unit="CC" delay={0.2} />
                </div>

                <div className="grid lg:grid-cols-2 gap-16">
                  <section>
                    <h3 className="text-2xl font-serif font-bold text-primary mb-10 flex items-center gap-3">
                      <History className="text-accent" /> {t("dashboard.timeline.title")}
                    </h3>
                    <div className="bg-card p-10 rounded-[2.5rem] border border-border/50 max-h-[420px] overflow-y-auto space-y-2">
                      {stats.records.map((record, idx) => (
                        <TimelineItem
                          key={record.id}
                          date={new Date(record.created_at).toLocaleDateString()}
                          title={`${t("dashboard.timeline.order")}: ${record.co2_saved_kg.toFixed(1)}kg CO2`}
                          impact={`${t("impactpage.metrics.waste")}: ${record.waste_diverted_kg.toFixed(1)}kg ${t("dashboard.timeline.diverted")}`}
                          icon={record.tree_id ? TreePine : Award}
                          isLast={idx === stats.records.length - 1}
                        />
                      ))}
                      {stats.records.length === 0 && (
                        <div className="text-center py-10">
                          <p className="text-muted-foreground italic mb-6">
                            {t("dashboard.timeline.empty")}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-2xl font-serif font-bold text-primary mb-10 flex items-center gap-3">
                      <Share2 className="text-accent" /> {t("dashboard.share.title")}
                    </h3>
                    <motion.div whileHover={{ y: -6, scale: 1.008 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="bg-primary p-12 rounded-[2.5rem] text-primary-foreground relative overflow-hidden group hover:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.35)] transition-all duration-300">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-accent/20 rounded-full -mr-20 -mt-20 blur-3xl transition-transform duration-700 group-hover:scale-125" />
                      <div className="relative z-10 flex flex-col h-full">
                        <p className="font-mono text-[10px] tracking-[0.4em] uppercase mb-6 text-accent dark:text-primary-foreground">{t("dashboard.share.badge")}</p>
                        <h4 className="text-4xl font-serif font-bold mb-6">{t("dashboard.share.quote")}</h4>
                        <div className="mt-auto pt-8 border-t border-primary-foreground/20 flex justify-between items-center">
                          <div className="flex gap-2">
                            <button type="button" className="p-3 bg-primary-foreground/10 rounded-xl hover:bg-accent transition-colors cursor-pointer">
                              <Share2 className="w-5 h-5" />
                            </button>
                            <button type="button" className="p-3 bg-primary-foreground/10 rounded-xl hover:bg-accent transition-colors cursor-pointer" onClick={downloadCertificate}>
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                          <img src="/logo_eko.png" className="h-8" alt="EkoKintsugi logo" />
                        </div>
                      </div>
                    </motion.div>
                  </section>
                </div>

                {/* Mobile-only profile details and sign out actions */}
                <div className="flex flex-col gap-4 p-6 rounded-3xl bg-card border border-border/50 md:hidden text-left mt-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">
                      {certificateName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-serif font-bold leading-tight">{certificateName}</p>
                      <p className="text-[9px] font-mono opacity-60">Citizen #{walletSuffix}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={onClose}
                      className="flex items-center justify-center gap-2 rounded-xl bg-accent text-accent-foreground px-4 py-3 font-mono text-[9px] tracking-widest uppercase font-bold hover:bg-accent/80 transition-all cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0" /> {t("dashboard.back_to_site")}
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 px-4 py-3 font-mono text-[9px] tracking-widest uppercase font-bold hover:bg-red-500 hover:border-red-500 hover:text-white transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 shrink-0" /> {isDemo ? t("dashboard.exit_preview") : t("dashboard.sign_out")}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "tree" && (
              <motion.div key="tree" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-5xl mx-auto">
                <h2 className="text-4xl font-serif font-bold text-primary mb-12">{t("dashboard.tree.title")}</h2>
                <div className="grid lg:grid-cols-5 gap-12">
                  <div className="lg:col-span-3 space-y-8">
                    <div className="bg-card border border-border p-5 rounded-3xl shadow-strong aspect-video relative overflow-hidden">
                      <img src="/images/sections/reforestation-map.jpg" alt="Reforestation map" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-x-5 bottom-5 bg-background/90 backdrop-blur border border-border rounded-2xl px-5 py-4 font-mono text-[10px] tracking-widest text-primary uppercase">
                        {isDemo ? t("dashboard.tree.map_demo") : t("dashboard.tree.map_live")}
                      </div>
                    </div>
                    <motion.div whileHover={{ y: -6, scale: 1.008 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="bg-card p-10 rounded-3xl border border-border group hover:border-accent/40 hover:shadow-strong transition-all duration-300">
                      <div className="flex justify-between items-center mb-8">
                        <div>
                          <h4 className="text-2xl font-serif font-bold text-primary">{t("dashboard.tree.stats_title")}</h4>
                          <p className="text-sm font-mono text-accent dark:text-primary font-bold">{t("dashboard.tree.allocated")}: {stats.treeCount}</p>
                        </div>
                        <div className="bg-primary/5 px-4 py-2 rounded-lg text-primary text-[10px] font-black uppercase tracking-widest">{t("dashboard.tree.active_growth")}</div>
                      </div>
                      <div className="flex justify-between items-end gap-2 h-20">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                          <div
                            key={value}
                            className={`flex-1 rounded-t-lg transition-all ${value <= Math.min(stats.treeCount, 10) ? "bg-accent" : "bg-muted/30"}`}
                            style={{ height: `${value * 10}%` }}
                          />
                        ))}
                      </div>
                      <p className="text-center mt-6 text-xs font-mono text-muted-foreground uppercase font-bold tracking-widest">
                        {stats.treeCount > 0 ? t("dashboard.tree.factor_healthy") : t("dashboard.tree.factor_awaiting")}
                      </p>
                    </motion.div>
                  </div>
                  <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
                      <TreePine className="text-accent" /> {t("dashboard.tree.registry")}
                    </h3>
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-soft max-h-[400px] overflow-y-auto space-y-4">
                      {isDemo ? (
                        [
                          { id: "tree-1", location: "Agra Zone A-1", status: "sapling", date: "2026-04-18" },
                          { id: "tree-2", location: "Agra Zone B-4", status: "seed", date: "2026-04-12" },
                          { id: "tree-3", location: "Agra Zone C-2", status: "sapling", date: "2026-04-06" }
                        ].map((tree, i) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-muted/20 border border-border/50 rounded-2xl">
                            <div>
                              <p className="text-xs font-mono font-bold text-primary">{tree.id.toUpperCase()}</p>
                              <p className="text-[10px] text-muted-foreground">{tree.location} • Planted {tree.date}</p>
                            </div>
                            <span className="bg-accent/15 text-accent px-2 py-0.5 rounded-lg text-[9px] font-mono uppercase font-black">
                              {tree.status}
                            </span>
                          </div>
                        ))
                      ) : stats.trees && stats.trees.length > 0 ? (
                        stats.trees.map((tree: any, i: number) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-muted/20 border border-border/50 rounded-2xl hover:border-accent/40 transition-all">
                            <div>
                              <p className="text-xs font-mono font-bold text-primary">TREE-{tree.id.substring(5, 9).toUpperCase()}</p>
                              <p className="text-[10px] text-muted-foreground">{tree.location} • {new Date(tree.planted_at).toLocaleDateString()}</p>
                            </div>
                            <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-lg text-[9px] font-mono uppercase font-black flex items-center gap-1">
                              🪴 {tree.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-xs text-muted-foreground italic py-8">
                          {t("dashboard.tree.empty_registry")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "certificate" && (
              <div className="max-w-3xl mx-auto py-12">
                {stats.totalCo2 > 0 ? (
                  <div className="space-y-6">
                    <motion.div whileHover={{ y: -8, scale: 1.008 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="bg-card p-16 rounded-[4rem] shadow-strong border-[16px] border-primary relative overflow-hidden hover:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-300">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-[100px]" />
                      <div className="text-center mb-16">
                        <img src="/logo_eko.png" className="h-16 mx-auto mb-10" alt="Logo" />
                        <h2 className="text-xs font-mono tracking-[0.5em] uppercase font-black text-accent mb-6">{t("dashboard.tab.cert")}</h2>
                        <h3 className="text-5xl font-serif font-bold text-primary mb-4 italic">{certificateName}</h3>
                        <div className="w-20 h-px bg-accent mx-auto" />
                      </div>

                      <div className="space-y-10">
                        <div className="flex justify-between items-center border-b border-border pb-6">
                          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-muted-foreground">{t("dashboard.overview.badge")}</span>
                          <span className="text-xl font-serif font-bold text-primary">{stats.totalCo2.toFixed(1)} KG CO2 Saved</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-border pb-6">
                          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-muted-foreground">{t("dashboard.cert.cert_status")}</span>
                          <span className="text-lg font-serif">{t("dashboard.cert.platinum")}</span>
                        </div>
                      </div>
                    </motion.div>
                    
                    <button
                      type="button"
                      onClick={downloadCertificate}
                      className="w-full flex items-center justify-center gap-3 rounded-2xl bg-accent text-accent-foreground px-6 py-4 font-mono text-[10px] tracking-widest uppercase font-black hover:bg-primary hover:text-primary-foreground transition-all shadow-md cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-accent-foreground group-hover:text-primary-foreground" />
                      {t("dashboard.share.btn_cert")}
                    </button>
                  </div>
                ) : (
                  <p className="text-center italic opacity-50 py-12 text-muted-foreground">
                    {isDemo ? t("dashboard.cert.demo_placeholder") : t("dashboard.cert.purchase_placeholder")}
                  </p>
                )}
              </div>
            )}

            {activeTab === "wallet" && (
              <motion.div key="wallet" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto">
                <header className="mb-12">
                  <p className="text-accent font-mono text-[10px] tracking-[0.4em] uppercase font-black mb-4">{t("dashboard.wallet.badge")}</p>
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-2">{t("dashboard.wallet.title")}</h2>
                  <p className="text-muted-foreground italic">{t("dashboard.wallet.desc")}</p>
                </header>

                <div className="grid md:grid-cols-5 gap-8 mb-12">
                  <motion.div whileHover={{ y: -6, scale: 1.008 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="md:col-span-3 bg-primary text-primary-foreground p-12 rounded-[2.5rem] shadow-strong relative overflow-hidden flex flex-col justify-between group hover:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.35)] transition-all duration-300">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-125" />

                    <div className="relative z-10 flex justify-between items-start mb-16">
                      <div>
                        <p className="font-mono text-[10px] tracking-widest uppercase text-primary-foreground/85 mb-2">{t("dashboard.wallet.balance")}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-6xl md:text-8xl font-serif font-black tracking-tighter">{stats.credits.toFixed(3)}</span>
                          <span className="text-accent dark:text-primary-foreground font-bold tracking-widest uppercase">CC</span>
                        </div>
                      </div>
                      <Wallet className="w-10 h-10 opacity-50" />
                    </div>

                    <div className="relative z-10 flex gap-4">
                      <button type="button" className="bg-accent text-accent-foreground px-8 py-4 rounded-xl font-mono text-[10px] tracking-widest uppercase font-bold hover:bg-primary-foreground hover:text-primary transition-all">
                        {t("dashboard.wallet.redeem")}
                      </button>
                      <button type="button" className="bg-primary-foreground/10 px-8 py-4 rounded-xl font-mono text-[10px] tracking-widest uppercase font-bold hover:bg-primary-foreground/20 transition-all flex items-center gap-2">
                        <QrCode className="w-4 h-4" /> {t("dashboard.wallet.receive")}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -6, scale: 1.008 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="md:col-span-2 bg-card border border-border rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center group hover:border-accent/40 hover:shadow-strong transition-all duration-300">
                    <div className="p-4 bg-primary/5 rounded-2xl mb-6">
                      <QrCode className="w-16 h-16 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
                    </div>
                    <p className="text-xs font-mono tracking-widest uppercase font-bold mb-2">{t("dashboard.wallet.address")}</p>
                    <p className="text-sm font-mono text-muted-foreground break-all bg-muted/30 p-3 rounded-lg w-full">0x71C...9A23{walletSuffix}</p>
                  </motion.div>
                </div>

                <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="bg-card border border-border rounded-[2.5rem] p-10 hover:shadow-strong transition-all duration-300">
                  <h3 className="text-xl font-serif font-bold text-primary mb-8 flex items-center gap-3">
                    <History className="w-5 h-5 text-accent" /> {t("dashboard.wallet.ledger")}
                  </h3>

                  {stats.records.length > 0 ? (
                    <div className="space-y-6">
                      {stats.records.slice(0, 5).map((record) => {
                        const creditsEarned = (record.co2_saved_kg / 1000).toFixed(4);

                        return (
                          <div key={record.id} className="flex items-center justify-between p-4 hover:bg-muted/20 rounded-xl transition-colors border-b border-border last:border-0">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                <ArrowUpRight className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold text-primary font-serif">{t("dashboard.wallet.contract_mint")}</p>
                                <p className="text-xs text-muted-foreground font-mono">{new Date(record.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-accent font-mono">+ {creditsEarned} CC</p>
                              <p className="text-[10px] text-muted-foreground uppercase">{t("dashboard.wallet.verified")}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center italic opacity-50 py-8 text-muted-foreground">{t("dashboard.wallet.empty_ledger")}</p>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
