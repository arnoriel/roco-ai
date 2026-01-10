// File: components/YouTubePlayer.tsx
import React from "react";

const YouTubePlayer = ({ videoId }: { videoId: string }) => (
  <div className="my-4 rounded-xl overflow-hidden border border-slate-700 shadow-lg">
    <iframe
      width="100%"
      height="315"
      src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  </div>
);

export default YouTubePlayer;