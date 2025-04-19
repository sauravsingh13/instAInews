import { useEffect, useState } from "react";

const useFetchNews = (source) => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/news${source ? `?source=${source}` : ""}`)
      .then((res) => res.json())
      .then((data) => setNews(data.feeds || []))
      .catch(console.error);
  }, [source]);

  return news;
};

export default useFetchNews;
