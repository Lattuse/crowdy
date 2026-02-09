import { useEffect, useState } from "react";
import { http } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const { user } = useAuth();
  const nav = useNavigate();

  const creatorId = user?.id || user?._id;

  const [tiers, setTiers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [minTierName, setMinTierName] = useState("");
  const [isLockedUntilSuccess, setIsLockedUntilSuccess] = useState(false);
  const [campaignId, setCampaignId] = useState("");

  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    async function load() {
      if (!creatorId) return;
      const t = await http.get(`/tiers/creator/${creatorId}`);
      setTiers(t.data);
      if (t.data.length > 0) setMinTierName(t.data[t.data.length - 1].name); // default highest (last if sorted)
      const c = await http.get(`/campaigns?status=active&page=1&limit=50`);
      // фильтруем только кампании этого creator (потому что campaigns list общий)
      setCampaigns((c.data.data || []).filter(x => String(x.creatorId) === String(creatorId)));
    }
    if (user?.role === "creator") load();
  }, [creatorId, user?.role]);

  async function submit(e) {
    e.preventDefault();
    setErr(""); setOk("");

    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("body", body);
      fd.append("minTierName", minTierName);
      fd.append("isLockedUntilSuccess", String(isLockedUntilSuccess));

      // campaignId only if selected
      if (campaignId) fd.append("campaignId", campaignId);

      for (const f of images) fd.append("images", f);
      for (const f of videos) fd.append("videos", f);

      const res = await http.post("/posts", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setOk("Post created!");
      // отправим на страницу creator, чтобы сразу увидеть
      nav(`/creator/${creatorId}`);
      return res.data;
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to create post");
    }
  }

  if (user?.role !== "creator") {
    return <div className="bg-white p-6 rounded shadow">Only creators can create posts.</div>;
  }

  return (
    <div className="max-w-2xl bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">Create post</h1>

      {err && <div className="mb-3 text-red-600 text-sm">{err}</div>}
      {ok && <div className="mb-3 text-green-700 text-sm">{ok}</div>}

      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="title"
          value={title} onChange={(e)=>setTitle(e.target.value)} />

        <textarea className="w-full border p-2 rounded h-32" placeholder="body"
          value={body} onChange={(e)=>setBody(e.target.value)} />

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Minimum tier</div>
            <select className="w-full border p-2 rounded" value={minTierName}
              onChange={(e)=>setMinTierName(e.target.value)}>
              {tiers.map(t => (
                <option key={t._id} value={t.name}>{t.name} ({t.price})</option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">Campaign (optional)</div>
            <select className="w-full border p-2 rounded" value={campaignId}
              onChange={(e)=>setCampaignId(e.target.value)}>
              <option value="">— none —</option>
              {campaigns.map(c => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isLockedUntilSuccess}
            onChange={(e)=>setIsLockedUntilSuccess(e.target.checked)} />
          Lock until campaign success (if campaign selected)
        </label>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Images (multiple)</div>
            <input type="file" multiple accept="image/*"
              onChange={(e)=>setImages([...e.target.files])} />
            {images.length > 0 && (
              <div className="text-xs text-gray-600 mt-1">{images.length} selected</div>
            )}
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Videos (multiple)</div>
            <input type="file" multiple accept="video/*"
              onChange={(e)=>setVideos([...e.target.files])} />
            {videos.length > 0 && (
              <div className="text-xs text-gray-600 mt-1">{videos.length} selected</div>
            )}
          </div>
        </div>

        <button className="w-full bg-black text-white p-2 rounded">
          Publish
        </button>
      </form>
    </div>
  );
}

