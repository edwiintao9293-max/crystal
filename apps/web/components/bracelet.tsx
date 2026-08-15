"use client";

import type { Crystal } from "../lib/data";

export function Bracelet({ primary, secondary, slow = false }: { primary: Crystal; secondary?: Crystal; slow?: boolean }) {
  const count = 22;
  return (
    <div className="bracelet-stage" aria-label="手串展示">
      <div className={`bracelet ${slow ? "bracelet-slow" : ""}`}>
        <span className="bracelet-line" />
        {Array.from({ length: count }, (_, index) => {
          const useSecondary = secondary && (index % 4 === 2 || index % 7 === 4);
          const crystal = useSecondary ? secondary : primary;
          return (
            <img
              alt=""
              className="bead"
              key={`${crystal.id}-${index}`}
              src={crystal.image}
              style={{ "--i": index, "--n": count } as React.CSSProperties}
            />
          );
        })}
      </div>
    </div>
  );
}
