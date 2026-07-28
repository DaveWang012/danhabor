import type { Tape } from "../data/tapes";

interface TapeCassetteProps {
  tape: Tape;
  inserted?: boolean;
  inserting?: boolean;
  small?: boolean;
  onClick?: () => void;
}

export function TapeCassette({
  tape,
  inserted = false,
  inserting = false,
  small = false,
  onClick,
}: TapeCassetteProps) {
  return (
    <button
      className={`cassette ${small ? "is-small" : ""} ${inserted ? "is-inserted" : ""} ${
        inserting ? "is-inserting" : ""
      }`}
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-label={tape.title}
    >
      <span className="cassette-window left" />
      <span className="cassette-window right" />
      <span className="cassette-label">
        <small>DNYTV1</small>
        <b>{tape.tapeNo}</b>
        <strong>{tape.labelTitle}</strong>
        <em>{tape.id}</em>
        <i>U-matic<br />SP</i>
        <span className="barcode" />
      </span>
    </button>
  );
}
