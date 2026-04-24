import { useState, useEffect } from "react";
import { X, Check, Trash2 } from "lucide-react";
import { getMKMBKM, kurikulum } from "../data/kurikulum";
import styles from "./MBKMModal.module.css";

const MAX_SKS = 20;

export default function MBKMModal({ mbkmData, onSave, onDelete, onClose, statusMK = {} }) {
  const canAdd = mbkmData.length < 2;
  const nextPeriode = mbkmData.length + 1;

  const [tipe, setTipe] = useState("Studi Independen");
  const [semester, setSemester] = useState(5);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

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
      if (totalSelected + mk.sks > MAX_SKS) return;
      setSelected(s => [...s, kode]);
    }
  };

  const handleSave = () => {
    if (selected.length === 0) return;
    onSave({ periode: nextPeriode, tipe, semester, sks: totalSelected, mataKuliah: selected });
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

          {mbkmData.length > 0 && (
            <div className={styles.field}>
              <label>MBKM Tersimpan</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {mbkmData.map(m => (
                  <div key={m.periode} className={styles.savedEntry}>
                    <div className={styles.savedInfo}>
                      <span className={styles.savedTipe}>{m.tipe}</span>
                      <span className={styles.savedMeta}>Sem {m.semester} · {m.sks} SKS · {m.mataKuliah?.length || 0} MK</span>
                    </div>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => onDelete(m.periode)}
                      title="Hapus MBKM ini"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {canAdd && (
            <>
              <div className={styles.field}>
                <label>Tipe Kegiatan</label>
                <div className={styles.segmented}>
                  {["Studi Independen", "Kerja Praktik"].map(t => (
                    <button
                      key={t}
                      className={tipe === t ? styles.segActive : styles.segBtn}
                      onClick={() => {
                        setTipe(t);
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

              <div className={styles.field}>
                <label>Semester Mulai</label>
                <select value={semester} onChange={e => setSemester(+e.target.value)} className={styles.select}>
                  {[5,6,7].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>

              <div className={styles.fieldGrow}>
                <label>
                  Pilih Mata Kuliah yang Dikonversi
                  <span className={styles.counter}>{totalSelected}/{MAX_SKS} SKS dipilih</span>
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
                    const disabled = !checked && totalSelected + mk.sks > MAX_SKS;
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
            </>
          )}

          {!canAdd && (
            <p style={{ fontSize: 13, color: "var(--text-secondary)", textAlign: "center", padding: "8px 0" }}>
              Maksimal 2 periode MBKM sudah tercapai.
            </p>
          )}
        </div>

        <div className={styles.footer}>
          <button className="btn-secondary" onClick={onClose}>Tutup</button>
          {canAdd && (
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={selected.length === 0}
              style={{ opacity: selected.length === 0 ? 0.4 : 1, cursor: selected.length === 0 ? "not-allowed" : "pointer" }}
            >
              Simpan MBKM
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
