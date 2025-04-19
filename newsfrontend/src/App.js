import React, { useEffect, useContext } from "react";
import styles from "./styles/App.module.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import NewsCard from "./components/NewsCard";
import useFetchNews from "./hooks/useFetchNews";
import { ThemeContext } from "./context/ThemeContext";

function App() {
  const [feedSouce, setFeedSource] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [summaryItem, setSummaryItem] = React.useState({});
  const [aiQuestion, setAiQuestion] = React.useState("");
  const [aiAnswer, setAiAnswer] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const news = useFetchNews(feedSouce);
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    console.log("Current feed source:", feedSouce);
  }, [feedSouce]);

  const handleSummarize = async (item) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: item.contentSnippet || item.description || item.title })
      });
      const data = await res.json();
      if (data?.summary) {
        setSummaryItem({ ...summaryItem,[item.title] : data.summary });
      }
    } catch (err) {
      console.error("Summarization failed:", err);
    }
  };

  useEffect(() => {
    console.log("Summary item updated:", summaryItem);
  }, [summaryItem]);

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`app ${darkMode ? "dark-theme" : ""}`}>
      <Header setFeedSource={setFeedSource} setSearchQuery={setSearchQuery}/>
      <div style={{ padding: "1rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
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
            disabled={loading}
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
            {loading ? "Asking..." : "Ask"}
          </button>
        </div>
        {loading && (
          <div style={{
            marginTop: "0.5rem",
            color: "#3b82f6",
            fontWeight: 500,
            fontStyle: "italic"
          }}>
            Thinking...
          </div>
        )}
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
      </div>
      <main className={darkMode ? styles.appDark : styles.app}>
        {news.map((feed, index) => {
          const filteredItems = feed.items.filter(item =>
            item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.contentSnippet?.toLowerCase().includes(searchQuery.toLowerCase())
          );
          if (filteredItems.length === 0) return null;

          return (
            <div key={index}>
              <h3 className={styles.feedTitle}>{feed.source}</h3>
              <div className={styles.grid}>
                {filteredItems.map((item, idx) => (
                  <NewsCard key={idx} item={item} source={feed.source} onSummarize={handleSummarize} summary={summaryItem[item.title]}/>
                ))}
              </div>
            </div>
          );
        })}
      </main>
      <Footer />
    </div>
  );
}

export default App;
