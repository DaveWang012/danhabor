const controls = [
  { id: "POWER", label: "POWER", symbol: "" },
  { id: "EJECT", label: "EJECT", symbol: "⏏" },
  { id: "REW", label: "REW", symbol: "◀◀" },
  { id: "PLAY", label: "PLAY", symbol: "▶" },
  { id: "FF", label: "FF", symbol: "▶▶" },
  { id: "STOP", label: "STOP", symbol: "■" },
  { id: "PAUSE", label: "PAUSE", symbol: "Ⅱ" },
  { id: "REC", label: "REC", symbol: "●" },
];

interface MechanicalControlsProps {
  powerOn: boolean;
  playing: boolean;
  inserted: boolean;
  onControl: (control: string) => void;
}

export function MechanicalControls({
  powerOn,
  playing,
  inserted,
  onControl,
}: MechanicalControlsProps) {
  return (
    <div className="mechanical-controls" aria-label="录像机控制键">
      <div className="power-bank">
        <button
          className={`power-switch ${powerOn ? "is-on" : ""}`}
          type="button"
          onClick={() => onControl("POWER")}
          aria-label="POWER"
        >
          <span />
        </button>
        <i className="status-lamp" />
      </div>

      <div className="button-bank">
        {controls.slice(1).map((control) => (
          <button
            key={control.id}
            className={`deck-button ${control.id.toLowerCase()} ${
              control.id === "PLAY" && playing ? "is-active" : ""
            } ${control.id !== "EJECT" && !inserted ? "is-waiting" : ""}`}
            type="button"
            onClick={() => onControl(control.id)}
            aria-label={control.label}
          >
            <span>{control.label}</span>
            <strong>{control.symbol}</strong>
          </button>
        ))}
      </div>

      <div className="toggle-cluster" aria-hidden="true">
        <label>
          DOLBY NR
          <span><i /></span>
        </label>
        <label>
          TIMER REC
          <span><i /></span>
        </label>
      </div>
    </div>
  );
}
