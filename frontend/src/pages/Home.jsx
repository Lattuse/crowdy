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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold text-white">Campaigns</h1>
        <select
          className="border border-slate-700 bg-charcoal-900 text-slate-200 p-2 rounded"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="active">active</option>
          <option value="successful">successful</option>
          <option value="failed">failed</option>
        </select>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {data.map((c, index) => (
          <Link
            key={c._id}
            to={`/campaign/${c._id}`}
            className="card p-4 transition hover:border-crowdy-accent hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(56,189,248,0.18)] animate-fade-up"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="font-bold text-white">{c.title}</div>
            <div className="text-sm text-slate-300 line-clamp-2">{c.description}</div>
            <div className="mt-2 text-sm text-slate-300">
              {c.currentAmount} / {c.targetAmount} •{' '}
              <span className="font-semibold text-crowdy-accent">{c.status}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
