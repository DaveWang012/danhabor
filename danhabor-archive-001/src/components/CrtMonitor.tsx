import type { CSSProperties, RefObject } from "react";
import type { Tape } from "../data/tapes";

interface CrtMonitorProps {
  tape: Tape;
  powerOn: boolean;
  inserted: boolean;
  inserting: boolean;
  playing: boolean;
  tracking: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  archiveTime: string;
}

export function CrtMonitor({
  tape,
  powerOn,
  inserted,
  inserting,
  playing,
  tracking,
  videoRef,
  archiveTime,
}: CrtMonitorProps) {
  return (
    <section
      className={`crt-shell ${powerOn ? "is-on" : "is-off"} ${
        tracking ? "is-tracking" : ""
      } ${inserting ? "is-loading" : ""}`}
      aria-label="CRT 监视器"
    >
      <div className="crt-top-label">DNYTV1 INTERNAL ARCHIVE MONITOR</div>
      <div className="crt-glass">
        <video
          ref={videoRef}
          className="archive-video"
          src={tape.video}
          poster={tape.cover}
          playsInline
          controls={false}
          onPause={() => undefined}
        />
        <div className="cover-fallback" aria-hidden="true">
          <div className="rain" />
          <div className="skyline">
            {Array.from({ length: 18 }).map((_, index) => (
              <i key={index} style={{ "--i": index } as CSSProperties} />
            ))}
          </div>
          <div className="harbor-reflection" />
          <div className="investigators">
            <span />
            <span />
          </div>
          <div className="police-car" />
          <div className="helicopter" />
        </div>

        {powerOn && (
          <>
            <div className="screen-osd left">
              CAM-01
              <br />
              CITY: DANHARBOR
              <br />
              DATE: 20XX.XX.XX
              <br />
              TIME: {archiveTime}
            </div>
            <div className="screen-osd right">
              {playing ? "ARCHIVE PLAYBACK" : "REC"} <b>●</b>
            </div>
          </>
        )}

        {tracking && (
          <div className="tracking-card">
            <strong>TRACKING</strong>
            <span>PLEASE STAND BY</span>
          </div>
        )}

        {!powerOn && <div className="power-line" />}
        {inserted && !playing && !tracking && powerOn && (
          <div className="paused-stamp">PAUSED ARCHIVE SIGNAL</div>
        )}
      </div>
    </section>
  );
}
