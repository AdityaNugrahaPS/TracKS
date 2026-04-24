import { Sun, Moon, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar({ theme, toggleTheme, user }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <img src="/favicon.png" alt="TracKS" className={styles.logoIcon} />
        <span className={styles.logoText}>TracKS</span>
      </div>

      <div className={styles.links}>
        <NavLink to="/" end className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          Beranda
        </NavLink>
        <NavLink to="/prediksi" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          Prediksi
        </NavLink>
      </div>

      <div className={styles.actions}>
        <button className={styles.iconBtn} onClick={toggleTheme} title="Toggle dark mode">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {user && (
          <div className={styles.userMenu}>
            <img src={user.photoURL} alt={user.displayName} className={styles.avatar} />
            <button className={styles.iconBtn} onClick={() => signOut(auth)} title="Keluar">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
