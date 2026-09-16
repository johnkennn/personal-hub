import { useId } from 'react'

/** 小智 AI 简约 logo：圆角小脸 + 星点，与顶栏青绿/蓝渐变一致 */
export function BrandLogo({ size = 28, className }: { size?: number; className?: string }) {
  const gid = useId().replace(/:/g, '')
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2EE6A6" />
          <stop offset="0.55" stopColor="#3D9EFF" />
          <stop offset="1" stopColor="#A78BFF" />
        </linearGradient>
      </defs>
      <rect x="6" y="10" width="52" height="44" rx="18" fill={`url(#${gid})`} />
      <circle cx="24" cy="30" r="5.5" fill="#071018" />
      <circle cx="40" cy="30" r="5.5" fill="#071018" />
      <circle cx="25.6" cy="28.4" r="1.8" fill="#E8FFF6" />
      <circle cx="41.6" cy="28.4" r="1.8" fill="#E8FFF6" />
      <path
        d="M26 40c2.2 2.6 9.8 2.6 12 0"
        stroke="#071018"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="50" cy="14" r="5" fill="#2EE6A6" />
      <path
        d="M50 11.2v5.6M47.2 14h5.6"
        stroke="#071018"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
