import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { http } from "../api/http";
import Media from "../components/Media";

export default function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await http.get(`/posts/${id}`);
      setPost(res.data);
    }
    load();
  }, [id]);

  if (!post) return <div>Loading...</div>;

  return (
    <div className="bg-white p-6 rounded shadow space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <div className="text-xs text-gray-500">minTier: {post.minTierName}</div>
      </div>

      <div className="whitespace-pre-wrap">{post.body}</div>

      {post.images?.length > 0 && (
        <div className="grid md:grid-cols-3 gap-3">
          {post.images.map((u, i) => <Media key={i} url={u} type="image" />)}
        </div>
      )}

      {post.videos?.length > 0 && (
        <div className="grid md:grid-cols-2 gap-3">
          {post.videos.map((u, i) => <Media key={i} url={u} type="video" />)}
        </div>
      )}
    </div>
  );
}
