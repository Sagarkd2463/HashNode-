import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api.js";
import Markdown from "../components/Markdown.jsx";

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState({
    title: "",
    content: "",
    coverImage: "",
    status: "draft",
    tags: [],
  });

  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load tags and post
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get all tags
        const tagRes = await api.get("/tags");
        setTags(tagRes.data.data.tags);

        // Get existing post when editing
        if (id) {
          const postRes = await api.get("/posts/mine");

          const posts = postRes.data.data.posts;

          const p = posts.find((item) => item._id === id);

          if (!p) {
            setError("Post not found");
            return;
          }

          setPost({
            title: p.title,
            content: p.content,
            coverImage: p.coverImage || "",
            status: p.status,
            tags: p.tags.map((tag) => tag._id || tag),
          });
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load data"
        );
      }
    };

    loadData();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    setPost({
      ...post,
      [e.target.name]: e.target.value,
    });
  };

  // Select or remove tags
  const handleTag = (tagId) => {
    setPost((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  // Add new tag
  const addTag = async () => {
    if (!newTag.trim()) return;

    try {
      const res = await api.post("/tags", {
        name: newTag.trim(),
      });

      const tag = res.data.data.tag;

      setTags((prev) =>
        prev.some((item) => item._id === tag._id)
          ? prev
          : [...prev, tag]
      );

      setPost((prev) => ({
        ...prev,
        tags: [...new Set([...prev.tags, tag._id])],
      }));

      setNewTag("");
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not create tag"
      );
    }
  };

  // Save post
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (id) {
        // Update existing post
        await api.put(`/posts/${id}`, post);
      } else {
        // Create new post
        await api.post("/posts", post);
      }

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not save post"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>{id ? "Edit Post" : "Write a Post"}</h1>

      {error && <p className="error">{error}</p>}

      <div className="editor">

        {/* Editor Form */}
        <form className="form panel" onSubmit={handleSave}>

          <label>
            Title
            <input
              type="text"
              name="title"
              value={post.title}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Cover Image URL
            <input
              type="text"
              name="coverImage"
              value={post.coverImage}
              onChange={handleChange}
            />
          </label>

          <label>
            Markdown Content
            <textarea
              name="content"
              rows="18"
              value={post.content}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Status
            <select
              name="status"
              value={post.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>

          {/* Select Tags */}
          <b>Tags</b>

          {tags.map((tag) => (
            <label className="check" key={tag._id}>
              <input
                type="checkbox"
                checked={post.tags.includes(tag._id)}
                onChange={() => handleTag(tag._id)}
              />

              {tag.name}
            </label>
          ))}

          {/* Add New Tag */}
          <div className="row">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter new tag"
            />

            <button type="button" onClick={addTag}>
              Add Tag
            </button>
          </div>

          {/* Save Button */}
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Post"}
          </button>

        </form>

        {/* Live Preview */}
        <aside className="panel">
          <h2>Live Preview</h2>

          <h2>{post.title}</h2>

          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className="article-cover"
            />
          )}

          <Markdown content={post.content} />
        </aside>

      </div>
    </>
  );
};

export default Editor;