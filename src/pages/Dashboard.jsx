import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { GraduationCap, RotateCcw, AlertTriangle, ShieldAlert } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { kurikulum, getSemesters, getMKBySemester, AGAMA_KODE, getWajibKodes } from "../data/kurikulum";
import SummaryCards from "../components/SummaryCards";
import SemesterTable from "../components/SemesterTable";
import MBKMModal from "../components/MBKMModal";
import styles from "./Dashboard.module.css";

const SKSChart = lazy(() => import("../components/SKSChart"));

const TOTAL_SKS_LULUS = 144;

export default function Dashboard({ user }) {
  const [statusMK, setStatusMK] = useState({});
  const [mbkmData, setMbkmData] = useState([]);
  const [showMBKM, setShowMBKM] = useState(false);
  const [agamaChoice, setAgamaChoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReset, setShowReset] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setStatusMK(data.statusMK || {});
        setMbkmData(data.mbkmData || []);
        setAgamaChoice(data.agamaChoice || null);
      }
      setLoading(false);
    };
    load();
  }, [user.uid]);

  const save = async (newStatus, newMbkm, newAgama) => {
    await setDoc(doc(db, "users", user.uid), {
      statusMK: newStatus,
      mbkmData: newMbkm,
      agamaChoice: newAgama,
    }, { merge: true });
  };

  const changeAgama = (kode) => {
    const newStatus = { ...statusMK };
    AGAMA_KODE.forEach(k => delete newStatus[k]);
    if (kode) newStatus[kode] = "diambil";
    const newAgama = kode || null;
    setAgamaChoice(newAgama);
    setStatusMK(newStatus);
    save(newStatus, mbkmData, newAgama);
  };

  const showToast = (msg) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  const PREREQ = {
    "TIS41463": { butuh: "FTS32053", nama: "Metodologi Penelitian" },  // Sempro butuh Metopen
    "TIS42473": { butuh: "TIS41463", nama: "Seminar Proposal" },        // Tugas Akhir butuh Sempro
  };

  const calcTotalSKS = (status, mbkm, agama) => kurikulum.reduce((sum, m) => {
    if (AGAMA_KODE.includes(m.kode)) return m.kode === agama ? sum + m.sks : sum;
    const s = status[m.kode] ? "diambil" : mbkm.some(x => x.mataKuliah?.includes(m.kode)) ? "konversi" : "belum";
    return s === "diambil" || s === "konversi" ? sum + m.sks : sum;
  }, 0);

  const toggleStatus = (kode) => {
    if (AGAMA_KODE.includes(kode)) return;
    const current = statusMK[kode];
    const isKonversi = mbkmData.some(m => m.mataKuliah?.includes(kode));
    if (isKonversi) return;

    if (current !== "diambil") {
      // Prereq check
      if (PREREQ[kode]) {
        const { butuh, nama } = PREREQ[kode];
        const prereqOk = statusMK[butuh] || mbkmData.some(m => m.mataKuliah?.includes(butuh));
        if (!prereqOk) {
          showToast(`Mata kuliah ini memerlukan "${nama}" diambil terlebih dahulu.`);
          return;
        }
      }

      const mk = kurikulum.find(m => m.kode === kode);
      if (mk) {
        const currentTotal = calcTotalSKS(statusMK, mbkmData, agamaChoice);

        // Max 144 SKS
        if (currentTotal + mk.sks > TOTAL_SKS_LULUS) {
          showToast(`Batas maksimal 144 SKS sudah tercapai. Tidak bisa menambah mata kuliah lagi.`);
          return;
        }

      }
    }

    const newStatus = { ...statusMK, [kode]: current === "diambil" ? undefined : "diambil" };
    if (newStatus[kode] === undefined) delete newStatus[kode];
    setStatusMK(newStatus);
    save(newStatus, mbkmData, agamaChoice);
  };

  const ambilSemuaSemester = (sem) => {
    const mks = getMKBySemester(sem).filter(mk => !AGAMA_KODE.includes(mk.kode));
    const newStatus = { ...statusMK };
    mks.forEach(mk => {
      const isKonversi = mbkmData.some(m => m.mataKuliah?.includes(mk.kode));
      if (!isKonversi) newStatus[mk.kode] = "diambil";
    });
    setStatusMK(newStatus);
    save(newStatus, mbkmData, agamaChoice);
  };

  const ambilWajibSemester = (sem) => {
    const mks = getMKBySemester(sem).filter(mk => !AGAMA_KODE.includes(mk.kode) && mk.sifat === "Wajib");
    const newStatus = { ...statusMK };
    mks.forEach(mk => {
      const isKonversi = mbkmData.some(m => m.mataKuliah?.includes(mk.kode));
      if (!isKonversi) newStatus[mk.kode] = "diambil";
    });
    setStatusMK(newStatus);
    save(newStatus, mbkmData, agamaChoice);
  };

  const resetAll = async () => {
    await setDoc(doc(db, "users", user.uid), { statusMK: {}, mbkmData: [], agamaChoice: null }, { merge: false });
    setStatusMK({});
    setMbkmData([]);
    setAgamaChoice(null);
    setShowReset(false);
  };

  const saveMBKM = (data) => {
    const newMbkm = [...mbkmData.filter(m => m.periode !== data.periode), data];
    setMbkmData(newMbkm);
    save(statusMK, newMbkm, agamaChoice);
    setShowMBKM(false);
  };

  const deleteMBKM = (periode) => {
    const newMbkm = mbkmData.filter(m => m.periode !== periode);
    setMbkmData(newMbkm);
    save(statusMK, newMbkm, agamaChoice);
  };

  const getStatus = (mk) => {
    for (const m of mbkmData) {
      if (m.mataKuliah?.includes(mk.kode)) return "konversi";
    }
    return statusMK[mk.kode] || "belum";
  };

  const mkList = kurikulum.filter(mk => {
    if (AGAMA_KODE.includes(mk.kode)) {
      return !agamaChoice || mk.kode === agamaChoice;
    }
    return true;
  });

  const diambilSKS = mkList.reduce((sum, mk) => {
    const s = getStatus(mk);
    return s === "diambil" || s === "konversi" ? sum + mk.sks : sum;
  }, 0);

  const konversiSKS = mbkmData.reduce((sum, m) => sum + (m.sks || 0), 0);
  const sisaSKS = TOTAL_SKS_LULUS - diambilSKS;
  const semesters = getSemesters();

  if (loading) return (
    <div style={{ minHeight: "calc(100vh - 120px)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
      Memuat data...
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Halo, {user.displayName?.split(" ")[0]}</h1>
          <p className={styles.sub}>Lacak SKS, pantau progres, dan prediksi kelulusan kamu di TI UNRI.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-secondary" onClick={() => setShowReset(true)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <RotateCcw size={14} /> Reset
          </button>
          <button className="btn-primary" onClick={() => setShowMBKM(true)}>
            + Input MBKM
          </button>
        </div>
      </div>

      <Suspense fallback={<div style={{ height: 160 }} />}>
        <SKSChart getStatus={getStatus} agamaChoice={agamaChoice} />
      </Suspense>

      <SummaryCards
        diambil={diambilSKS}
        sisa={sisaSKS}
        konversi={konversiSKS}
        total={TOTAL_SKS_LULUS}
      />

      <div className={styles.tables}>
        {semesters.map(sem => (
          <SemesterTable
            key={sem}
            semester={sem}
            mataKuliah={getMKBySemester(sem).filter(mk => !AGAMA_KODE.includes(mk.kode))}
            agamaOptions={sem === 1 ? kurikulum.filter(mk => AGAMA_KODE.includes(mk.kode)) : null}
            agamaChoice={sem === 1 ? agamaChoice : null}
            onAgamaChange={sem === 1 ? changeAgama : null}
            getStatus={getStatus}
            onToggle={toggleStatus}
            onAmbilSemua={sem <= 4 ? () => ambilSemuaSemester(sem) : () => ambilWajibSemester(sem)}
            labelAmbil={sem <= 4 ? "Ambil Semua" : "Ambil Wajib"}
          />
        ))}
      </div>

      {showMBKM && (
        <MBKMModal
          mbkmData={mbkmData}
          onSave={saveMBKM}
          onDelete={deleteMBKM}
          onClose={() => setShowMBKM(false)}
          statusMK={statusMK}
        />
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          zIndex: 300, display: "flex", alignItems: "center", gap: 10,
          background: "var(--bg-primary)", border: "1px solid var(--border)",
          borderRadius: 16, padding: "12px 18px", maxWidth: 380, width: "calc(100% - 32px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)", animation: "toastIn 0.25s ease",
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, background: "var(--warning-soft, #fff8e1)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <ShieldAlert size={17} color="var(--warning, #f59e0b)" />
          </div>
          <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.45, flex: 1 }}>{toast}</p>
          <button onClick={() => setToast(null)} style={{
            color: "var(--text-tertiary)", fontSize: 18, lineHeight: 1, padding: "0 2px", flexShrink: 0,
          }}>×</button>
        </div>
      )}

      {showReset && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" }}
          onClick={() => setShowReset(false)}>
          <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 20, padding: "28px 28px 24px", maxWidth: 360, width: "100%", display: "flex", flexDirection: "column", gap: 16 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--danger-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AlertTriangle size={20} color="var(--danger)" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Reset Semua Data?</p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>Seluruh progress, MBKM, dan pilihan agama akan dihapus permanen.</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: "center", height: 40 }} onClick={() => setShowReset(false)}>Batal</button>
              <button style={{ flex: 1, height: 40, borderRadius: "var(--radius-sm)", background: "var(--danger)", color: "#fff", fontWeight: 600, fontSize: 14 }} onClick={resetAll}>Ya, Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
