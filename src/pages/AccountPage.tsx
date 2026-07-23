import { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, 
  Award, 
  Wallet, 
  LogOut, 
  Calendar, 
  Sparkles, 
  Leaf, 
  Download, 
  QrCode,
  UserRound,
  History,
  ArrowUpRight
} from "lucide-react";

type Order = {
  id: string;
  created_at: string;
  quantity: number;
  total_price: number;
  product: {
    name: string;
    base_price: number;
    category?: string;
    image_url?: string;
  };
};

type ImpactStats = {
  totalCo2: number;
  totalWaste: number;
  treeCount: number;
  credits: number;
};

export default function AccountPage() {
  const { user, displayName, session, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<ImpactStats>({ totalCo2: 0, totalWaste: 0, treeCount: 0, credits: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const walletSuffix = user?.id?.split("-")[0]?.toUpperCase() ?? "VISITOR";
  const certificateName = displayName || "Artisan Voyager";

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth?mode=signin&next=account");
      return;
    }

    async function loadAccountData() {
      setLoading(true);
      setError("");
      
      try {
        const headers = session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined;

        // Fetch user stats and orders in parallel
        const [statsRes, ordersRes] = await Promise.all([
          fetch("/api/impact", { headers }),
          fetch("/api/orders", { headers })
        ]);

        if (!statsRes.ok || !ordersRes.ok) {
          throw new Error("Unable to synchronize with the circular ledger.");
        }

        const statsData = await statsRes.json();
        const ordersData = await ordersRes.json();

        setStats({
          totalCo2: Number(statsData.totalCo2 ?? 0),
          totalWaste: Number(statsData.totalWaste ?? 0),
          treeCount: Number(statsData.treeCount ?? 0),
          credits: Number(statsData.credits ?? 0)
        });
        setOrders(ordersData);
      } catch (err: any) {
        setError(err.message || "Failed to load account details.");
      } finally {
        setLoading(false);
      }
    }

    loadAccountData();
  }, [user, authLoading, session?.access_token, navigate]);

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
    ctx.fillText("OFFICIAL ESG CARBON OFFSET CERTIFICATE", 600, 120);

    // 6. Draw Title
    ctx.fillStyle = "#1B4332";
    ctx.font = "italic bold 40px Georgia, serif";
    ctx.fillText("Certificate of Environmental Stewardship", 600, 200);

    ctx.fillStyle = "#666666";
    ctx.font = "16px sans-serif";
    ctx.fillText("This is proudly presented to", 600, 280);

    // 7. User Name
    ctx.fillStyle = "#1B4332";
    ctx.font = "bold 48px Georgia, serif";
    ctx.fillText(certificateName, 600, 350);

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
    ctx.fillText("In recognition of the verified diversion of", 600, 440);

    ctx.fillStyle = "#1B4332";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(`${stats.totalCo2.toFixed(1)} KG CO2 & ${stats.totalWaste.toFixed(1)} KG WASTE`, 600, 495);

    ctx.fillStyle = "#444444";
    ctx.font = "italic 16px Georgia, serif";
    ctx.fillText("diverted safely from landfills, contributing to organic soil regeneration and reforestation.", 600, 540);

    // 10. Draw Tree Allocations
    ctx.fillStyle = "#C5A880";
    ctx.font = "bold 13px monospace";
    ctx.fillText(`OFFICIALLY ASSIGNED PLANTATION RESERVE: ${stats.treeCount} ACTIVE SAPLINGS`, 600, 590);

    // 11. Security QR Code / Certificate Hash
    ctx.fillStyle = "#777777";
    ctx.font = "11px monospace";
    const serial = `EK-CERT-${(user?.id || "DEMO").substring(0, 8).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    ctx.fillText(`VERIFIED BLOCK ID: ${serial}`, 600, 640);

    // 12. Signatures
    ctx.font = "italic 14px Georgia, serif";
    ctx.fillStyle = "#1B4332";
    ctx.fillText("EkoKintsugi Audit Committee", 350, 715);
    ctx.fillText("Global Reforestation Initiative", 850, 715);

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

  const handleSignOutClick = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || (loading && !error)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen surface-gradient gap-4">
        <span className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin" />
        <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground">Synchronizing Circular Vault...</p>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-32 surface-gradient min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-6 space-y-12 md:space-y-20"
      >
        
        {/* Page Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-8 pb-8 border-b border-border/40">
          <div className="space-y-3 sm:space-y-4">
            <span className="section-badge">
              <span className="section-badge-label">Premium Member Portal</span>
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif font-black text-primary tracking-tight">
              My Circular Heritage
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground italic max-w-xl">
              Manage your ecological credentials, download certified ESG certificates, and review your circular purchase invoices.
            </p>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-3 bg-card border border-border px-4 py-2.5 sm:px-6 sm:py-3 rounded-full text-primary flex-grow sm:flex-grow-0">
              <UserRound className="w-5 h-5 text-accent shrink-0" />
              <div className="text-left">
                <p className="text-xs sm:text-sm font-serif font-black leading-none">{displayName}</p>
                <p className="text-[9px] font-mono opacity-60 mt-1">Citizen #{walletSuffix}</p>
              </div>
            </div>
            
            <button
              onClick={handleSignOutClick}
              className="p-3 sm:p-3.5 rounded-full border border-border/50 text-muted-foreground hover:text-red-500 hover:border-red-500/20 hover:bg-red-500/10 transition-all bg-card cursor-pointer shadow-sm shrink-0"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {error && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-center max-w-md mx-auto space-y-4">
            <p className="text-red-500 font-mono text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-primary-foreground font-mono text-xs tracking-widest uppercase font-bold rounded-xl"
            >
              Retry Sync
            </button>
          </div>
        )}

        {!error && (
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Left Hand: Orders Invoice History */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary flex items-center gap-3">
                <ShoppingBag className="text-accent w-6 h-6 sm:w-7 sm:h-7" /> Purchase Ledger
              </h2>
              
              <div className="space-y-4 sm:space-y-6">
                <AnimatePresence>
                  {orders.map((order, idx) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="bg-card border border-border/80 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] hover:border-accent/40 hover:shadow-soft transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6"
                    >
                      <div className="flex items-center gap-4 sm:gap-5">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary/5 border border-border/50 flex items-center justify-center font-bold text-accent text-lg sm:text-xl relative overflow-hidden shrink-0">
                          {order.product.image_url ? (
                            <img src={order.product.image_url} alt={order.product.name} className="absolute inset-0 w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                          )}
                        </div>
                        
                        <div className="text-left space-y-0.5 sm:space-y-1">
                          <span className="text-[9px] font-mono tracking-widest uppercase font-bold text-accent">
                            {order.product.category || "Circular Craft"}
                          </span>
                          <h3 className="text-base sm:text-xl font-serif font-bold text-primary leading-tight">{order.product.name}</h3>
                          <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> {new Date(order.created_at).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>Qty: {order.quantity}</span>
                            <span>•</span>
                            <span className="bg-accent/15 border border-accent/20 text-accent font-mono text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                              Size: {order.size || "One Size"}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col items-baseline sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0">
                        <p className="text-xl sm:text-2xl font-serif font-black text-primary">${order.total_price.toFixed(2)}</p>
                        <p className="text-[9px] font-mono tracking-wider text-muted-foreground mt-0.5 font-bold uppercase">{order.id.toUpperCase()}</p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {orders.length === 0 && (
                    <div className="bg-card border border-border/60 p-10 sm:p-16 rounded-[2rem] sm:rounded-[2.5rem] text-center space-y-4 sm:space-y-6">
                      <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/40 mx-auto" />
                      <p className="text-sm sm:text-base text-muted-foreground italic">No purchases recorded on this circular credential yet.</p>
                      <button
                        onClick={() => navigate("/products")}
                        className="bg-accent text-accent-foreground px-6 py-2.5 sm:px-8 sm:py-3 rounded-full text-[10px] font-mono tracking-widest uppercase font-black hover:bg-primary hover:text-primary-foreground transition-all duration-300 cursor-pointer"
                      >
                        Explore Products
                      </button>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Hand: Carbon Wallet & Certificates */}
            <div className="space-y-8 sm:space-y-12">
              
              {/* Carbon Wallet Panel */}
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary flex items-center gap-3">
                  <Wallet className="text-accent w-6 h-6 sm:w-7 sm:h-7" /> Carbon Wallet
                </h2>
                
                <motion.div 
                  whileHover={{ y: -6 }}
                  className="bg-primary text-primary-foreground p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-strong relative overflow-hidden group hover:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.3)] transition-all duration-300"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 rounded-full blur-3xl -mr-24 -mt-24 transition-transform duration-700 group-hover:scale-125" />
                  
                  <div className="relative z-10 flex justify-between items-start mb-8 sm:mb-12">
                    <div>
                      <p className="font-mono text-[9px] tracking-widest uppercase text-primary-foreground/80 mb-2">Available Balance</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl sm:text-5xl font-serif font-black tracking-tight">{stats.credits.toFixed(3)}</span>
                        <span className="text-accent dark:text-primary-foreground font-black text-xs tracking-widest uppercase">CC</span>
                      </div>
                    </div>
                    <Wallet className="w-6 h-6 sm:w-8 sm:h-8 opacity-40 text-accent" />
                  </div>

                  <div className="relative z-10 flex gap-3 border-t border-primary-foreground/15 pt-4 sm:pt-6 justify-between items-center">
                    <div>
                      <p className="text-[8px] font-mono tracking-widest uppercase text-primary-foreground/60 mb-1">Contract Address</p>
                      <p className="text-[10px] font-mono text-accent dark:text-primary-foreground">0x71C...9A23{walletSuffix}</p>
                    </div>
                    <QrCode className="w-5 h-5 text-accent opacity-80" />
                  </div>
                </motion.div>
              </div>

              {/* Verified ESG Certificate Panel */}
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary flex items-center gap-3">
                  <Award className="text-accent w-6 h-6 sm:w-7 sm:h-7" /> Certificates
                </h2>
                
                {stats.totalCo2 > 0 ? (
                  <motion.div 
                     whileHover={{ y: -6 }}
                     className="bg-card border border-border/80 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-soft group hover:border-accent/40 transition-all duration-300 space-y-4 sm:space-y-6"
                  >
                    <div className="flex justify-between items-start">
                      <div className="p-2.5 sm:p-3 bg-primary/5 rounded-2xl text-primary group-hover:bg-accent group-hover:text-accent-foreground transition-all">
                        <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full font-bold">
                        <Leaf className="w-3 h-3" /> VERIFIED ESG
                      </span>
                    </div>

                    <div className="text-left space-y-2">
                      <h3 className="text-lg sm:text-xl font-serif font-bold text-primary">Stewardship Certificate</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Acknowledging the verified diversion of <strong className="text-primary">{stats.totalCo2.toFixed(1)} kg CO2</strong> emissions and <strong className="text-primary">{stats.totalWaste.toFixed(1)} kg</strong> landfill waste.
                      </p>
                    </div>

                    <button
                      onClick={downloadCertificate}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent text-accent-foreground px-4 py-3 font-mono text-[9px] tracking-widest uppercase font-black hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Certificate
                    </button>
                  </motion.div>
                ) : (
                  <div className="bg-card border border-border/60 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] text-center space-y-4">
                    <Award className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/30 mx-auto" />
                    <p className="text-xs text-muted-foreground italic leading-relaxed">
                      Complete checkout purchases to verify carbon offsets and generate certificates.
                    </p>
                  </div>
                )}
              </div>

            </div>
            
          </div>
        )}

      </motion.div>
    </div>
  );
}
