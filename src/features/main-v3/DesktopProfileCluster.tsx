import { useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { WorldIcon } from './WorldIcons';
import { asset } from './mainWorldContent';
import { MiniVolumePanel } from './MiniVolumePanel';

export function DesktopProfileCluster({
  bgmEnabled,
  isPlaying,
  volume,
  onToggleBgm,
  onVolumeChange,
  onProfile,
}: {
  bgmEnabled: boolean;
  isPlaying: boolean;
  volume: number;
  onToggleBgm: () => void;
  onVolumeChange: (volume: number) => void;
  onProfile: () => void;
}) {
  const [volumeTrayDismissed, setVolumeTrayDismissed] = useState(false);
  const dismissVolumeTray = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') return;
    event.preventDefault(); setVolumeTrayDismissed(true);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  };
  return <section className="mw3-desktop-profile" aria-label="프로필과 오디오 컨트롤">
    <div className="mw3-mini-audio" aria-label="BGM 미니 컨트롤">
      <div className="mw3-mini-bgm-control" data-volume-tray-dismissed={volumeTrayDismissed} onMouseEnter={() => setVolumeTrayDismissed(false)} onMouseLeave={() => setVolumeTrayDismissed(true)} onFocusCapture={() => setVolumeTrayDismissed(false)} onKeyDown={dismissVolumeTray}>
        <button type="button" className={`mw3-mini-bgm ${bgmEnabled ? 'is-enabled' : ''} ${isPlaying ? 'is-playing' : ''}`} aria-label={bgmEnabled ? 'BGM 끄기' : 'BGM 켜기'} onClick={onToggleBgm}><WorldIcon name="music" /></button>
        <MiniVolumePanel enabled={bgmEnabled} volume={volume} onVolumeChange={onVolumeChange} />
      </div>
      <span className="mw3-mini-song" aria-label="Be a Googler - 달빛 항해자의 마을"><span className="mw3-mini-song-track" aria-hidden="true"><span>Be a Googler - 달빛 항해자의 마을</span><span>Be a Googler - 달빛 항해자의 마을</span></span></span>
      <span className={`mw3-mini-equalizer ${isPlaying ? 'is-playing' : ''}`} aria-label={isPlaying ? '움직이는 이퀄라이저' : '정지된 이퀄라이저'}>{Array.from({ length: 6 }, (_, index) => <i key={index} />)}</span>
    </div>
    <span className="mw3-divider" aria-hidden="true" />
    <button className="mw3-profile-button" type="button" aria-label="호기심 많은 구글러 프로필 보기" onClick={onProfile}><img src={asset('visual-reset/main/assets/profile-avatar.png')} alt="" /><span className="mw3-identity"><small>Lv. 7 탐험가</small><strong>호기심 많은 구글러</strong></span><WorldIcon name="chevron" /></button>
    <span className="mw3-divider" aria-hidden="true" />
    <div className="mw3-desktop-notification">
      <button className="mw3-notification" type="button" aria-label="알림 보기" aria-haspopup="dialog"><WorldIcon name="bell" /><span>3</span></button>
      <div className="mw3-notification-popover" role="dialog" aria-label="새 알림">
        <div className="mw3-notification-popover-heading"><strong>새 소식</strong><button type="button" aria-label="알림 더보기">•••</button></div>
        <ul><li><i>✦</i><span><b>오늘의 여정이 열렸어요</b><small>별빛 항로가 탐험가를 기다려요.</small></span></li><li><i>◈</i><span><b>데이터 섬 탐험이 이어집니다</b><small>다음 지도가 은은히 빛나고 있어요.</small></span></li><li><i>✧</i><span><b>새로운 배지를 확인해보세요</b><small>보관함에 작은 선물이 도착했어요.</small></span></li></ul>
        <button className="mw3-notification-more" type="button">전체 보기 <span>›</span></button>
      </div>
    </div>
  </section>;
}
