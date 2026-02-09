import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { http } from "../api/http";

export default function UserProfile() {
  const { id } = useParams();
  const [u, setU] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await http.get(`/users/${id}`);
      setU(res.data);
    }
    load();
  }, [id]);

  if (!u) return <div>Loading...</div>;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold">{u.name}</h1>
      <div className="text-sm text-gray-600">Role: {u.role}</div>

      {u.role === "creator" && (
        <div className="mt-3">
          <Link className="underline" to={`/creator/${u._id}`}>Go to creator page</Link>
        </div>
      )}
    </div>
  );
}
