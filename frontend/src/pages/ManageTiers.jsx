import { useEffect, useState } from "react";
import { http } from "../api/http";
import { useAuth } from "../auth/AuthContext";

function TierForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || "");
  const [price, setPrice] = useState(initial?.price ?? 5);
  const [perksText, setPerksText] = useState((initial?.perks || []).join("\n"));
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");

    if (!name.trim()) return setErr("Name is required");
    if (Number(price) <= 0) return setErr("Price must be > 0");

    const perks = perksText
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean);

    await onSave({ name: name.trim(), price: Number(price), perks });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {err && <div className="text-sm text-red-300">{err}</div>}

      <div>
        <div className="label-muted">Tier name</div>
        <input
          className="input-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Bronze / Silver / Gold"
        />
      </div>

      <div>
        <div className="label-muted">Price (per 30 days)</div>
        <input
          type="number"
          className="input-field"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <div>
        <div className="label-muted">Perks (one per line)</div>
        <textarea
          className="textarea-field h-28"
          value={perksText}
          onChange={(e) => setPerksText(e.target.value)}
          placeholder={"Basic access\nEarly posts\nBehind the scenes"}
        />
      </div>

      <div className="flex gap-2">
        <button className="btn btn-primary">
          Save
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function ManageTiers() {
  const { user } = useAuth();
  const creatorId = user?.id || user?._id;

  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [editing, setEditing] = useState(null); // tier object or null
  const [creating, setCreating] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setErr("");
      const res = await http.get(`/tiers/creator/${creatorId}`);
      // полезно сортировать по цене
      const sorted = [...res.data].sort((a, b) => (a.price || 0) - (b.price || 0));
      setTiers(sorted);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load tiers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (creatorId && user?.role === "creator") load();
  }, [creatorId, user?.role]);

  async function createTier(payload) {
    setMsg(""); setErr("");
    try {
      await http.post("/tiers", payload);
      setMsg("Tier created");
      setCreating(false);
      await load();
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to create tier");
    }
  }

  async function updateTier(tierId, payload) {
    setMsg(""); setErr("");
    try {
      await http.patch(`/tiers/${tierId}`, payload);
      setMsg("Tier updated");
      setEditing(null);
      await load();
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to update tier");
    }
  }

  async function deleteTier(tierId) {
    if (!confirm("Delete this tier?")) return;
    setMsg(""); setErr("");
    try {
      await http.delete(`/tiers/${tierId}`);
      setMsg("Tier deleted");
      await load();
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to delete tier");
    }
  }

  if (user?.role !== "creator") {
    return <div className="card p-6">Only creators can manage tiers.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card p-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manage tiers</h1>
          <div className="text-sm text-slate-400">
            Create / edit / delete subscription levels
          </div>
        </div>

        {!creating && !editing && (
          <button
            onClick={() => setCreating(true)}
            className="btn btn-primary"
          >
            + New tier
          </button>
        )}
      </div>

      {(msg || err) && (
        <div className={`p-3 rounded ${err ? "bg-red-900/60 text-red-200" : "bg-emerald-900/50 text-emerald-200"}`}>
          {err || msg}
        </div>
      )}

      {creating && (
        <div className="card p-6">
          <div className="font-bold mb-3">Create tier</div>
          <TierForm
            onSave={createTier}
            onCancel={() => setCreating(false)}
          />
        </div>
      )}

      {editing && (
        <div className="card p-6">
          <div className="font-bold mb-3">Edit tier</div>
          <TierForm
            initial={editing}
            onSave={(payload) => updateTier(editing._id, payload)}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      <div className="card p-6">
        <div className="font-bold mb-3">Your tiers</div>

        {loading ? (
          <div>Loading...</div>
        ) : tiers.length === 0 ? (
          <div className="text-sm text-slate-400">No tiers yet. Create your first tier.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {tiers.map(t => (
              <div key={t._id} className="panel">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold">{t.name}</div>
                    <div className="text-sm text-slate-400">{t.price} / 30 days</div>
                  </div>

                  <div className="flex gap-2">
                            <button
                      onClick={() => { setEditing(t); setCreating(false); }}
                      className="btn btn-secondary text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTier(t._id)}
                      className="btn btn-secondary text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {t.perks?.length > 0 && (
                  <ul className="mt-3 text-sm text-slate-400 list-disc ml-5">
                    {t.perks.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
