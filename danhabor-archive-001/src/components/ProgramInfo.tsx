import type { Tape } from "../data/tapes";

interface ProgramInfoProps {
  tape: Tape;
  progress: number;
  hasPlayed: boolean;
}

export function ProgramInfo({ tape, progress, hasPlayed }: ProgramInfoProps) {
  return (
    <aside className="program-panel">
      <p className="section-kicker">节目档案 / PROGRAM FILE</p>
      <h2>
        {tape.labelTitle} <em>{tape.id}</em>
      </h2>
      <dl>
        <div>
          <dt>类型：</dt>
          <dd>{tape.type}</dd>
        </div>
        <div>
          <dt>集数：</dt>
          <dd>{tape.episode}</dd>
        </div>
      </dl>

      <p className="section-kicker">节目简介 / SYNOPSIS</p>
      <div className="synopsis">
        {tape.synopsis.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <button className="paper-button" type="button">
        查看完整档案 ▶
      </button>

      <div className="play-history">
        <p className="section-kicker">播放记录 / PLAY HISTORY</p>
        {hasPlayed ? (
          <>
            <span>最近播放：刚刚</span>
            <span>播放进度：{Math.round(progress)}%</span>
            <i style={{ width: `${Math.max(4, progress)}%` }} />
          </>
        ) : (
          <span>暂无播放记录</span>
        )}
      </div>
    </aside>
  );
}
