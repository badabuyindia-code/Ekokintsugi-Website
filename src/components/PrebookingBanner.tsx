export const PREBOOKING_BANNER_HEIGHT = "2.25rem"; // h-9 — keep in sync with the class below

const MESSAGE = "PREBOOK YOUR PIECE NOW  ·  RESERVE BEFORE IT'S AVAILABLE  ·  LIMITED HANDCRAFTED STOCK  ·  TAP TO PREBOOK";

export default function PrebookingBanner() {
  const openPrebooking = () => {
    window.dispatchEvent(new CustomEvent("ekokintsugi:open-prebooking"));
  };

  return (
    <button
      type="button"
      onClick={openPrebooking}
      aria-label="Open prebooking form"
      title="Prebook your piece"
      className="fixed top-0 left-0 right-0 z-[60] h-9 overflow-hidden cursor-pointer border-b border-black/10 group"
      style={{ backgroundColor: "#F2B705" }}
    >
      <div className="marquee-track flex items-center h-full whitespace-nowrap group-hover:[animation-play-state:paused]">
        <span className="marquee-segment">{MESSAGE}</span>
        <span className="marquee-segment" aria-hidden="true">{MESSAGE}</span>
      </div>
    </button>
  );
}
