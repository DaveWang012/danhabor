# 丹港风云录 001

DNYTV1 丹芷电视台内部影像档案播放系统。项目使用 React、TypeScript、Vite 和原生 CSS 实现，围绕 TAPE 001 构建一套可交互的东亚电视台影像档案工作台。

## 运行

```bash
npm install
npm run dev
```

## 结构

```text
src/
  components/
    ArchiveRoom.tsx
    CrtMonitor.tsx
    TapeDeck.tsx
    TapeCassette.tsx
    ProgramInfo.tsx
    ProductionInfo.tsx
    TapeStack.tsx
    MechanicalControls.tsx
    BottomNavigation.tsx
    ArchivePanel.tsx
  data/
    tapes.ts
  styles/
    global.css
  App.tsx
```

## 资源预留

- `public/assets/danhabor-001.mp4`
- `public/assets/danhabor-001-cover.jpg`

当前已提供一张本地生成的封面帧。替换同名文件即可更新 CRT 初始画面；放入同名视频后，插入录像带和播放控制会自动使用视频资源。
