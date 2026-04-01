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
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl card p-6">Only creators can create campaigns.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl card p-6">
        <h1 className="text-xl font-bold mb-4">Create campaign</h1>

      {err && <div className="mb-3 text-red-400 text-sm">{err}</div>}
      {ok && <div className="mb-3 text-emerald-300 text-sm">{ok}</div>}

      <form onSubmit={submit} className="space-y-3">
        <input className="input-field" placeholder="title"
          value={title} onChange={(e)=>setTitle(e.target.value)} />

        <textarea className="textarea-field" placeholder="description"
          value={description} onChange={(e)=>setDescription(e.target.value)} />

        <input className="input-field" type="number" placeholder="targetAmount"
          value={targetAmount} onChange={(e)=>setTargetAmount(e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="label-muted">Start date</div>
            <input className="input-field" type="date"
              value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
          </div>
          <div>
            <div className="label-muted">End date</div>
            <input className="input-field" type="date"
              value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
          </div>
        </div>

        <button className="btn btn-primary w-full">
          Create
        </button>
      </form>
    </div>
  </div>
  );
}

