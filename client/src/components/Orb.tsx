interface Props {
  size?: number;
}

export function Orb({ size = 48 }: Props) {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="lp-orb" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#FBE9BE" />
          <stop offset="55%" stopColor="#D9AE52" />
          <stop offset="100%" stopColor="#A97C2C" />
        </radialGradient>
      </defs>
      <circle cx="48" cy="48" r="26" fill="none" stroke="#C9A24B" strokeWidth="1.5" />
      <circle cx="48" cy="48" r="17" fill="url(#lp-orb)" />
      <ellipse cx="42" cy="41" rx="6" ry="4" fill="#FFF6DD" opacity="0.7" />
    </svg>
  );
}
