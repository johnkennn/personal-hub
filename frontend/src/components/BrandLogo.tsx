import { useId } from 'react'

/** 小智 AI logo：圆角笑脸 + 空心椭圆灯泡 + 下方四射线点 */
export function BrandLogo({ size = 40, className }: { size?: number; className?: string }) {
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
      shapeRendering="geometricPrecision"
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
      {/* 灵感标：空心椭圆 + 向下四射线点 */}
      <circle cx="50" cy="13.5" r="6.2" fill="#2EE6A6" />
      <ellipse
        cx="50"
        cy="12.05"
        rx="2.55"
        ry="2.35"
        stroke="#071018"
        strokeWidth="1.35"
        fill="none"
      />
      {/* 四射线点：中间两颗略低，两侧略外展 */}
      <circle cx="47.85" cy="15.55" r="0.72" fill="#071018" />
      <circle cx="49.15" cy="16.35" r="0.72" fill="#071018" />
      <circle cx="50.85" cy="16.35" r="0.72" fill="#071018" />
      <circle cx="52.15" cy="15.55" r="0.72" fill="#071018" />
    </svg>
  )
}
