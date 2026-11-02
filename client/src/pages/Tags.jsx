import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api.js";

const Tags = () => {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api.get("/tags");
        setTags(res.data.data.tags);
      } catch (error) {
        console.log("Error fetching tags:", error?.response?.data?.message || error.message);
      }
    };

    fetchTags();
  }, []);

  return (
    <>
      <h1>Explore Tags</h1>

      <div className="grid">
        {tags.map((tag) => (
          <Link className="panel" key={tag._id} to={`/tags/${tag.slug}`}>
            <b>#{tag.name}</b>
            <p>{tag.postCount || 0} published posts</p>
          </Link>
        ))}
      </div>
    </>
  );
};

export default Tags;
