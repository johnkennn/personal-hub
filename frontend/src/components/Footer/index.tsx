import styles from './Footer.module.css'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <p className={styles.text}>© {year} Personal Hub</p>
    </footer>
  )
}
