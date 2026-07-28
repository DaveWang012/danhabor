import { useEffect, useMemo, useRef, useState } from "react";
import { archivePanels, type ArchivePanelId, tapes } from "../data/tapes";
import { ArchivePanel } from "./ArchivePanel";
import { BottomNavigation } from "./BottomNavigation";
import { CrtMonitor } from "./CrtMonitor";
import { MechanicalControls } from "./MechanicalControls";
import { ProductionInfo } from "./ProductionInfo";
import { ProgramInfo } from "./ProgramInfo";
import { TapeCassette } from "./TapeCassette";
import { TapeDeck } from "./TapeDeck";
import { TapeStack } from "./TapeStack";

type Toast = { id: number; message: string };

export function ArchiveRoom() {
  const mainTape = tapes[0];
  const sideTapes = useMemo(
    () => ({
      left: tapes.slice(1, 4),
      right: tapes.slice(4, 7),
    }),
    [],
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressTimer = useRef<number | null>(null);
  const [time, setTime] = useState(new Date());
  const [powerOn, setPowerOn] = useState(true);
  const [inserted, setInserted] = useState(false);
  const [inserting, setInserting] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activePanel, setActivePanel] = useState<ArchivePanelId | null>(null);
  const [showProductionOverlay, setShowProductionOverlay] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    const tick = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!playing) {
      if (progressTimer.current) {
        window.clearInterval(progressTimer.current);
        progressTimer.current = null;
      }
      return;
    }

    progressTimer.current = window.setInterval(() => {
      const video = videoRef.current;
      if (video?.duration && Number.isFinite(video.duration)) {
        setProgress(Math.min(100, (video.currentTime / video.duration) * 100));
      } else {
        setProgress((value) => (value >= 98 ? 98 : value + 0.6));
      }
    }, 700);

    return () => {
      if (progressTimer.current) {
        window.clearInterval(progressTimer.current);
        progressTimer.current = null;
      }
    };
  }, [playing]);

  const archiveTime = "21:47:" + String(time.getSeconds()).padStart(2, "0");

  const notify = (message: string) => {
    const id = Date.now();
    setToast({ id, message });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 2300);
  };

  const playVideo = async () => {
    setPowerOn(true);
    setPlaying(true);
    const video = videoRef.current;
    if (!video) return;

    try {
      await video.play();
    } catch {
      setPlaying(true);
    }
  };

  const pauseVideo = () => {
    videoRef.current?.pause();
    setPlaying(false);
  };

  const insertTape = () => {
    if (inserting) return;
    if (inserted) {
      void playVideo();
      return;
    }

    setPowerOn(true);
    setInserting(true);
    setTracking(false);

    window.setTimeout(() => {
      setTracking(true);
    }, 900);

    window.setTimeout(() => {
      setInserted(true);
      setProgress(0);
    }, 1050);

    window.setTimeout(() => {
      setTracking(false);
      setInserting(false);
      void playVideo();
    }, 1850);
  };

  const handleControl = (control: string) => {
    const video = videoRef.current;

    if (control === "POWER") {
      if (powerOn) {
        pauseVideo();
        setPowerOn(false);
        return;
      }
      setPowerOn(true);
      setTracking(true);
      window.setTimeout(() => setTracking(false), 850);
      return;
    }

    if (control === "EJECT") {
      pauseVideo();
      setInserted(false);
      setInserting(false);
      setTracking(false);
      setProgress(0);
      if (video) video.currentTime = 0;
      return;
    }

    if (control === "REW") {
      if (video) video.currentTime = Math.max(0, video.currentTime - 10);
      setProgress((value) => Math.max(0, value - 10));
      return;
    }

    if (control === "FF") {
      if (video?.duration) {
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
      }
      setProgress((value) => Math.min(100, value + 10));
      return;
    }

    if (control === "PLAY") {
      if (!inserted) insertTape();
      else void playVideo();
      return;
    }

    if (control === "STOP") {
      pauseVideo();
      setProgress(0);
      if (video) video.currentTime = 0;
      return;
    }

    if (control === "PAUSE") {
      pauseVideo();
      return;
    }

    if (control === "REC") {
      notify("当前档案禁止覆盖录制。");
    }
  };

  const chooseLockedTape = () => notify("该录像尚未开放调取。");

  return (
    <main className="archive-room">
      <div className="room-haze" />
      <header className="top-identity">
        <section className="station-mark" aria-label="丹芷电视台">
          <div className="torch-mark">1</div>
          <div>
            <strong>DNYTV1</strong>
            <span>丹芷电视台</span>
            <small>DANHARBOR NETWORK TELEVISION</small>
          </div>
        </section>

        <section className="program-title" aria-label="节目标题">
          <p>动画项目 / ANIMATION PROJECT</p>
          <h1>
            丹港风云录 <em>001</em>
          </h1>
          <span>AI 原生架空都市犯罪动画</span>
        </section>

        <section className="broadcast-state" aria-label="播出状态">
          <p>特别节目 / SPECIAL PROGRAM</p>
          <div>
            <strong>{playing ? "ARCHIVE PLAYBACK" : "REC"}</strong>
            <i />
          </div>
          <time>
            20XX.XX.XX
            <br />
            {archiveTime}
          </time>
        </section>
      </header>

      <section className="workbench">
        <TapeStack tapes={sideTapes.left} side="left" onSelect={chooseLockedTape} />

        <ProgramInfo tape={mainTape} progress={progress} hasPlayed={progress > 0 || inserted} />

        <section className="central-rig" aria-label="中央录像播放设备">
          <CrtMonitor
            tape={mainTape}
            powerOn={powerOn}
            inserted={inserted}
            inserting={inserting}
            playing={playing}
            tracking={tracking}
            videoRef={videoRef}
            archiveTime={archiveTime}
          />

          <TapeDeck powerOn={powerOn} inserted={inserted} inserting={inserting}>
            <TapeCassette tape={mainTape} inserted={inserted} inserting={inserting} />
            <MechanicalControls
              powerOn={powerOn}
              playing={playing}
              inserted={inserted}
              onControl={handleControl}
            />
          </TapeDeck>
        </section>

        <ProductionInfo
          playing={playing}
          onBehind={() => setShowProductionOverlay(true)}
        />

        <TapeStack tapes={sideTapes.right} side="right" onSelect={chooseLockedTape} />
      </section>

      <button
        className={`insert-command ${inserting ? "is-pressed" : ""}`}
        type="button"
        onClick={insertTape}
        aria-label="插入录像带并播放"
      >
        <strong>插入录像带</strong>
        <span>INSERT TAPE TO PLAY ▶</span>
      </button>

      <BottomNavigation
        activePanel={activePanel}
        onSelect={(panel) => setActivePanel(panel)}
      />

      {activePanel && (
        <ArchivePanel
          panel={archivePanels[activePanel]}
          onClose={() => setActivePanel(null)}
        />
      )}

      {showProductionOverlay && (
        <div className="folder-overlay" role="dialog" aria-modal="true">
          <button
            className="folder-close"
            type="button"
            onClick={() => setShowProductionOverlay(false)}
            aria-label="关闭制作花絮"
          >
            ×
          </button>
          <div className="folder-paper">
            <p className="section-kicker">制作花絮预览 / PRODUCTION PROCESS</p>
            <h2>丹港风云录 001 制作资料页</h2>
            <div className="process-grid">
              <article>
                <span>01</span>
                <h3>手绘草图</h3>
                <p>角色轮廓、制服比例与丹港警务处视觉基调。</p>
              </article>
              <article>
                <span>02</span>
                <h3>AI 静态设定</h3>
                <p>城市雨夜、港口结构、旧电视新闻质感的画面测试。</p>
              </article>
              <article>
                <span>03</span>
                <h3>最终影片镜头</h3>
                <p>关键镜头生成、配乐、音效、字幕与剪辑合成。</p>
              </article>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast.message}</div>}
    </main>
  );
}
