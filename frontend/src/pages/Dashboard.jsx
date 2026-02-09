import { useEffect, useState } from "react";
import { http } from "../api/http";
import { useAuth } from "../auth/AuthContext";

function StatCard({ title, value, subtitle }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
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
    return <div className="bg-white p-6 rounded shadow">Only creators have dashboard.</div>;
  }

  if (err) return <div className="text-red-600">{err}</div>;
  if (!data) return <div>Loading...</div>;

  // helper: sum amounts in totalsByStatus array
  function sumTotals(arr) {
    return (arr || []).reduce((acc, x) => acc + (x.totalAmount || 0), 0);
  }

  const crowdfundingTotal = sumTotals(data.crowdfunding?.totalsByStatus);
  const regularTotal = sumTotals(data.regular?.totalsByStatus);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Creator Dashboard</h1>
        <div className="text-sm text-gray-600">Analytics from MongoDB aggregation</div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Crowdfunding total" value={crowdfundingTotal} subtitle="All statuses" />
        <StatCard title="Regular total" value={regularTotal} subtitle="All statuses" />
        <StatCard
          title="Campaigns"
          value={data.campaigns?.length || 0}
          subtitle="Your campaigns in DB"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded shadow">
          <div className="font-bold mb-3">Crowdfunding totals by status</div>
          <div className="space-y-2">
            {(data.crowdfunding?.totalsByStatus || []).map((s) => (
              <div key={s._id} className="flex justify-between text-sm">
                <span className="text-gray-600">{s._id}</span>
                <span className="font-semibold">{s.totalAmount} ({s.paymentsCount})</span>
              </div>
            ))}
            {(data.crowdfunding?.totalsByStatus || []).length === 0 && (
              <div className="text-sm text-gray-500">No crowdfunding payments yet.</div>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <div className="font-bold mb-3">Regular totals by status</div>
          <div className="space-y-2">
            {(data.regular?.totalsByStatus || []).map((s) => (
              <div key={s._id} className="flex justify-between text-sm">
                <span className="text-gray-600">{s._id}</span>
                <span className="font-semibold">{s.totalAmount} ({s.paymentsCount})</span>
              </div>
            ))}
            {(data.regular?.totalsByStatus || []).length === 0 && (
              <div className="text-sm text-gray-500">No regular payments yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded shadow">
        <div className="font-bold mb-3">Top supporters</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="py-2">Name</th>
                <th>Email</th>
                <th className="text-right">Total</th>
                <th className="text-right">Payments</th>
              </tr>
            </thead>
            <tbody>
              {(data.crowdfunding?.topSupporters || []).map((u) => (
                <tr key={u.userId} className="border-t">
                  <td className="py-2">{u.name}</td>
                  <td className="text-gray-600">{u.email}</td>
                  <td className="text-right font-semibold">{u.totalContributed}</td>
                  <td className="text-right">{u.paymentsCount}</td>
                </tr>
              ))}
              {(data.crowdfunding?.topSupporters || []).length === 0 && (
                <tr>
                  <td className="py-3 text-gray-500" colSpan={4}>
                    No supporters yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-5 rounded shadow">
        <div className="font-bold mb-3">Your campaigns</div>
        <div className="grid md:grid-cols-2 gap-3">
          {(data.campaigns || []).map((c) => (
            <div key={c._id} className="border rounded p-4">
              <div className="font-bold">{c.title}</div>
              <div className="text-sm text-gray-600 line-clamp-2">{c.description}</div>
              <div className="mt-2 text-sm">
                {c.currentAmount} / {c.targetAmount} • <b>{c.status}</b>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Progress: {c.progressPercent}%
              </div>
            </div>
          ))}
          {(data.campaigns || []).length === 0 && (
            <div className="text-sm text-gray-500">No campaigns yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

