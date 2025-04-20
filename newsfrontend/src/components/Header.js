import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import styles from "../styles/Header.module.css";

const Header = ({ setFeedSource, setSearchQuery }) => {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const [sources, setSources] = useState([]);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/sources`)
      .then(res => res.json())
      .then(data => setSources(data.sources || []))
      .catch(err => console.error("Failed to load sources:", err));
  }, []);

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/ask-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: aiQuestion })
      });
      const data = await res.json();
      if (data?.answer) {
        setAiAnswer(data.answer);
      }
    } catch (err) {
      console.error("AI question failed:", err);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <img src="/logo.png" alt="InstAInews Logo" className={darkMode?styles.logo_dark:styles.logo} />
      </div>

      <input
        className={styles.search}
        placeholder="Search News..."
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className={styles.controls}>
        <select className={styles.dropdown} onChange={(e) => setFeedSource(e.target.value)}>
          <option value="">All Sources</option>
          {sources.map((source) => (
            <option key={source.value} value={source.value}>
              {source.label}
            </option>
          ))}
        </select>
        <button className={styles.toggle} onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌞" : "🌙"}
        </button>
        <div className={styles.avatar}>👤</div>
      </div>
    </header>
  );
};

export default Header;
