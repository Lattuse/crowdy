import { useEffect, useState } from "react";
import { http } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user } = useAuth();
  const myId = user?.id || user?._id;

  const [me, setMe] = useState(null);
  const [posts, setPosts] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      const res = await http.get("/users/me");
      setMe(res.data);

      if (res.data.role === "creator") {
        const p = await http.get(`/posts/creator/${myId}`);
        setPosts(p.data);
      }
    }
    if (myId) load();
  }, [myId]);

  async function becomeCreator() {
    setMsg("");
    try {
      const res = await http.patch("/users/me/role", { role: "creator" });
      localStorage.setItem("token", res.data.token);
      window.location.reload();
    } catch (e) {
      setMsg(e.response?.data?.message || "Failed");
    }
  }

  async function deletePost(postId) {
    if (!confirm("Delete this post?")) return;

    try {
      await http.delete(`/posts/${postId}`);
      // обновляем список постов
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (e) {
      alert(e.response?.data?.message || "Failed to delete post");
    }
  }

  if (!me) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold">My Profile</h1>
        <div className="text-sm text-gray-600 mt-2">Name: {me.name}</div>
        <div className="text-sm text-gray-600">Email: {me.email}</div>
        <div className="text-sm text-gray-600">
          Role: <b>{me.role}</b>
        </div>

        {me.role !== "creator" && (
          <button
            onClick={becomeCreator}
            className="mt-4 px-4 py-2 bg-black text-white rounded"
          >
            Become creator
          </button>
        )}

        {msg && <div className="mt-3 text-sm">{msg}</div>}
      </div>

      {me.role === "creator" && (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-bold mb-3">My posts</h2>
          <div className="space-y-2">
            {posts.map((p) => (
              <Link
                key={p._id}
                to={`/post/${p._id}`}
                className="block border rounded p-3 hover:bg-gray-50"
              >
                <div className="font-semibold">{p.title}</div>
                <div className="text-xs text-gray-500">
                  minTier: {p.minTierName}
                </div>

                <br></br>

                <button
                  onClick={() => deletePost(p._id)}
                  className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </Link>
            ))}
            {posts.length === 0 && (
              <div className="text-sm text-gray-500">No posts yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
