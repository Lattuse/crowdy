import { useEffect, useState } from "react";
import { http } from "../api/http";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function CampaignDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [c, setC] = useState(null);
  const [tierName, setTierName] = useState("Bronze");
  const [amount, setAmount] = useState(10);
  const [type, setType] = useState("crowdfunding");
  const [msg, setMsg] = useState("");
  const [tiers, setTiers] = useState([]);
  const minPrice = tiers.find((t) => t.name === tierName)?.price ?? 0;
  useEffect(() => {
    async function load() {
      const res = await http.get(`/campaigns/${id}`);
      const campaign = res.data;

      setC(campaign);

      // грузим tiers этого creator
      const t = await http.get(`/tiers/creator/${campaign.creatorId}`);
      setTiers(t.data);

      // ставим дефолтный tier + amount=price
      if (t.data.length > 0) {
        setTierName(t.data[0].name);
        setAmount(t.data[0].price);
      } else {
        setTierName("");
        setAmount(0);
      }
    }
    load();
  }, [id]);

  async function buy() {
    setMsg("");
    try {
      const payload = {
        creatorId: c.creatorId,
        tierName,
        type,
        amount: Number(amount),
      };
      if (type === "crowdfunding") payload.campaignId = c._id;
      if (!tierName) {
        setMsg("No tiers available for this creator.");
        return;
      }
      const res = await http.post("/subscriptions", payload);
      setMsg(`OK: paymentStatus=${res.data.paymentStatus}`);
    } catch (e) {
      setMsg(e.response?.data?.message || "Failed");
    }
  }

  if (!c) return <div>Loading...</div>;

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold">{c.title}</h1>
          <div className="text-gray-600">{c.description}</div>
          <div className="mt-2 text-sm">
            {c.currentAmount} / {c.targetAmount} • <b>{c.status}</b>
          </div>

          <div className="mt-3">
            <Link className="underline text-sm" to={`/creator/${c.creatorId}`}>
              Go to creator page
            </Link>
          </div>
        </div>

        <div className="w-full max-w-sm border rounded p-4">
          <div className="font-bold mb-2">Support / Subscribe</div>
          {!user ? (
            <div className="text-sm text-gray-600">Login to subscribe</div>
          ) : (
            <>
              <label className="text-xs text-gray-600">Type</label>
              <select
                className="border p-2 rounded w-full mb-2"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="crowdfunding">crowdfunding (held)</option>
                <option value="regular">regular (released)</option>
              </select>

              <label className="text-xs text-gray-600">Tier</label>

              {tiers.length === 0 ? (
                <div className="text-sm text-gray-500 mb-2">
                  Creator has no tiers yet.
                </div>
              ) : (
                <>
                  <select
                    className="border p-2 rounded w-full mb-2"
                    value={tierName}
                    onChange={(e) => {
                      const name = e.target.value;
                      setTierName(name);
                      const t = tiers.find((x) => x.name === name);
                      if (t) setAmount(t.price);
                    }}
                  >
                    {tiers.map((t) => (
                      <option key={t._id} value={t.name}>
                        {t.name} ({t.price})
                      </option>
                    ))}
                  </select>

                  <div className="text-xs text-gray-600 mb-2">
                    Price:{" "}
                    <b>
                      {tiers.find((t) => t.name === tierName)?.price ?? "—"}
                    </b>
                  </div>
                </>
              )}

              <label className="text-xs text-gray-600">Amount</label>

              <input
                type="number"
                min={minPrice}
                className="border p-2 rounded w-full mb-3"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <button
                onClick={buy}
                className="w-full bg-black text-white p-2 rounded"
              >
                Subscribe
              </button>

              {msg && <div className="mt-2 text-sm">{msg}</div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
