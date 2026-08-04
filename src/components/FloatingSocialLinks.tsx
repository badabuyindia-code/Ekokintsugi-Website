type IconProps = { className?: string };

function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="17.6" cy="6.4" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.58v1.85h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z" />
    </svg>
  );
}

function ThreadsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.2 24c-2.03-.02-3.8-.47-5.26-1.34a8.35 8.35 0 0 1-3.24-3.6C2.87 17.4 2.5 15.5 2.5 13.3v-2.6c0-2.2.37-4.1 1.2-5.76a8.35 8.35 0 0 1 3.24-3.6C8.4.47 10.17.02 12.2 0c1.98.02 3.7.45 5.13 1.28 1.4.83 2.48 2 3.22 3.5.62 1.24.98 2.68 1.08 4.3l-2.16.14c-.1-1.6-.5-2.94-1.2-4a5.4 5.4 0 0 0-2.32-2.07 7.05 7.05 0 0 0-3.02-.66c-1.34 0-2.5.3-3.5.9a5.7 5.7 0 0 0-2.24 2.6c-.5 1.1-.76 2.45-.78 4.03v.2c.35-.3.75-.55 1.2-.75.9-.4 1.94-.6 3.1-.6 1.42 0 2.66.28 3.7.85 1.05.56 1.86 1.36 2.4 2.4.55 1.02.83 2.24.83 3.63 0 1.5-.33 2.8-.98 3.9a6.4 6.4 0 0 1-2.7 2.5 8.5 8.5 0 0 1-3.94.87zm.24-9.9c-.83 0-1.5.14-2 .43-.5.28-.75.68-.75 1.2 0 .48.22.86.66 1.14.44.28 1.03.42 1.77.42.9 0 1.63-.2 2.2-.6.55-.4.87-.98.95-1.72-.7-.6-1.65-.9-2.83-.87z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.92 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0 0 12.04 2zm0 18.14h-.01a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.22 8.22 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.26-8.24 2.2 0 4.28.86 5.84 2.42a8.19 8.19 0 0 1 2.42 5.83c0 4.55-3.7 8.24-8.26 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42-.14-.01-.31-.01-.48-.01a.92.92 0 0 0-.67.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28z" />
    </svg>
  );
}

const WHATSAPP_NUMBER = "918679573322";

const SOCIAL_LINKS = [
  { name: "WhatsApp", href: `https://wa.me/${WHATSAPP_NUMBER}`, Icon: WhatsAppIcon },
  { name: "Threads", href: "https://www.threads.com/@ekokintsugi", Icon: ThreadsIcon },
  { name: "Instagram", href: "https://www.instagram.com/ekokintsugi?igsh=ZTVtcjNkOW1mOWxz", Icon: InstagramIcon },
  { name: "Facebook", href: "https://www.facebook.com/share/19EEUHuaSh/", Icon: FacebookIcon }
];

export default function FloatingSocialLinks() {
  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
      {SOCIAL_LINKS.map(({ name, href, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={name}
          title={name}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-accent hover:text-accent-foreground transition-all hover:scale-110 cursor-pointer"
        >
          <Icon className="w-5 h-5" />
        </a>
      ))}
    </div>
  );
}
