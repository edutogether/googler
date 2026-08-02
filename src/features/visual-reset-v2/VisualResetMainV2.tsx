import { useState } from 'react';
import MainBackgroundArtwork from './MainBackgroundArtwork';
import MainHeader from './MainHeader';
import MainHero from './MainHero';
import MainSummaryCards from './MainSummaryCards';
import type { MainNavId } from './mainVisualData';
import useMainBgm from './useMainBgm';
import './visualResetMainV2.css';
import './visualResetMainCanonical.css';
import MainAudioBar from './MainAudioBar';

export default function VisualResetMainV2() {
  const [activeTab, setActiveTab] = useState<MainNavId>('explore');
  const [effectsOn, setEffectsOn] = useState(true);
  const { isPlaying, registerUserGesture, toggleBgm } = useMainBgm();

  return (
    <main className="bgc-shell">
        <MainBackgroundArtwork />
        <MainHeader activeTab={activeTab} onTabChange={setActiveTab} onUserGesture={registerUserGesture} />
        <MainHero onUserGesture={registerUserGesture} />
        <MainSummaryCards />
        <MainAudioBar bgmPlaying={isPlaying} effectsOn={effectsOn} onBgmToggle={toggleBgm} onEffectsChange={() => setEffectsOn((value) => !value)} />
    </main>
  );
}
