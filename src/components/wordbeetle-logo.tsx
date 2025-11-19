export function WordBeetleLogo({
  className = 'w-20 h-20',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Beetle body */}
      <ellipse cx="50" cy="55" rx="22" ry="28" fill="#FF6B6B" />

      {/* Beetle head */}
      <circle cx="50" cy="32" r="14" fill="#FF8E8E" />

      {/* Cute eyes */}
      <circle cx="45" cy="30" r="3" fill="#2C3E50" />
      <circle cx="55" cy="30" r="3" fill="#2C3E50" />
      <circle cx="46" cy="29" r="1.2" fill="white" />
      <circle cx="56" cy="29" r="1.2" fill="white" />

      {/* Happy smile */}
      <path
        d="M 45 35 Q 50 38 55 35"
        stroke="#2C3E50"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Antennae */}
      <path
        d="M 44 24 Q 40 18 38 14"
        stroke="#2C3E50"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 56 24 Q 60 18 62 14"
        stroke="#2C3E50"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="38" cy="14" r="2.5" fill="#FFD93D" />
      <circle cx="62" cy="14" r="2.5" fill="#FFD93D" />

      {/* Wing line */}
      <path
        d="M 50 48 L 50 70"
        stroke="#FF8E8E"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Left wing spot */}
      <circle cx="42" cy="52" r="3" fill="#FF8E8E" />
      <circle cx="40" cy="60" r="2.5" fill="#FF8E8E" />

      {/* Right wing spot */}
      <circle cx="58" cy="52" r="3" fill="#FF8E8E" />
      <circle cx="60" cy="60" r="2.5" fill="#FF8E8E" />

      {/* Legs */}
      <path
        d="M 35 58 L 28 64"
        stroke="#2C3E50"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 33 65 L 26 70"
        stroke="#2C3E50"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 35 72 L 30 78"
        stroke="#2C3E50"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 65 58 L 72 64"
        stroke="#2C3E50"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 67 65 L 74 70"
        stroke="#2C3E50"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 65 72 L 70 78"
        stroke="#2C3E50"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Book */}
      <rect x="40" y="78" width="20" height="14" rx="1" fill="#6C5CE7" />
      <rect x="40" y="78" width="20" height="3" fill="#5F4FD1" />
      <line x1="50" y1="82" x2="50" y2="92" stroke="#5F4FD1" strokeWidth="1" />
      <line x1="43" y1="85" x2="47" y2="85" stroke="white" strokeWidth="0.8" />
      <line x1="43" y1="88" x2="47" y2="88" stroke="white" strokeWidth="0.8" />
    </svg>
  );
}
