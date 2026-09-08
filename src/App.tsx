import MainWorldV3 from './features/main-v3/MainWorldV3';

// 부트 스플래시는 index.html의 정적 마크업이고, 사라지는 일은 main.tsx가 부르는
// installSplash()가 맡는다 — 여기서는 아무것도 하지 않는다.
export default function App() {
  return <MainWorldV3 />;
}
