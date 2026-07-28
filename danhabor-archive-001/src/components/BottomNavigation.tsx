import type { ArchivePanelId } from "../data/tapes";

const navItems: { id: ArchivePanelId; label: string; title: string }[] = [
  { id: "case", title: "CASE FILE", label: "案件档案" },
  { id: "character", title: "CHARACTER", label: "角色图鉴" },
  { id: "world", title: "WORLD", label: "世界观设定" },
  { id: "behind", title: "BEHIND", label: "幕后制作" },
];

interface BottomNavigationProps {
  activePanel: ArchivePanelId | null;
  onSelect: (panel: ArchivePanelId) => void;
}

export function BottomNavigation({ activePanel, onSelect }: BottomNavigationProps) {
  return (
    <nav className="bottom-navigation" aria-label="档案分类导航">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={activePanel === item.id ? "is-active" : ""}
          type="button"
          onClick={() => onSelect(item.id)}
        >
          <strong>{item.title}</strong>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
