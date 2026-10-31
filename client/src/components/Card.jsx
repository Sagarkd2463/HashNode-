import { Link } from "react-router-dom";

const Card = ({ post }) => {
  return (
    <article className="card">
      {post.coverImage && <img src={post.coverImage} alt={post.title} />}

      <small>
        {post.author?.name || "Author"} ·
        {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
      </small>

      <h2>
        <Link to={`/posts/${post.slug}`}>{post.title}</Link>
      </h2>

      <p>{post.excerpt}</p>

      <div>
        {post.tags?.map((tag) => (
          <Link key={tag._id} to={`/tags/${tag.slug}`} className="tag">
            #{tag.name}
          </Link>
        ))}
      </div>
    </article>
  );
};

export default Card;
