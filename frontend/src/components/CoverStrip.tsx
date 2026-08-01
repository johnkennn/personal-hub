import styles from './CoverStrip.module.css'

const TONES: Record<string, string> = {
  moss: 'linear-gradient(135deg, #1a3d30 0%, #2f6b52 45%, #7cb89a 100%)',
  ink: 'linear-gradient(135deg, #101820 0%, #1c2e38 50%, #3d6b7a 100%)',
  ember: 'linear-gradient(135deg, #2a1810 0%, #5a3420 50%, #c4845a 100%)',
  dusk: 'linear-gradient(135deg, #1a1528 0%, #3a2f55 55%, #7a6aa8 100%)',
  default: 'linear-gradient(135deg, #14201b 0%, #243830 50%, #4a7a62 100%)',
}

type CoverStripProps = {
  title: string
  tone?: string
  compact?: boolean
}

export function CoverStrip({ title, tone = 'default', compact }: CoverStripProps) {
  const bg = TONES[tone] ?? TONES.default
  return (
    <div className={`${styles.cover} ${compact ? styles.compact : ''}`} style={{ background: bg }}>
      <span className={styles.glow} />
      <span className={styles.label}>{title.slice(0, 18)}</span>
    </div>
  )
}

export function coverToneFromId(id: number): string {
  const keys = ['moss', 'ink', 'ember', 'dusk', 'default']
  return keys[Math.abs(id) % keys.length]
}
