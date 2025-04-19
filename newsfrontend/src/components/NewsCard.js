import React, { useState } from "react";
import styles from "../styles/NewsCard.module.css";

const NewsCard = ({ item, source, onSummarize, summary }) => {
  const [isToggleOn, setIsToggleOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    const newToggleState = !isToggleOn;
    setIsToggleOn(newToggleState);

    if (newToggleState && !summary) {
      setIsLoading(true);
      await onSummarize(item);
      setIsLoading(false);
    }
  };

  let desc = item.contentSnippet || item.description || "...";

  return (
    <div className={styles.newsCard}>
      <div className={styles.toggleWrapper}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={isToggleOn}
            onChange={handleToggle}
            disabled={isLoading}
          />
          <span className={styles.toggleSlider}></span>
          <span className={styles.toggleText}>
            {isLoading ? "Summarizing..." : "Summarize with AI"}
          </span>
        </label>
      </div>

      {item.image && (
        <img src={item.image} alt="thumbnail" className={styles.thumbnail} />
      )}
      <h2 className={styles.title}>{item.title}</h2>
      {(!isToggleOn || !summary) &&  <p className={styles.desc}>{desc.slice(0, 500) + (desc.length > 500 ? "..." : "")}</p>}
      {(isToggleOn && summary) &&  <p className={styles.summary}><strong>AI Summary:</strong> {summary}</p>}
      {/* <p className={styles.desc}>
        {isToggleOn && summary
          ? summary
          : desc.slice(0, 500) + (desc.length > 500 ? "..." : "")}
      </p> */}
      <div className={styles.sourceDate}>
        <span className={styles.source}>{source}</span>
        <span className={styles.date}>
          {new Date(item.pubDate || item.isoDate || Date.now()).toDateString()}
        </span>
      </div>
      <a href={item.link} target="_blank" rel="noopener noreferrer">
        Read more →
      </a>
    </div>
  );
};

export default NewsCard;
