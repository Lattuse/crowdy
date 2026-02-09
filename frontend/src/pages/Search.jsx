import { useEffect, useState } from "react";
import { http } from "../api/http";
import { Link } from "react-router-dom";

export default function Search() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [data, setData] = useState([]);
  const [info, setInfo] = useState("");

  useEffect(() => {
    const t = setTimeout(async () => {
      if (q.trim().length < 2) {
        setData([]);
        setInfo("Type at least 2 letters");
        return;
      }

      try {
        setInfo("Searching...");
        const res = await http.get(
          `/users/search?q=${encodeURIComponent(q)}&role=${role}&page=1&limit=12`,
        );
        setData(res.data.data);
        setInfo(
          res.data.total === 0 ? "No results" : `Found: ${res.data.total}`,
        );
      } catch (e) {
        setInfo(e.response?.data?.message || "Search failed");
      }
    }, 350);

    return () => clearTimeout(t);
  }, [q, role]);

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold">Search profiles</h1>
        <div className="text-sm text-gray-600">Find users by name</div>

        <div className="mt-4 grid md:grid-cols-3 gap-3">
          <input
            className="border p-2 rounded md:col-span-2"
            placeholder="Type name (min 2 letters)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">All roles</option>
            <option value="creator">Creators only</option>
            <option value="user">Users only</option>
          </select>
        </div>

        <div className="mt-2 text-sm text-gray-500">{info}</div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <div className="font-bold mb-3">Results</div>

        {data.length === 0 ? (
          <div className="text-sm text-gray-500">No users to show.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {data.map((u) => (
              <div
                key={u._id}
                className="border rounded p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.role}</div>
                  <div className="text-xs text-gray-500">
                    {u.role} • id: {String(u._id).slice(-6)}
                  </div>
                </div>

                {u.role === "creator" ? (
                  <Link className="underline text-sm" to={`/creator/${u._id}`}>
                    Open
                  </Link>
                ) : (
                  <Link className="underline text-sm" to={`/user/${u._id}`}>
                    Open
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
