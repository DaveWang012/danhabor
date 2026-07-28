interface ArchivePanelProps {
  panel: {
    title: string;
    subtitle: string;
    body: readonly string[];
  };
  onClose: () => void;
}

export function ArchivePanel({ panel, onClose }: ArchivePanelProps) {
  return (
    <section className="archive-drawer" role="dialog" aria-modal="true">
      <button className="drawer-close" type="button" onClick={onClose} aria-label="关闭档案">
        ×
      </button>
      <p className="section-kicker">DNYTV1 SUPPLEMENTAL FILE</p>
      <h2>
        {panel.title}
        <span>{panel.subtitle}</span>
      </h2>
      <div>
        {panel.body.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </section>
  );
}
