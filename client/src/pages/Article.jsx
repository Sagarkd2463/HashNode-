import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api.js";
import Markdown from "../components/Markdown.jsx";

const Article = () => {
  const { slug } = useParams();

  const [post, setPost] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/posts/${slug}`)
      .then((res) => {
        setPost(res.data.data.post);
      })
      .catch(() => {
        setError("Article not found");
      });
  }, [slug]);

  if (error) return <p>{error}</p>;

  if (!post) return <p>Loading...</p>;

  return (
    <article className="article">
      <small>By {post.author?.name || "Author"}</small>

      <h1>{post.title}</h1>

      {post.tags?.map((tag) => (
        <Link className="tag" key={tag._id} to={`/tags/${tag.slug}`}>
          #{tag.name}
        </Link>
      ))}

      {post.coverImage && (
        <img className="article-cover" src={post.coverImage} alt={post.title} />
      )}

      <Markdown content={post.content} />
    </article>
  );
};

export default Article;
