import { useEffect, useState } from "react";

export function SplashScreen({ onFinished }: { onFinished?: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setExiting(true), 1900);
    const doneTimer = window.setTimeout(() => {
      onFinished?.();
    }, 2600);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onFinished]);

  return (
    <div
      aria-hidden={exiting}
      className={[
        "fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden",
        "bg-[oklch(0.55_0.17_152)] transition-opacity duration-700 ease-out",
        exiting ? "pointer-events-none opacity-0" : "opacity-100",
      ].join(" ")}
    >
      <div className="flex w-full flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-white">NorthGo</h1>
          <p className="mt-1 text-sm font-medium text-white/90">Isiolo ⇄ Nairobi · Sienta rides</p>
        </div>

        {/* Road with a Sienta driving across, "N" badge on the door */}
        <div className="relative h-28 w-full">
          <div className="absolute bottom-6 left-0 right-0 h-[3px] bg-white/25" />
          <div className="absolute bottom-[26px] left-0 right-0 flex gap-6 overflow-hidden opacity-70">
            <div className="flex animate-[roadmove_0.7s_linear_infinite] gap-6">
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={i} className="block h-[3px] w-8 shrink-0 bg-white/70" />
              ))}
            </div>
          </div>

          <div className="absolute bottom-4 left-0 animate-[drive_2.4s_ease-in-out_forwards]">
            <svg width="150" height="66" viewBox="0 0 150 66" fill="none" aria-hidden="true">
              {/* body */}
              <path
                d="M8 46c0-9 3-13 9-15l16-13c4-3 8-4 13-4h44c6 0 10 2 14 6l14 13c8 2 24 4 24 13v6c0 3-2 5-5 5H13c-3 0-5-2-5-5v-6z"
                fill="#ffffff"
              />
              {/* windows */}
              <path d="M40 20h28v14H26l14-14z" fill="oklch(0.35 0.09 152)" />
              <path d="M76 20h16l14 14H76V20z" fill="oklch(0.35 0.09 152)" />
              {/* N badge on the door */}
              <circle cx="60" cy="44" r="10" fill="oklch(0.55 0.17 152)" />
              <text
                x="60"
                y="49"
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fill="#ffffff"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                N
              </text>
              {/* wheels */}
              <circle cx="34" cy="57" r="8" fill="oklch(0.2 0.02 150)" />
              <circle cx="34" cy="57" r="3" fill="#ffffff" />
              <circle cx="112" cy="57" r="8" fill="oklch(0.2 0.02 150)" />
              <circle cx="112" cy="57" r="3" fill="#ffffff" />
            </svg>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center">
        <div className="h-1 w-24 overflow-hidden rounded-full bg-white/30">
          <div className="h-full w-full origin-left animate-[shrink_1.8s_linear_forwards] bg-white" />
        </div>
      </div>
    </div>
  );
}
