import type { CSSProperties } from 'react'

import { resolveMediaUrl } from '../utils/mediaUrl'
import styles from './CoverStrip.module.css'

/** 无封面时的品牌色调占位（按内容 id 稳定轮换） */
const COVER_TONES: Record<string, string> = {
  moss: 'linear-gradient(135deg, #1a3d30 0%, #2f6b52 45%, #7cb89a 100%)',
  ink: 'linear-gradient(135deg, #101820 0%, #1c2e38 50%, #3d6b7a 100%)',
  ember: 'linear-gradient(135deg, #2a1810 0%, #5a3420 50%, #c4845a 100%)',
  dusk: 'linear-gradient(145deg, #152018 0%, #24352c 50%, #4d6b5a 100%)',
  default: 'linear-gradient(135deg, #14201b 0%, #243830 50%, #4a7a62 100%)',
}

const TONE_KEYS = Object.keys(COVER_TONES)

export function coverToneFromId(id: number): string {
  return TONE_KEYS[Math.abs(id) % TONE_KEYS.length]
}

export function coverToneGradient(toneOrId: string | number): string {
  const key = typeof toneOrId === 'number' ? coverToneFromId(toneOrId) : toneOrId
  return COVER_TONES[key] ?? COVER_TONES.default
}

/** 展映 / 分享卡 / 本周上映等：有封面用图，否则用色调渐变 */
export function coverMediaStyle(
  coverUrl: string | null | undefined,
  id: number,
  tone?: string | null,
): CSSProperties {
  const cover = resolveMediaUrl(coverUrl)
  return {
    backgroundImage: cover ? `url(${cover})` : coverToneGradient(tone ?? id),
  }
}

type CoverStripProps = {
  title: string
  /** 色调名；有 coverUrl 时仅作回退 */
  tone?: string
  coverUrl?: string | null
  compact?: boolean
}

/** 列表卡片顶栏：优先真实封面，否则色调渐变；compact 不叠标题（下方已有标题） */
export function CoverStrip({ title, tone = 'default', coverUrl, compact }: CoverStripProps) {
  const cover = resolveMediaUrl(coverUrl)
  const style: CSSProperties = cover
    ? { backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: coverToneGradient(tone) }

  return (
    <div className={`${styles.cover} ${compact ? styles.compact : ''}`} style={style}>
      <span className={styles.glow} />
      {!cover && !compact ? <span className={styles.label}>{title.slice(0, 18)}</span> : null}
    </div>
  )
}
