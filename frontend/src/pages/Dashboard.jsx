import { useEffect, useState } from "react";
import { http } from "../api/http";
import { useAuth } from "../auth/AuthContext";

function StatCard({ title, value, subtitle, delay = 0 }) {
  return (
    <div
      className="card p-4 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-sm text-slate-400">{title}</div>
      <div className="text-2xl font-bold mt-1 text-white">{value}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
    </div>
  );
}

function DataBar({ label, value, max, delay = 0 }) {
  const width = max ? Math.max(6, Math.round((value / max) * 100)) : 0;
  return (
    <div className="space-y-2 animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="bar-label">
        <span>{label}</span>
        <span className="text-white font-semibold">{value}</span>
      </div>
      <div className="chart-track">
        <div className="chart-bar" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setErr("");
        const res = await http.get(`/creators/${user._id || user.id || user._id}/dashboard`);
        setData(res.data);
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load dashboard");
      }
    }
    if (user?.role === "creator") load();
  }, [user]);

  // ⚠️ у тебя user может приходить как {_id: ...} или {id: ...}
  // чтобы точно работало, лучше в AuthContext me() вернуть id в одном формате.
  // Пока — сделаем нормализацию:
  const creatorId = user?.id || user?._id;

  useEffect(() => {
    async function load() {
      try {
        if (!creatorId) return;
        const res = await http.get(`/creators/${creatorId}/dashboard`);
        setData(res.data);
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load dashboard");
      }
    }
    if (user?.role === "creator") load();
  }, [creatorId, user?.role]);

  if (user?.role !== "creator") {
    return (
      <div className="bg-charcoal-800/95 border border-slate-800 p-6 rounded-3xl shadow-glow text-slate-200">
        Only creators have dashboard.
      </div>
    );
  }

  if (err) return <div className="text-crowdy-accent3">{err}</div>;
  if (!data) return <div className="text-slate-300">Loading...</div>;

  // helper: sum amounts in totalsByStatus array
  function sumTotals(arr) {
    return (arr || []).reduce((acc, x) => acc + (x.totalAmount || 0), 0);
  }

  const crowdfundingTotal = sumTotals(data.crowdfunding?.totalsByStatus);
  const regularTotal = sumTotals(data.regular?.totalsByStatus);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Creator Dashboard</h1>
        <div className="text-sm text-slate-400">Analytics from MongoDB aggregation</div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Crowdfunding total" value={crowdfundingTotal} subtitle="All statuses" delay={0} />
        <StatCard title="Regular total" value={regularTotal} subtitle="All statuses" delay={90} />
        <StatCard
          title="Campaigns"
          value={data.campaigns?.length || 0}
          subtitle="Your campaigns in DB"
          delay={180}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-charcoal-800/95 border border-slate-800 p-5 rounded-3xl shadow-glow">
          <div className="font-bold text-white mb-3">Crowdfunding totals by status</div>
          <div className="space-y-4">
            {(data.crowdfunding?.totalsByStatus || []).length > 0 ? (
              (data.crowdfunding.totalsByStatus || []).map((s, index) => (
                <DataBar
                  key={s._id}
                  label={s._id}
                  value={s.totalAmount}
                  max={Math.max(...(data.crowdfunding?.totalsByStatus || []).map((entry) => entry.totalAmount), 1)}
                  delay={index * 80}
                />
              ))
            ) : (
              <div className="text-sm text-slate-400">No crowdfunding payments yet.</div>
            )}
          </div>
        </div>

        <div className="bg-charcoal-800/95 border border-slate-800 p-5 rounded-3xl shadow-glow">
          <div className="font-bold text-white mb-3">Regular totals by status</div>
          <div className="space-y-4">
            {(data.regular?.totalsByStatus || []).length > 0 ? (
              (data.regular.totalsByStatus || []).map((s, index) => (
                <DataBar
                  key={s._id}
                  label={s._id}
                  value={s.totalAmount}
                  max={Math.max(...(data.regular?.totalsByStatus || []).map((entry) => entry.totalAmount), 1)}
                  delay={index * 80}
                />
              ))
            ) : (
              <div className="text-sm text-slate-400">No regular payments yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-charcoal-800/95 border border-slate-800 p-5 rounded-3xl shadow-glow">
        <div className="font-bold text-white mb-3">Top supporters</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="py-2">Name</th>
                <th>Email</th>
                <th className="text-right">Total</th>
                <th className="text-right">Payments</th>
              </tr>
            </thead>
            <tbody>
              {(data.crowdfunding?.topSupporters || []).map((u) => (
                <tr key={u.userId} className="border-t border-slate-700">
                  <td className="py-2 text-slate-200">{u.name}</td>
                  <td className="text-slate-400">{u.email}</td>
                  <td className="text-right font-semibold text-white">{u.totalContributed}</td>
                  <td className="text-right text-slate-300">{u.paymentsCount}</td>
                </tr>
              ))}
              {(data.crowdfunding?.topSupporters || []).length === 0 && (
                <tr>
                  <td className="py-3 text-slate-400" colSpan={4}>
                    No supporters yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-charcoal-800/95 border border-slate-800 p-5 rounded-3xl shadow-glow">
        <div className="font-bold text-white mb-3">Your campaigns</div>
        <div className="grid md:grid-cols-2 gap-3">
          {(data.campaigns || []).map((c, index) => (
            <div
              key={c._id}
              className="border border-slate-700 rounded-3xl p-4 bg-charcoal-900/90 transition-all duration-700 ease-out transform hover:-translate-y-1 hover:border-crowdy-accent2 shadow-glow animate-fade-up"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="font-bold text-white">{c.title}</div>
              <div className="text-sm text-slate-400 line-clamp-2">{c.description}</div>
              <div className="mt-2 text-sm text-slate-300">
                {c.currentAmount} / {c.targetAmount} •{' '}
                <span className="font-semibold text-crowdy-accent">{c.status}</span>
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Progress: {c.progressPercent}%
              </div>
            </div>
          ))}
          {(data.campaigns || []).length === 0 && (
            <div className="text-sm text-slate-400">No campaigns yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

