import { useState, type FormEvent } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9.5h18" />
      <path d="M8 2.5v4" />
      <path d="M16 2.5v4" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 17.5h.01" />
      <path d="M12 17.5h.01" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

export default function PrebookingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", product: "", notes: "" });

  const close = () => {
    setIsOpen(false);
    setIsSubmitted(false);
    setError(null);
    setForm({ name: "", phone: "", email: "", product: "", notes: "" });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      setError("Booking is temporarily unavailable. Please reach out via WhatsApp instead.");
      return;
    }

    setIsSubmitting(true);
    const { error: insertError } = await supabase.from("prebookings").insert({
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      product: form.product || null,
      notes: form.notes || null
    });
    setIsSubmitting(false);

    if (insertError) {
      setError("Something went wrong submitting your request. Please try again or contact us via WhatsApp.");
      return;
    }

    setIsSubmitted(true);
  };

  return (
    <>
      {/* Floating trigger button — stacked above the existing chat bubble (bottom:20px right:20px, 60px) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Prebook a product"
        title="Prebook"
        className="fixed z-[9998] flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-accent hover:text-accent-foreground transition-all hover:scale-110 cursor-pointer"
        style={{ bottom: "96px", right: "20px" }}
      >
        <CalendarIcon className="w-6 h-6" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="prebooking-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md rounded-2xl bg-background text-foreground shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors cursor-pointer"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            {!isSubmitted ? (
              <>
                <h2 id="prebooking-title" className="text-2xl font-serif mb-1">
                  Prebook Your Piece
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Reserve a handcrafted item before it's available. We'll reach out to confirm details.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="pb-name" className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <input
                      id="pb-name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Your name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="pb-phone" className="block text-sm font-medium mb-1">
                        Phone
                      </label>
                      <input
                        id="pb-phone"
                        required
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="+91 00000 00000"
                      />
                    </div>
                    <div>
                      <label htmlFor="pb-email" className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <input
                        id="pb-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="you@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="pb-product" className="block text-sm font-medium mb-1">
                      Product / Collection
                    </label>
                    <input
                      id="pb-product"
                      value={form.product}
                      onChange={(e) => setForm({ ...form, product: e.target.value })}
                      className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="e.g. Artisan Decoratives keychain"
                    />
                  </div>

                  <div>
                    <label htmlFor="pb-notes" className="block text-sm font-medium mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      id="pb-notes"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                      placeholder="Any preferences, quantity, etc."
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-500" role="alert">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-primary text-primary-foreground font-medium py-2.5 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting…" : "Confirm Prebooking"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <CalendarIcon className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-serif mb-2">Request Received</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Thanks, {form.name || "there"}! We've noted your prebooking request and will reach out shortly to confirm.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-full bg-primary text-primary-foreground font-medium px-6 py-2.5 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
