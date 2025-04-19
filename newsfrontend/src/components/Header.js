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

      {/* <div style={{ padding: "1rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Ask AI About the News 🧠</h2>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}>
          <input
            type="text"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder="What are today’s top AI news in India?"
            style={{
              flex: 1,
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "1rem"
            }}
          />
          <button
            onClick={handleAskAI}
            style={{
              backgroundColor: "#3b82f6",
              color: "#fff",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Ask
          </button>
        </div>
        {aiAnswer && (
          <div style={{
            backgroundColor: darkMode ? "#1f2937" : "#f9f9f9",
            padding: "1rem",
            borderRadius: "6px",
            borderLeft: "4px solid #3b82f6",
            fontStyle: "italic"
          }}>
            {aiAnswer}
          </div>
        )}
      </div> */}

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
