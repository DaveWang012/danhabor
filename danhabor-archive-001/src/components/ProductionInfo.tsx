interface ProductionInfoProps {
  playing: boolean;
  onBehind: () => void;
}

export function ProductionInfo({ playing, onBehind }: ProductionInfoProps) {
  return (
    <aside className="production-column">
      <div className={`audio-meters ${playing ? "is-playing" : ""}`} aria-label="音频电平表">
        <div className="meter">
          <span />
          <i />
        </div>
        <div className="meter">
          <span />
          <i />
        </div>
        <small>AUDIO LEVEL</small>
      </div>

      <div className="details-panel">
        <p className="section-kicker">节目详情 / DETAILS</p>
        <dl>
          <div><dt>导演</dt><dd>王海街</dd></div>
          <div><dt>编剧</dt><dd>王海街</dd></div>
          <div><dt>世界观与剧本</dt><dd>独立原创</dd></div>
          <div><dt>角色与场景设计</dt><dd>个人手稿 + Gemini / ChatGPT 辅助</dd></div>
          <div><dt>视频生成</dt><dd>Seedance 2.0 / 即梦 / UpDream</dd></div>
          <div><dt>音乐</dt><dd>Suno</dd></div>
          <div><dt>配音、音效、字幕与剪辑</dt><dd>独立完成</dd></div>
          <div><dt>制作周期</dt><dd>约 5 天，每天 4-6 小时</dd></div>
        </dl>
        <button className="paper-button" type="button" onClick={onBehind}>
          制作花絮预览 ▶
        </button>
      </div>

      <div className="device-panel" aria-hidden="true">
        <span>TRACKING</span>
        <div className="slider"><i /></div>
        <span>VIDEO LEVEL</span>
        <div className="dial" />
        <strong>DNYTV1</strong>
        <small>BROADCAST SYSTEM</small>
      </div>
    </aside>
  );
}
