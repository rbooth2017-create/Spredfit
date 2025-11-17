interface HeadOnFireIconProps {
  className?: string;
}

export function HeadOnFireIcon({ className = "w-6 h-6" }: HeadOnFireIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Head - much larger, nearly filling the viewBox */}
      <circle
        cx="12"
        cy="16"
        r="10"
        fill="currentColor"
        opacity="0.15"
      />
      <circle
        cx="12"
        cy="16"
        r="10"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      
      {/* Eyes (surprised/shocked) - larger */}
      <circle cx="9" cy="15" r="2" fill="currentColor" />
      <circle cx="15" cy="15" r="2" fill="currentColor" />
      
      {/* Mouth (shocked O shape) - larger */}
      <circle cx="12" cy="19" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
      
      {/* Flames - much larger and more prominent */}
      {/* Left flame */}
      <path
        d="M5 9 C5 9, 3 6, 3 3 C3 1, 4 0, 5 0 C5 0, 4.5 2, 5 4 C5.5 6, 7 8, 7 8"
        fill="currentColor"
        opacity="0.85"
      />
      
      {/* Center flame - tallest and most prominent */}
      <path
        d="M12 7 C12 7, 10.5 4, 10.5 1.5 C10.5 0.5, 11.5 0, 12 0 C12.5 0, 13.5 0.5, 13.5 1.5 C13.5 4, 12 7, 12 7 Z"
        fill="currentColor"
        opacity="1"
      />
      
      {/* Right flame */}
      <path
        d="M19 9 C19 9, 21 6, 21 3 C21 1, 20 0, 19 0 C19 0, 19.5 2, 19 4 C18.5 6, 17 8, 17 8"
        fill="currentColor"
        opacity="0.85"
      />
      
      {/* Inner flame highlights for more detail - bigger */}
      <path
        d="M9 6 C9 6, 9 4, 9.5 2.5 C10 1.5, 11 1, 11 1"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.6"
        strokeLinecap="round"
      />
      <path
        d="M15 6 C15 6, 15 4, 14.5 2.5 C14 1.5, 13 1, 13 1"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
