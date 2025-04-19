export const fetchNews = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/news`);
  const data = await response.json();
  return data.feeds || [];
};
