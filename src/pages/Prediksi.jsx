import { useState, useEffect } from "react";
import { PartyPopper, AlertTriangle } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { kurikulum, AGAMA_KODE, getWajibKodes } from "../data/kurikulum";
import styles from "./Prediksi.module.css";

const TOTAL_SKS = 144;

export default function Prediksi({ user }) {
  const [statusMK, setStatusMK] = useState({});
  const [mbkmData, setMbkmData] = useState([]);
  const [agamaChoice, setAgamaChoice] = useState(null);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const d = snap.data();
        setStatusMK(d.statusMK || {});
        setMbkmData(d.mbkmData || []);
        setAgamaChoice(d.agamaChoice || null);
      }
    };
    load();
  }, [user.uid]);

  const getStatus = (kode) => {
    for (const m of mbkmData) {
      if (m.mataKuliah?.includes(kode)) return "konversi";
    }
    return statusMK[kode] || "belum";
  };

  const mkList = kurikulum.filter(mk => {
    if (AGAMA_KODE.includes(mk.kode)) return !agamaChoice || mk.kode === agamaChoice;
    return true;
  });

  const semesters = [...new Set(mkList.map(m => m.semester))].sort();

  const semData = semesters.map(sem => {
    const mks = mkList.filter(m => m.semester === sem);
    const totalSKS = mks.reduce((s, m) => s + m.sks, 0);
    let wajibSKS = 0, pilihanSKS = 0, konversiSKS = 0, diambilCount = 0;
    mks.forEach(m => {
      const st = getStatus(m.kode);
      if (st === "konversi") { konversiSKS += m.sks; diambilCount++; }
      else if (st === "diambil") {
        if (m.sifat === "Wajib") wajibSKS += m.sks;
        else pilihanSKS += m.sks;
        diambilCount++;
      }
    });
    const diambilSKS = wajibSKS + pilihanSKS + konversiSKS;
    const mbkmSem = mbkmData.filter(m => m.semester === sem);
    return { sem, totalSKS, diambilSKS, diambilCount, total: mks.length, wajibSKS, pilihanSKS, konversiSKS, mbkm: mbkmSem };
  });

  const totalDiambil = Math.min(semData.reduce((s, d) => s + d.diambilSKS, 0), TOTAL_SKS);
  const sisaSKS = Math.max(0, TOTAL_SKS - totalDiambil);

  const wajibKodes = getWajibKodes();
  const wajibBelumDiambil = wajibKodes.filter(kode => {
    const st = getStatus(kode);
    return st !== "diambil" && st !== "konversi";
  });
  const agamaSudah = agamaChoice !== null;
  const semuaWajibSelesai = wajibBelumDiambil.length === 0 && agamaSudah;
  const sudahLulus = sisaSKS === 0 && semuaWajibSelesai;

  const semesterSisa = !sudahLulus ? Math.ceil((sisaSKS + wajibBelumDiambil.reduce((s, k) => {
    const mk = kurikulum.find(m => m.kode === k);
    return s + (mk?.sks || 0);
  }, 0)) / 20) : 0;
  const lastSemDone = semData.filter(d => d.diambilSKS > 0).slice(-1)[0]?.sem || 0;
  const estimasiLulus = lastSemDone + semesterSisa;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Prediksi Kelulusan</h1>
      <p className={styles.sub}>Berdasarkan progress studi yang sudah kamu input</p>

      <div className={styles.summary}>
        <div className={styles.summCard}>
          <p className={styles.summLabel}>SKS Ditempuh</p>
          <p className={styles.summVal} style={{ color: "var(--accent)" }}>{totalDiambil}/{TOTAL_SKS}</p>
        </div>
        <div className={styles.summCard}>
          <p className={styles.summLabel}>SKS Tersisa</p>
          <p className={styles.summVal} style={{ color: "var(--danger)" }}>{sisaSKS}</p>
        </div>
        <div className={styles.summCard}>
          <p className={styles.summLabel}>Estimasi Semester Lulus</p>
          <p className={styles.summVal} style={{ color: sudahLulus ? "var(--success)" : "var(--text-primary)" }}>
            {sudahLulus
              ? <span style={{display:"flex",alignItems:"center",gap:6}}>Selesai <PartyPopper size={18}/></span>
              : estimasiLulus > 0 ? `Semester ${estimasiLulus}` : "—"
            }
          </p>
        </div>
      </div>

      {sisaSKS === 0 && !semuaWajibSelesai && (
        <div className={styles.warnBox}>
          <AlertTriangle size={16} />
          <span>SKS sudah 144, tapi ada mata kuliah wajib yang belum diambil. Kelulusan belum terpenuhi.</span>
        </div>
      )}

      <h2 className={styles.sectionTitle}>Timeline per Semester</h2>
      <div className={styles.timeline}>
        {semData.map(({ sem, totalSKS, diambilSKS, diambilCount, total, wajibSKS, pilihanSKS, konversiSKS, mbkm }) => {
          const done = diambilSKS === totalSKS && totalSKS > 0;
          const hasMbkm = mbkm.length > 0;
          return (
            <div key={sem} className={`${styles.timelineItem} ${done ? styles.done : ""}`}>
              <div className={`${styles.dot} ${done ? styles.dotDone : ""} ${hasMbkm ? styles.dotMbkm : ""}`} />
              <div className={styles.timelineCard}>
                <div className={styles.timelineHeader}>
                  <span className={styles.semLabel}>Semester {sem}</span>
                  {hasMbkm && <span className={styles.mbkmTag}>{mbkm[0].tipe}</span>}
                  {done && <span className={styles.doneTag}>Selesai</span>}
                </div>
                <p className={styles.timelineSub}>{diambilCount}/{total} MK · {diambilSKS}/{totalSKS} SKS</p>
                <div className={styles.sksPills}>
                  {wajibSKS > 0 && <span className={styles.pillWajib}>{wajibSKS} SKS Wajib</span>}
                  {pilihanSKS > 0 && <span className={styles.pillPilihan}>{pilihanSKS} SKS Pilihan</span>}
                  {konversiSKS > 0 && <span className={styles.pillKonversi}>{konversiSKS} SKS Konversi</span>}
                  {diambilSKS === 0 && <span className={styles.pillEmpty}>Belum ada SKS</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {mbkmData.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>Rincian MBKM</h2>
          <div className={styles.mbkmCards}>
            {mbkmData.map(m => (
              <div key={m.periode} className={styles.mbkmCard}>
                <div className={styles.mbkmHeader}>
                  <span className={styles.mbkmPeriode}>Periode {m.periode}</span>
                  <span className={styles.mbkmTipe}>{m.tipe}</span>
                </div>
                <p className={styles.mbkmInfo}>Semester {m.semester} · {m.sks} SKS dikonversi</p>
                <div className={styles.mbkmMks}>
                  {m.mataKuliah?.map(kode => {
                    const mk = kurikulum.find(m => m.kode === kode);
                    return mk ? (
                      <span key={kode} className="badge-konversi">{mk.nama}</span>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
