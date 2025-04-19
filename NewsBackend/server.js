import express from "express";
import cors from "cors";
import Parser from "rss-parser";
import dotenv from "dotenv";
import axios  from 'axios';
dotenv.config();


const app = express();
const PORT = process.env.PORT || 8080;
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) InstAInews RSS Reader'
  }
});

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

// Sample RSS feeds
const feeds = [
  {
    name: "techcrunch",
    url: "https://feeds.feedburner.com/TechCrunch/"
  },
  {
    name: "hackernews",
    url: "https://hnrss.org/frontpage"
  },
  {
    name: "toi-india",
    url: "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms" // National News
  },
  {
    name: "toi-technology",
    url: "https://timesofindia.indiatimes.com/rssfeeds/5880659.cms" // Tech
  },
  {
    name: "toi-business",
    url: "https://timesofindia.indiatimes.com/rssfeeds/1898055.cms" // Business
  },
  {
    name: "indiatoday-sports",
    url: "https://www.indiatoday.in/rss/sports.xml"
  },
  {
    name: "thehindu-opinion",
    url: "https://www.thehindu.com/opinion/feeder/default.rss"
  },
  {
    name: "moneycontrol-markets",
    url: "https://www.moneycontrol.com/rss/MCtopnews.xml"
  },
  {
    name: "filmfare-entertainment",
    url: "https://www.filmfare.com/rss/news"
  },
  {
    name: "ndtv-latest",
    url: "https://feeds.feedburner.com/ndtvnews-latest"
  },
  {
    name: "indianexpress-topnews",
    url: "https://indianexpress.com/section/india/feed/"
  },
  {
    name: "news18-top",
    url: "https://www.news18.com/rss/india.xml"
  }
];

app.get("/api/news", async (req, res) => {
  try {
    const { source } = req.query;
    const filteredFeeds = source ? feeds.filter(f => f.name === source) : feeds;
    const results = await Promise.allSettled(
      filteredFeeds.map(async (feed) => {
        try {
          const data = await parser.parseURL(feed.url);
          const items = data.items.slice(0, 10).map(item => {
            const image =
              item.enclosure?.url ||
              item["media:content"]?.url ||
              (item.content && item.content.match(/<img[^>]+src="([^">]+)"/)?.[1]) ||
              null;
            return {
              ...item,
              image
            };
          });
          return {
            source: feed.name,
            items
          };
        } catch (err) {
          console.error(`❌ Failed to fetch: ${feed.name} | ${feed.url}`);
          return {
            source: feed.name,
            items: [],
            error: true
          };
        }
      })
    );

    const feedsData = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value).filter(feed => !feed.error);

    res.json({ status: "ok", feeds: feedsData });
  } catch (err) {
    console.error("Error fetching RSS feeds:", err);
    res.status(500).json({ status: "error", message: "Failed to fetch news feeds." });
  }
});

app.get("/api/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ status: "error", message: "Query is required" });

    const results = await Promise.allSettled(
      feeds.map(async (feed) => {
        try {
          const data = await parser.parseURL(feed.url);
          const items = data.items
            .filter(item =>
              item.title?.toLowerCase().includes(query.toLowerCase()) ||
              item.content?.toLowerCase().includes(query.toLowerCase()) ||
              item.contentSnippet?.toLowerCase().includes(query.toLowerCase())
            )
            .map(item => {
              const image =
                item.enclosure?.url ||
                item["media:content"]?.url ||
                (item.content && item.content.match(/<img[^>]+src="([^">]+)"/)?.[1]) ||
                null;
              return {
                ...item,
                image
              };
            });
          return { source: feed.name, items };
        } catch (err) {
          return { source: feed.name, items: [], error: true };
        }
      })
    );

    const filteredResults = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)
      .filter(feed => feed.items.length > 0);

    res.json({ status: "ok", results: filteredResults });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ status: "error", message: "Failed to search news feeds." });
  }
});

app.get("/api/sources", (req, res) => {
  const sourceList = feeds.map(feed => ({
    label: feed.name
      .replace(/-/g, " ")
      .replace(/\b\w/g, l => l.toUpperCase()),
    value: feed.name
  }));
  res.json({ status: "ok", sources: sourceList });
});

app.post("/api/summarize", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ status: "error", message: "Text is required" });

    // const completion = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages: [
    //     { role: "system", content: "You are an AI assistant that summarizes news articles." },
    //     { role: "user", content: `Summarize the following news in 2-3 lines:\n\n${text}` }
    //   ]
    // });

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: "system", content: "You are an AI assistant that summarizes news articles." },
          { role: "user", content: `Summarize the following news in 2-3 lines:\n\n${text}` }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          // 'HTTP-Referer': 'http://localhost', // or your deployed URL
          'Content-Type': 'application/json',
        },
      }
    );

    const summary = response.data.choices[0].message.content;
    res.json({ status: "ok", summary });
  } catch (err) {
    console.error("Summarize error:", err);
    res.status(500).json({ status: "error", message: "Failed to summarize text." });
  }
});

app.post("/api/ask-ai", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ status: "error", message: "Question is required" });

    const recentFeeds = await Promise.allSettled(
      feeds.map(async (feed) => {
        try {
          const data = await parser.parseURL(feed.url);
          const items = data.items.slice(0, 5).map(item => ({
            title: item.title,
            snippet: item.contentSnippet || item.description || "",
            source: feed.name
          }));
          return { source: feed.name, items };
        } catch (err) {
          return { source: feed.name, items: [], error: true };
        }
      })
    );

    const newsSnippets = recentFeeds
      .filter(r => r.status === "fulfilled")
      .map(r => r.value.items)
      .flat()
      .filter(item => item.snippet);

    const combinedText = newsSnippets.map(item => `- ${item.title}: ${item.snippet}`).join("\n");

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: "system", content: "You are a helpful assistant that answers questions about recent news in India." },
          { role: "user", content: `Question: ${question}\n\nGiven the following news headlines:\n\n${combinedText}`.slice(0, 10000) }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          // 'HTTP-Referer': 'http://localhost', // or your deployed URL
          'Content-Type': 'application/json',
        },
      }
    );
    console.log("AI response:", response.data);
    const reply = response.data.choices[0].message.content;
    res.json({ status: "ok", answer: reply });
  } catch (err) {
    console.error("Ask AI error:", err);
    res.status(500).json({ status: "error", message: "Failed to process AI question." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error("❌ Error starting server:", err);
});