import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import styles from "./SemesterTable.module.css";

export default function SemesterTable({ semester, mataKuliah, getStatus, onToggle, onBatalKonversi, onAmbilSemua, labelAmbil = "Ambil Semua", agamaOptions, agamaChoice, onAgamaChange }) {
  const [open, setOpen] = useState(true);

  const agamaMK = agamaOptions?.find(m => m.kode === agamaChoice) || null;
  const diambilSKS = mataKuliah.reduce((s, mk) => {
    const st = getStatus(mk);
    return st === "diambil" || st === "konversi" ? s + mk.sks : s;
  }, 0) + (agamaMK ? agamaMK.sks : 0);

  return (
    <div className={styles.wrapper}>
      <button className={styles.header} onClick={() => setOpen(o => !o)}>
        <div className={styles.headerLeft}>
          <span className={styles.semBadge}>Semester {semester}</span>
          <span className={styles.semInfo}>{diambilSKS} SKS</span>
        </div>
        <div className={styles.headerRight}>
          {onAmbilSemua && (
            <span
              className={styles.ambilSemua}
              onClick={e => { e.stopPropagation(); onAmbilSemua(); }}
            >{labelAmbil}</span>
          )}
          {open
            ? <ChevronUp size={15} color="var(--text-tertiary)" />
            : <ChevronDown size={15} color="var(--text-tertiary)" />}
        </div>
      </button>

      {open && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Kode</th>
                <th>Nama Mata Kuliah</th>
                <th>SKS</th>
                <th>Sifat</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {agamaOptions && (
                <tr>
                  <td className={styles.num}>—</td>
                  <td className={styles.kode}>{agamaChoice || '—'}</td>
                  <td>
                    <div className={styles.namaCell}>
                      <select
                        className={styles.agamaSelect}
                        value={agamaChoice || ''}
                        onChange={e => onAgamaChange(e.target.value)}
                      >
                        <option value="">Pilih Agama...</option>
                        {agamaOptions.map(m => (
                          <option key={m.kode} value={m.kode}>{m.nama}</option>
                        ))}
                      </select>
                      <span className={styles.namaEn}>Religion</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.sksCell}>
                      <span className={styles.sksNum}>2</span>
                      <span className={styles.sksDetail}>T:2<br/>P:0 PL:0</span>
                    </div>
                  </td>
                  <td><span className="badge-wajib">Wajib</span></td>
                  <td>
                    {agamaChoice
                      ? <span className="badge-diambil">Diambil</span>
                      : <span className={styles.belum}>—</span>
                    }
                  </td>
                  <td></td>
                </tr>
              )}
              {mataKuliah.map((mk, i) => {
                const status = getStatus(mk);
                return (
                  <tr key={mk.kode}>
                    <td className={styles.num}>{i + 1}</td>
                    <td className={styles.kode}>{mk.kode}</td>
                    <td>
                      <div className={styles.namaCell}>
                        <span className={styles.namaMK}>{mk.nama}</span>
                        <span className={styles.namaEn}>{mk.namaEn}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.sksCell}>
                        <span className={styles.sksNum}>{mk.sks}</span>
                        <span className={styles.sksDetail}>T:{mk.t}<br/>P:{mk.p} PL:{mk.pl}</span>
                      </div>
                    </td>
                    <td>
                      <span className={mk.sifat === "Wajib" ? "badge-wajib" : "badge-pilihan"}>
                        {mk.sifat}
                      </span>
                    </td>
                    <td>
                      {status === "diambil" && <span className="badge-diambil">Diambil</span>}
                      {status === "konversi" && <span className="badge-konversi">Dikonversi</span>}
                      {status === "belum" && <span className={styles.belum}>—</span>}
                    </td>
                    <td>
                      {status === "belum" && (
                        <button className={styles.btnAmbil} onClick={() => onToggle(mk.kode)}>
                          <Plus size={12} strokeWidth={3} /> Ambil
                        </button>
                      )}
                      {status === "diambil" && (
                        <button className={styles.btnBatal} onClick={() => onToggle(mk.kode)}>
                          Batal
                        </button>
                      )}
                      {status === "konversi" && onBatalKonversi && (
                        <button className={styles.btnBatal} onClick={() => onBatalKonversi(mk.kode)}>
                          Batal
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
