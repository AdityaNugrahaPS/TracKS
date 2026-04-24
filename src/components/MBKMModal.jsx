import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { getMKMBKM, KERJA_PRAKTEK_KODE, MBKM_PREREQ } from "../data/kurikulum";
import styles from "./MBKMModal.module.css";

export default function MBKMModal({ mbkmData, onSave, onClose, statusMK = {} }) {
  const periode = mbkmData.length === 0 ? 1 : mbkmData.length + 1;
  const [tipe, setTipe] = useState("Studi Independen");
  const [semester, setSemester] = useState(5);
  const [sks, setSks] = useState(20);
  const [selected, setSelected] = useState(mbkmData.find(m => m.periode === periode)?.mataKuliah || []);
  const [search, setSearch] = useState("");

  const prereqOk = true;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const mkList = getMKMBKM(tipe);
  const mkFiltered = search.trim()
    ? mkList.filter(mk => mk.nama.toLowerCase().includes(search.toLowerCase()) || mk.kode.toLowerCase().includes(search.toLowerCase()))
    : mkList;

  const totalSelected = mkList.filter(mk => selected.includes(mk.kode)).reduce((s, mk) => s + mk.sks, 0);

  const toggle = (kode) => {
    const mk = mkList.find(m => m.kode === kode);
    if (selected.includes(kode)) {
      setSelected(s => s.filter(k => k !== kode));
    } else {
      if (totalSelected + mk.sks > sks) return;
      setSelected(s => [...s, kode]);
    }
  };

  const handleSave = () => {
    if (!prereqOk) return;
    if (mbkmData.length >= 2 && !mbkmData.find(m => m.periode === periode)) {
      alert("Maksimal 2 periode MBKM");
      return;
    }
    onSave({ periode, tipe, semester, sks, mataKuliah: selected });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <div className={styles.handle} />
        <div className={styles.sheetHeader}>
          <h2 className={styles.sheetTitle}>Input MBKM</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <label>Tipe Kegiatan</label>
            <div className={styles.segmented}>
              {["Studi Independen", "Kerja Praktik"].map(t => (
                <button
                  key={t}
                  className={tipe === t ? styles.segActive : styles.segBtn}
                  onClick={() => {
                    const next = t;
                    setTipe(next);
                    setSearch("");
                    setSelected([]);
                  }}
                >{t}</button>
              ))}
            </div>
            <div className={styles.noteBox}>
              <span>📋</span>
              <span>Sebaiknya konsultasikan konversi mata kuliah dengan Ketua Program Studi.</span>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Semester Mulai</label>
              <select value={semester} onChange={e => setSemester(+e.target.value)} className={styles.select}>
                {[5,6,7].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Jumlah SKS Dikonversi</label>
              <div className={styles.sksInput}>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={sks}
                  onChange={e => setSks(Math.min(20, Math.max(1, +e.target.value)))}
                  className={styles.input}
                />
                <span className={styles.sksSub}>maks 20 SKS</span>
              </div>
            </div>
          </div>

          <div className={styles.fieldGrow}>
            <label>
              Pilih Mata Kuliah yang Dikonversi
              <span className={styles.counter}>{totalSelected}/{sks} SKS dipilih</span>
            </label>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Cari mata kuliah..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className={styles.mkList}>
              {mkFiltered.length === 0 && (
                <p style={{ fontSize: 13, color: "var(--text-tertiary)", textAlign: "center", padding: "16px 0" }}>Tidak ditemukan</p>
              )}
              {mkFiltered.map(mk => {
                const checked = selected.includes(mk.kode);
                const disabled = !checked && totalSelected + mk.sks > sks;
                return (
                  <div
                    key={mk.kode}
                    className={`${styles.mkItem} ${checked ? styles.mkChecked : ""} ${disabled ? styles.mkDisabled : ""}`}
                    onClick={() => !disabled && toggle(mk.kode)}
                  >
                    <div className={styles.mkCheck}>{checked && <Check size={12} strokeWidth={3}/>}</div>
                    <div className={styles.mkInfo}>
                      <span className={styles.mkNama}>{mk.nama}</span>
                      <span className={styles.mkMeta}>Sem {mk.semester} · {mk.sks} SKS</span>
                    </div>
                    <span className={mk.sifat === "Wajib" ? styles.badgeWajib : styles.badgePilihan}>{mk.sifat}</span>
                  </div>
                );
              })}
            </div>
          </div>
          </div>

        <div className={styles.footer}>
          <button className="btn-secondary" onClick={onClose}>Batal</button>
          <button className="btn-primary" onClick={handleSave} disabled={!prereqOk} style={{ opacity: prereqOk ? 1 : 0.4, cursor: prereqOk ? "pointer" : "not-allowed" }}>Simpan MBKM</button>
        </div>
      </div>
    </div>
  );
}
