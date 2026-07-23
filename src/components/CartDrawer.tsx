import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Trash2, Plus, Minus, ShoppingBag, Leaf, Sparkles, CheckCircle, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { useCart } from "../lib/CartContext";
import { useAuth } from "../lib/AuthContext";

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setCartOpen,
    removeFromCart,
    updateQuantity,
    totalCo2Saved,
    totalWasteReclaimed,
    totalItems,
    clearCart
  } = useCart();

  const { session, user } = useAuth();
  
  // States for Carbon Credits and Checkout form
  const [availableCredits, setAvailableCredits] = useState(0);
  const [useCredits, setUseCredits] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  
  // Shipping Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  // Load Carbon Credits balance when Cart is active
  useEffect(() => {
    if (!isCartOpen || !user) return;
    
    // Set default name and email from profile
    setName(user.user_metadata?.name || user.email?.split("@")[0] || "");
    setEmail(user.email || "");
    
    async function fetchCredits() {
      try {
        const query = !user ? "?demo=true" : "";
        const response = await fetch(`/api/impact${query}`, {
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : undefined
        });
        if (response.ok) {
          const data = await response.json();
          if (data && typeof data.credits === "number") {
            setAvailableCredits(data.credits);
          }
        }
      } catch (err) {
        console.error("Failed to load credits for cart drawer:", err);
      }
    }
    fetchCredits();
  }, [isCartOpen, user, session?.access_token]);

  // Handle Checkout submission
  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !address.trim()) {
      setFormError("Please fill out all required fields.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    try {
      const appliedCredits = useCredits ? availableCredits : 0;
      const response = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: session?.access_token ? `Bearer ${session.access_token}` : "",
          "x-mock-user-id": user?.id || ""
        },
        body: JSON.stringify({
          items: cartItems,
          shippingDetails: { name, email, address, notes },
          appliedCredits
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to dispatch order selection.");
      }

      setCheckoutResult(payload);
      clearCart();
    } catch (err: any) {
      setFormError(err.message || "Something went wrong during checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAll = () => {
    setCheckoutResult(null);
    setShowCheckoutForm(false);
    setUseCredits(false);
    setCartOpen(false);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseAll}
            className="fixed inset-0 bg-background/50 backdrop-blur-sm z-[70] cursor-pointer"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-card border-l border-border/50 shadow-strong z-[80] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <header className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/20">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-serif font-bold text-primary">
                  {checkoutResult ? "Dispatch Confirmed" : showCheckoutForm ? "Circular Shipping" : "Circular Selection"}
                </h2>
              </div>
              <button
                onClick={handleCloseAll}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Content Switcher */}
            <div className="flex-1 overflow-y-auto p-6 relative">
              <AnimatePresence mode="wait">
                {checkoutResult ? (
                  /* --- 1. SUCCESS STATE --- */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center py-10 space-y-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      className="p-4 bg-accent/15 rounded-full text-accent"
                    >
                      <CheckCircle className="w-16 h-16" />
                    </motion.div>

                    <div>
                      <h3 className="text-3xl font-serif font-bold text-primary mb-2">Order Confirmed!</h3>
                      <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
                        Tracking Ref: <span className="text-accent font-black">{checkoutResult.trackingNumber}</span>
                      </p>
                    </div>

                    <div className="w-full bg-muted/20 border border-border p-6 rounded-3xl space-y-4">
                      <h4 className="text-xs font-mono text-accent uppercase font-black tracking-widest text-left">
                        ESG Impact Registered
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="p-3 bg-card border border-border/55 rounded-2xl">
                          <p className="text-[9px] font-mono text-muted-foreground uppercase">CO2 Offset</p>
                          <p className="text-lg font-serif font-bold text-primary">{checkoutResult.co2Saved.toFixed(1)} kg</p>
                        </div>
                        <div className="p-3 bg-card border border-border/55 rounded-2xl">
                          <p className="text-[9px] font-mono text-muted-foreground uppercase">Waste Diverted</p>
                          <p className="text-lg font-serif font-bold text-primary">{checkoutResult.wasteReclaimed.toFixed(1)} kg</p>
                        </div>
                      </div>
                      <div className="p-3 bg-primary/5 rounded-2xl text-left flex items-center gap-3">
                        <Leaf className="w-5 h-5 text-accent shrink-0" />
                        <p className="text-xs text-primary font-bold">
                          Supports {checkoutResult.treesPlanted} {checkoutResult.treesPlanted === 1 ? "sapling allocation" : "sapling allocations"} in Agra plantation reserve!
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border border-dashed border-border rounded-2xl text-xs text-muted-foreground italic leading-relaxed">
                      A circular pre-order verification email has been simulated and saved to your EkoKintsugi outbox logs.
                    </div>

                    <button
                      onClick={handleCloseAll}
                      className="w-full rounded-full bg-primary text-primary-foreground px-6 py-4 font-mono text-[10px] tracking-widest uppercase font-black hover:bg-accent hover:text-accent-foreground transition-all shadow-md"
                    >
                      Close Drawer
                    </button>
                  </motion.div>
                ) : showCheckoutForm ? (
                  /* --- 2. SHIPPING FORM STATE --- */
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 text-xs font-mono text-accent uppercase font-black">
                      <ShieldCheck className="w-4 h-4" /> Secure Eco-Checkout
                    </div>

                    <form onSubmit={handleSubmitCheckout} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full rounded-xl border border-border p-3.5 bg-card text-sm text-primary focus:outline-none focus:border-accent"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full rounded-xl border border-border p-3.5 bg-card text-sm text-primary focus:outline-none focus:border-accent"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                          Circular Delivery Address *
                        </label>
                        <textarea
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Street, City, Postal Code"
                          rows={3}
                          className="w-full rounded-xl border border-border p-3.5 bg-card text-sm text-primary focus:outline-none focus:border-accent resize-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                          Ecological Gate/Delivery Notes (Optional)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="e.g. Leave with gate keeper, or pack in minimal recyclable sheets"
                          rows={2}
                          className="w-full rounded-xl border border-border p-3.5 bg-card text-sm text-primary focus:outline-none focus:border-accent resize-none"
                        />
                      </div>

                      {formError && (
                        <p className="text-xs text-red-500 font-mono italic">{formError}</p>
                      )}

                      <div className="pt-4 flex gap-4">
                        <button
                          type="button"
                          onClick={() => setShowCheckoutForm(false)}
                          className="flex-1 rounded-full border border-border py-4 font-mono text-[10px] tracking-widest uppercase font-bold hover:bg-muted"
                        >
                          Back to Selection
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 rounded-full bg-accent text-accent-foreground py-4 font-mono text-[10px] tracking-widest uppercase font-black hover:bg-primary hover:text-primary-foreground transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Submit Request
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  /* --- 3. STANDARD SELECTION LIST STATE --- */
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="space-y-4"
                  >
                    {cartItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8 min-h-[400px]">
                        <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4 animate-bounce" />
                        <p className="text-lg font-serif font-bold text-primary mb-2">Your selection is empty</p>
                        <p className="text-sm text-muted-foreground italic max-w-xs mb-8">
                          Browse our collections and select circular, carbon-positive designs to begin.
                        </p>
                        <button
                          onClick={handleCloseAll}
                          className="rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-[10px] font-mono tracking-widest uppercase font-bold hover:bg-accent hover:text-accent-foreground transition-all shadow-sm cursor-pointer"
                        >
                          Continue Browsing
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cartItems.map((item, idx) => (
                          <motion.div
                            key={`${item.product.id}-${item.selectedSize}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex gap-4 p-4 bg-muted/20 border border-border/50 rounded-2xl group hover:border-accent/30 transition-all"
                          >
                            <div className="w-20 h-20 bg-muted rounded-xl overflow-hidden shrink-0">
                              <img
                                src={item.product.image_url || item.product.image || "/logo_eko.png"}
                                alt={item.product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <p className="text-[9px] font-mono tracking-wider text-accent uppercase font-black mb-0.5">
                                  {item.product.category || "Collection"}
                                </p>
                                <h4 className="font-serif text-sm font-bold text-primary line-clamp-1">{item.product.name}</h4>
                                <div className="flex flex-wrap gap-2 items-center mt-1">
                                  <span className="text-[9px] bg-accent/10 border border-accent/20 text-accent font-mono px-1.5 py-0.5 rounded-full uppercase font-bold">
                                    Size: {item.selectedSize}
                                  </span>
                                  <span className="text-[9px] text-muted-foreground font-mono">
                                    CO2 Saved: {((item.product.co2_factor ? parseFloat(String(item.product.co2_factor)) : 0) * item.quantity).toFixed(1)}kg
                                  </span>
                                </div>
                              </div>

                              <div className="flex justify-between items-center mt-2">
                                {/* Quantity Controls */}
                                <div className="flex items-center gap-1 border border-border bg-card rounded-lg p-0.5">
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)}
                                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-6 text-center text-xs font-mono font-bold text-primary">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)}
                                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                <button
                                  onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                                  className="p-1 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Summary / Impact Panel */}
            {cartItems.length > 0 && !checkoutResult && (
              <footer className="p-6 border-t border-border/50 bg-muted/10 space-y-4">
                {/* Aggregate circular benefits */}
                <div className="bg-primary text-primary-foreground p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/25 rounded-full blur-2xl -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-125" />
                  <div className="relative z-10 space-y-3">
                    <p className="text-[9px] font-mono tracking-[0.3em] uppercase text-accent dark:text-primary-foreground font-black mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" /> Environmental Dividend
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div>
                        <p className="text-[9px] font-mono tracking-widest text-primary-foreground/75 uppercase">CO2 Saved</p>
                        <p className="text-2xl font-serif font-black">{totalCo2Saved.toFixed(1)} kg</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-mono tracking-widest text-primary-foreground/75 uppercase">Waste Reclaimed</p>
                        <p className="text-2xl font-serif font-black">{totalWasteReclaimed.toFixed(1)} kg</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-[10px] text-primary-foreground/90 font-mono">
                      <Leaf className="w-4 h-4 text-accent shrink-0" />
                      <span>Allocates {Math.ceil(totalCo2Saved / 2)} {Math.ceil(totalCo2Saved / 2) === 1 ? "tree sapling" : "tree saplings"} in Agra reserve!</span>
                    </div>
                  </div>
                </div>

                {/* Carbon Credit Rebate Toggle inside Selection view */}
                {!showCheckoutForm && availableCredits > 0 && (
                  <div className="p-4 bg-accent/5 border border-accent/20 rounded-2xl flex justify-between items-center gap-4">
                    <div>
                      <p className="text-[10px] font-mono uppercase text-accent font-black tracking-wider">
                        Carbon Ledger Discount
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        You have <span className="font-bold font-mono text-primary">{availableCredits.toFixed(2)} CC</span> credits available.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useCredits}
                        onChange={(e) => setUseCredits(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                  </div>
                )}

                <div className="space-y-3">
                  {!showCheckoutForm ? (
                    <button
                      onClick={() => setShowCheckoutForm(true)}
                      className="w-full flex items-center justify-center gap-3 rounded-full bg-accent text-accent-foreground px-6 py-4 font-mono text-[10px] tracking-widest uppercase font-black hover:bg-primary hover:text-primary-foreground transition-all shadow-md cursor-pointer"
                    >
                      Request Circular Dispatch
                    </button>
                  ) : null}
                  <p className="text-[9px] text-center text-muted-foreground italic font-mono">
                    Free Circular Delivery • ESG Certified Footprint • No pricing charges applied
                  </p>
                </div>
              </footer>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
