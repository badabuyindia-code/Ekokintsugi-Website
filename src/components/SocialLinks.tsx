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

const SOCIAL_LINKS = [
  { name: "Threads", href: "https://www.threads.com/@ekokintsugi", Icon: ThreadsIcon },
  { name: "Instagram", href: "https://www.instagram.com/ekokintsugi?igsh=ZTVtcjNkOW1mOWxz", Icon: InstagramIcon },
  { name: "Facebook", href: "https://www.facebook.com/share/19EEUHuaSh/", Icon: FacebookIcon }
];

export default function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {SOCIAL_LINKS.map(({ name, href, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={name}
          title={name}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-accent hover:border-accent transition-colors cursor-pointer"
        >
          <Icon className="w-4 h-4" />
        </a>
      ))}
    </div>
  );
}
