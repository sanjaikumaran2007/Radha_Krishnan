export const Feather = ({ className = "" }: { className?: string }) => (
  <svg className={`feather ${className}`} viewBox="0 0 60 160" aria-hidden>
    <path d="M30 158V8" stroke="#D6B56D" strokeWidth="2" fill="none" />
    <path d="M30 10C6 30 4 80 30 120C56 80 54 30 30 10Z" fill="#146B50" opacity=".85" />
    <ellipse cx="30" cy="52" rx="14" ry="22" fill="#087F8C" />
    <ellipse cx="30" cy="50" rx="7" ry="11" fill="#173E68" stroke="#D6B56D" />
  </svg>
);
export const Flute = () => (
  <svg viewBox="0 0 300 40" className="flute" aria-hidden>
    <defs><linearGradient id="fg"><stop offset="0" stopColor="#8a6a2a" /><stop offset=".5" stopColor="#D6B56D" /><stop offset="1" stopColor="#8a6a2a" /></linearGradient>
      <clipPath id="fc"><rect x="5" y="12" width="290" height="16" rx="8" /></clipPath></defs>
    <rect x="5" y="12" width="290" height="16" rx="8" fill="url(#fg)" />
    {[90, 120, 150, 180, 210].map((x) => <circle key={x} cx={x} cy="20" r="3" fill="#071629" />)}
    <g clipPath="url(#fc)"><rect className="glint" x="0" y="12" width="50" height="16" fill="#9fd8ff" opacity=".6" /></g>
  </svg>
);
export const Sparkles = () => (
  <div className="sparkles" aria-hidden>
    {Array.from({ length: 26 }, (_, i) => (
      <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i * 0.7) % 9}s`, animationDuration: `${9 + (i % 5) * 2}s`, width: 2 + (i % 3), height: 2 + (i % 3) }} />
    ))}
  </div>
);
export const Corners = () => (<><Feather className="fc c-left" /><Feather className="fc c-right" /></>);
