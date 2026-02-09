import { useEffect, useState } from "react";
import { http } from "../api/http";
import { Link } from "react-router-dom";

function Badge({ children }) {
  return (
    <span className="text-xs px-2 py-1 rounded bg-gray-100">{children}</span>
  );
}

export default function MySubscriptions() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  async function cancel(id) {
    if (!confirm("Cancel this subscription?")) return;
    await http.patch(`/subscriptions/${id}/cancel`);
    // reload
    const res = await http.get("/subscriptions/me");
    setItems(res.data.data || []);
  }

  useEffect(() => {
    async function load() {
      try {
        setErr("");
        const res = await http.get("/subscriptions/me");
        setItems(res.data.data || []);
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load subscriptions");
      }
    }
    load();
  }, []);

  if (err) return <div className="text-red-600">{err}</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold">My subscriptions</h1>
        <div className="text-sm text-gray-600">
          Regular + crowdfunding, including queued/paused statuses (if present)
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        {items.length === 0 ? (
          <div className="text-sm text-gray-500">
            You have no subscriptions yet.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((s) => (
              <div key={s._id} className="border rounded p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">
                      {s.creator?.name || "Unknown creator"} — {s.tierName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {s.type} • status: <b>{s.status}</b>
                    </div>

                    {s.campaign && (
                      <div className="text-xs text-gray-500 mt-1">
                        Campaign: {s.campaign.title} • {s.campaign.status} •{" "}
                        {s.campaign.currentAmount}/{s.campaign.targetAmount}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 mt-1">
                      Start:{" "}
                      {s.startDate
                        ? new Date(s.startDate).toLocaleString()
                        : "—"}
                      {s.endDate && (
                        <> • End: {new Date(s.endDate).toLocaleString()}</>
                      )}
                    </div>

                    {s.resumeAt && (
                      <div className="text-xs text-gray-500">
                        Resume at: {new Date(s.resumeAt).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <Badge>{s.type}</Badge>
                      <Badge>{s.status}</Badge>
                    </div>
                    {s.creatorId && (
                      <Link
                        className="underline text-sm"
                        to={`/creator/${s.creatorId}`}
                      >
                        Open creator
                      </Link>
                    )}
                    {s.campaignId && (
                      <Link
                        className="underline text-sm"
                        to={`/campaign/${s.campaignId}`}
                      >
                        Open campaign
                      </Link>
                    )}
                    <br></br>
                    <button
                      onClick={() => cancel(s._id)}
                      className="px-3 py-1 border rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
