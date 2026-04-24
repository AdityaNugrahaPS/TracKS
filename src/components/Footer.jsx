import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.text}>
          Ada saran atau masukan? Hubungi saya di{" "}
          <a href="mailto:adityanugrahasaiya@gmail.com" className={styles.link}>adityanugrahasaiya@gmail.com</a>
          {" · "}
          <a href="https://instagram.com/adtvnus" target="_blank" rel="noreferrer" className={styles.link}>Instagram</a>
          {" · "}
          <a href="https://github.com/AdityaNugrahaPS" target="_blank" rel="noreferrer" className={styles.link}>GitHub</a>
          {" · "}
          <a href="https://linkedin.com/in/adityanugrahapratamasaiya" target="_blank" rel="noreferrer" className={styles.link}>LinkedIn</a>
        </p>
        <p className={styles.copy}>© {new Date().getFullYear()} Aditya Nugraha Pratama Saiya</p>
      </div>
    </footer>
  );
}
