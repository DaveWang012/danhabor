import type { Tape } from "../data/tapes";
import { TapeCassette } from "./TapeCassette";

interface TapeStackProps {
  tapes: Tape[];
  side: "left" | "right";
  onSelect: () => void;
}

export function TapeStack({ tapes, side, onSelect }: TapeStackProps) {
  return (
    <aside className={`tape-stack ${side}`} aria-label={`${side} 侧录像带堆`}>
      {tapes.map((tape) => (
        <TapeCassette key={tape.id} tape={tape} small onClick={onSelect} />
      ))}
    </aside>
  );
}
