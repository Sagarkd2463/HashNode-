import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api.js";
import Card  from "../components/Card.jsx";

const TagFeed = () => {
  const { slug } = useParams();

  const [tag, setTag] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTagPosts = async () => {
      try {
        const res = await api.get(`/tags/${slug}/posts`);

        setTag(res.data.data.tag);
        setPosts(res.data.data.posts);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load tag posts"
        );
      }
    };

    fetchTagPosts();
  }, [slug]);

  return (
    <>
      <h1>{tag ? `#${tag.name}` : "Tag Posts"}</h1>

      {error && <p>{error}</p>}

      <div className="grid">
        {posts.map((post) => (
          <Card key={post._id} post={post} />
        ))}
      </div>
    </>
  );
};

export default TagFeed;