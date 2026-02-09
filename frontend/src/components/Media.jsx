import { useEffect, useState } from "react";
import { http } from "../api/http";

export default function Media({ url, type }) {
  const [src, setSrc] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let objectUrl = null;

    async function load() {
      try {
        const res = await http.get(url, { responseType: "blob" });
        objectUrl = URL.createObjectURL(res.data);
        setSrc(objectUrl);
      } catch (e) {
        setErr("Locked / not доступно");
      }
    }

    load();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  if (err) return <div className="text-sm text-red-600">{err}</div>;
  if (!src) return <div className="text-sm text-gray-500">Loading media...</div>;

  if (type === "video") {
    return <video controls className="w-full rounded" src={src} />;
  }

  return <img className="w-full rounded" src={src} alt="media" />;
}
