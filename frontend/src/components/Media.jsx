import { useState } from "react";

export default function Media({ url, type }) {
  const [failed, setFailed] = useState(false);

  if (!url) return null;

  const Locked = () => (
    <div className="w-full aspect-video rounded border border-slate-700 bg-charcoal-900/70 flex items-center justify-center">
      <div className="text-center">
        <div className="text-sm font-semibold">Locked media</div>
        <div className="text-xs text-slate-400 mt-1">
          Subscribe to unlock
        </div>
      </div>
    </div>
  );

  if (failed) return <Locked />;

  // IMAGE
  if (type === "image") {
    return (
      <img
        src={url}
        alt="post media"
        className="w-full rounded border border-slate-700 object-cover"
        onError={() => setFailed(true)}
        loading="lazy"
      />
    );
  }

  // VIDEO
  if (type === "video") {
    return (
      <video
        className="w-full rounded border border-slate-700"
        controls
        preload="metadata"
        onError={() => setFailed(true)}
      >
        <source src={url} />
        {/* эт если браузер не поддерживает */}
      </video>
    );
  }

  return null;
}
