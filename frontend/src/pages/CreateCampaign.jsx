import { useState } from "react";
import { http } from "../api/http";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function CreateCampaign() {
  const { user } = useAuth();
  const nav = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState(100);
  const [startDate, setStartDate] = useState("2026-02-01");
  const [endDate, setEndDate] = useState("2026-03-01");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr(""); setOk("");

    try {
      const res = await http.post("/campaigns", {
        title,
        description,
        targetAmount: Number(targetAmount),
        startDate,
        endDate
      });
      setOk("Campaign created!");
      nav(`/campaign/${res.data._id}`);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to create campaign");
    }
  }

  if (user?.role !== "creator") {
    return <div className="bg-white p-6 rounded shadow">Only creators can create campaigns.</div>;
  }

  return (
    <div className="max-w-xl bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">Create campaign</h1>

      {err && <div className="mb-3 text-red-600 text-sm">{err}</div>}
      {ok && <div className="mb-3 text-green-700 text-sm">{ok}</div>}

      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="title"
          value={title} onChange={(e)=>setTitle(e.target.value)} />

        <textarea className="w-full border p-2 rounded" placeholder="description"
          value={description} onChange={(e)=>setDescription(e.target.value)} />

        <input className="w-full border p-2 rounded" type="number" placeholder="targetAmount"
          value={targetAmount} onChange={(e)=>setTargetAmount(e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Start date</div>
            <input className="w-full border p-2 rounded" type="date"
              value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">End date</div>
            <input className="w-full border p-2 rounded" type="date"
              value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
          </div>
        </div>

        <button className="w-full bg-black text-white p-2 rounded">
          Create
        </button>
      </form>
    </div>
  );
}

