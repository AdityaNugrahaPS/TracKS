import styles from "./SummaryCards.module.css";

export default function SummaryCards({ diambil, sisa, konversi, total }) {
  const pct = Math.round((diambil / total) * 100);

  return (
    <div className={styles.wrapper}>
      <div className={styles.cards}>
        <div className={styles.card}>
          <p className={styles.label}>SKS Ditempuh</p>
          <p className={styles.value} style={{ color: "var(--accent)" }}>{diambil}</p>
          <p className={styles.sub}>dari {total} SKS</p>
        </div>
        <div className={styles.card}>
          <p className={styles.label}>SKS Tersisa</p>
          <p className={styles.value} style={{ color: "var(--danger)" }}>{Math.max(0, sisa)}</p>
          <p className={styles.sub}>SKS lagi</p>
        </div>
        <div className={styles.card}>
          <p className={styles.label}>Konversi MBKM</p>
          <p className={styles.value} style={{ color: "var(--purple)" }}>{konversi}</p>
          <p className={styles.sub}>SKS dikonversi</p>
        </div>
        <div className={styles.card}>
          <p className={styles.label}>Progress Studi</p>
          <p className={styles.value} style={{ color: "var(--success)" }}>{pct}%</p>
          <p className={styles.sub}>studi selesai</p>
        </div>
      </div>
      <div className={styles.progressWrap}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
        <span className={styles.progressLabel}>{diambil}/{total} SKS</span>
      </div>
    </div>
  );
}
