import type { ReactNode } from "react";

interface TapeDeckProps {
  children: ReactNode;
  powerOn: boolean;
  inserted: boolean;
  inserting: boolean;
}

export function TapeDeck({ children, powerOn, inserted, inserting }: TapeDeckProps) {
  return (
    <section
      className={`tape-deck ${powerOn ? "has-power" : ""} ${
        inserted ? "has-tape" : ""
      } ${inserting ? "is-accepting" : ""}`}
      aria-label="U-matic 录像机"
    >
      <div className="slot-cover">
        <span>U-MATIC CASSETTE SLOT</span>
      </div>
      {children}
    </section>
  );
}
