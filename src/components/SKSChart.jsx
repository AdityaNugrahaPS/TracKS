import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getMKBySemester, getSemesters, AGAMA_KODE } from "../data/kurikulum";
import styles from "./SKSChart.module.css";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>Semester {label}</p>
      <p className={styles.tooltipDiambil}>{payload[0]?.value} SKS ditempuh</p>
      <p className={styles.tooltipTotal}>{payload[1]?.value} SKS total</p>
    </div>
  );
};

export default function SKSChart({ getStatus, agamaChoice }) {
  const semesters = getSemesters();

  const data = semesters.map(sem => {
    const mks = getMKBySemester(sem).filter(mk => !AGAMA_KODE.includes(mk.kode));
    const agamaSKS = sem === 1 && agamaChoice ? 2 : (sem === 1 ? 2 : 0);
    const totalSKS = mks.reduce((s, mk) => s + mk.sks, 0) + (sem === 1 ? 2 : 0);
    const diambil = mks.reduce((s, mk) => {
      const st = getStatus(mk);
      return st === "diambil" || st === "konversi" ? s + mk.sks : s;
    }, 0) + (sem === 1 && agamaChoice ? agamaSKS : 0);

    return { sem, diambil };
  });

  return (
    <div className={styles.wrapper}>
      <p className={styles.label}>Progress SKS per Semester</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barGap={2} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
          <XAxis
            dataKey="sem"
            tickFormatter={v => `Sem ${v}`}
            tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--bg-tertiary)" }} />
          <Bar dataKey="diambil" radius={[4, 4, 0, 0]} fill="var(--accent)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
