import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { http } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import Media from "../components/Media";

export default function CreatorPage() {
  const { id } = useParams(); // creatorId
  const { user } = useAuth();
  const myId = user?.id || user?._id;

  const [tiers, setTiers] = useState([]);
  const [posts, setPosts] = useState([]);

  // subscribe state
  const [selectedTier, setSelectedTier] = useState("");
  const [amount, setAmount] = useState(0);
  const [subMsg, setSubMsg] = useState("");

  useEffect(() => {
    async function load() {
      // load tiers
      const t = await http.get(`/tiers/creator/${id}`);
      setTiers(t.data);

      // init default tier
      if (t.data.length > 0) {
        setSelectedTier(t.data[0].name);
        setAmount(t.data[0].price);
      }

      // load posts (auth optional)
      const p = await http.get(`/posts/creator/${id}`);
      setPosts(p.data);
    }

    load();
  }, [id, user]);

  async function subscribe() {
    setSubMsg("");
    try {
      const payload = {
        creatorId: id,
        tierName: selectedTier,
        type: "regular",
        amount: Number(amount),
      };

      const res = await http.post("/subscriptions", payload);
      setSubMsg(`Subscribed successfully (${res.data.paymentStatus})`);
    } catch (e) {
      setSubMsg(e.response?.data?.message || "Failed to subscribe");
    }
  }

  const selectedTierObj = tiers.find((t) => t.name === selectedTier);

  return (
    <div className="space-y-6">
      {/* Creator header */}
      <div className="card p-5">
        <h1 className="text-2xl font-bold">Creator profile</h1>
        <div className="text-sm text-slate-400 mt-1">ID: {id}</div>
      </div>

      {/* Tiers */}
      <div className="card p-5">
        <h2 className="font-bold mb-3">Tiers</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {tiers.map((t) => (
            <div key={t._id} className="panel">
              <div className="font-bold">{t.name}</div>
              <div className="text-sm">{t.price} / month</div>
              <ul className="mt-2 text-sm text-slate-400 list-disc ml-4">
                {(t.perks || []).map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
          {tiers.length === 0 && (
            <div className="text-sm text-slate-400">No tiers yet.</div>
          )}
        </div>
      </div>

      {/* Subscribe block (not for self) */}
      {user && myId !== id && tiers.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold mb-3">Subscribe</h2>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="label-muted">Tier</div>
              <select
                className="select-field"
                value={selectedTier}
                onChange={(e) => {
                  setSelectedTier(e.target.value);
                  const t = tiers.find((x) => x.name === e.target.value);
                  if (t) setAmount(t.price);
                }}
              >
                {tiers.map((t) => (
                  <option key={t._id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>

              <div className="text-xs text-slate-400 mt-1">
                Price: <b>{selectedTierObj?.price ?? "—"}</b>
              </div>
            </div>

            <div>
              <div className="label-muted">Amount</div>
              <input
                type="number"
                className="input-field"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={subscribe}
            className="mt-4 w-full bg-black text-white p-2 rounded"
          >
            Subscribe (regular)
          </button>

          {subMsg && <div className="mt-2 text-sm">{subMsg}</div>}
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Posts</h2>

        {posts.map((p) => (
          <div key={p._id} className="card p-5 space-y-3">
            <div className="flex justify-between items-center">
              <Link
                to={`/post/${p._id}`}
                className="font-bold text-lg text-crowdy-accent hover:text-crowdy-accent2"
              >
                {p.title}
              </Link>
              <div className="text-xs text-slate-400">
                minTier: {p.minTierName}
              </div>
            </div>

            <div className="whitespace-pre-wrap text-slate-100">{p.body}</div>

            {p.images?.map((url, idx) => (
              <Media key={idx} url={url} type="image" />
            ))}

            {p.videos?.map((url, idx) => (
              <Media key={idx} url={url} type="video" />
            ))}
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-sm text-slate-400">No posts yet.</div>
        )}
      </div>
    </div>
  );
}
