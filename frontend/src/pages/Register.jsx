import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await register(name, email, password);
      nav("/");
    } catch (e) {
      setErr(e.response?.data?.message || "Register failed");
    }
  }

  return (
    <div className="max-w-md mx-auto card p-6 rounded-3xl shadow-glow">
      <h1 className="text-2xl font-bold mb-4 text-slate-100">Register</h1>
      {err && <div className="mb-3 text-rose-400 text-sm">{err}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="w-full bg-charcoal-900 border border-slate-700 text-slate-100 placeholder-slate-500 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-crowdy-accent2"
          placeholder="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full bg-charcoal-900 border border-slate-700 text-slate-100 placeholder-slate-500 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-crowdy-accent2"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full bg-charcoal-900 border border-slate-700 text-slate-100 placeholder-slate-500 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-crowdy-accent2"
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-crowdy-accent2 text-white font-semibold p-3 rounded-xl hover:bg-crowdy-accent hover:text-white focus:outline-none focus:ring-2 focus:ring-crowdy-accent3 transition">Create account</button>
      </form>
    </div>
  );
}
