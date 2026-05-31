"use client";

import { useEffect, useState } from "react";

export function InitialLoader() {
  const [fade, setFade] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Start the fade-out transition after mounting (next frame)
    const handle = requestAnimationFrame(() => {
      setFade(true);
    });

    // Completely unmount the loader from the React DOM tree after the transition completes
    const timer = setTimeout(() => {
      setVisible(false);
    }, 500); // matches the 0.5s CSS transition duration

    return () => {
      cancelAnimationFrame(handle);
      clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      id="initial-page-loader"
      className={`initial-loader ${fade ? "fade-out" : ""}`}
      suppressHydrationWarning
    >
      <div className="loader-logo" suppressHydrationWarning>
        Velvet Gallery
      </div>
      <div className="loader-bar" suppressHydrationWarning>
        <div className="loader-progress" suppressHydrationWarning />
      </div>
    </div>
  );
}
