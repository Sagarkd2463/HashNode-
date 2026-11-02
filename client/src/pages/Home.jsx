import { useEffect, useState } from "react";
import api from "../api/api.js";
import Card from "../components/Card.jsx";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  // Load published posts
  const loadPosts = async (searchText = "") => {
    try {
      setError("");

      const res = await api.get("/posts", {
        params: searchText ? { search: searchText } : {},
      });

      setPosts(res.data.data.posts);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load posts");
    }
  };

  // Load posts when page opens
  useEffect(() => {
    loadPosts();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    loadPosts(search.trim());
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <h1>Read, Write and Share Knowledge.</h1>
        <p>Explore articles from the developer community.</p>
      </section>

      {/* Search Form */}
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search articles"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button type="submit">Search</button>
      </form>

      {/* Articles */}
      <h2>Latest Articles</h2>

      {error && <p className="error">{error}</p>}

      <div className="grid">
        {posts.length > 0
          ? posts.map((post) => <Card key={post._id} post={post} />)
          : !error && <p>No articles found.</p>}
      </div>
    </>
  );
};

export default Home;
