import React from "react";
import styles from "../styles/ToggleSwitch.module.css";

const ToggleSwitch = ({ darkMode, setDarkMode }) => (
  <div className={styles.themeToggle}>
    <label className={styles.switch}>
      <input
        type="checkbox"
        checked={darkMode}
        onChange={() => setDarkMode((prev) => !prev)}
      />
      <span className={styles.slider}></span>
    </label>
  </div>
);

export default ToggleSwitch;
