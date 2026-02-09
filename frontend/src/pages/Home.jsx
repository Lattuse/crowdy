import { useEffect, useState } from "react";
import { http } from "../api/http";
import { Link } from "react-router-dom";

export default function Home() {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState("active");

  useEffect(() => {
    async function load() {
      const res = await http.get(`/campaigns?status=${status}&page=1&limit=12`);
      setData(res.data.data);
    }
    load();
  }, [status]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <select className="border p-2 rounded" value={status} onChange={(e)=>setStatus(e.target.value)}>
          <option value="active">active</option>
          <option value="successful">successful</option>
          <option value="failed">failed</option>
        </select>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {data.map(c => (
          <Link key={c._id} to={`/campaign/${c._id}`} className="bg-white p-4 rounded shadow hover:shadow-md">
            <div className="font-bold">{c.title}</div>
            <div className="text-sm text-gray-600 line-clamp-2">{c.description}</div>
            <div className="mt-2 text-sm">
              {c.currentAmount} / {c.targetAmount} • <span className="font-semibold">{c.status}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
