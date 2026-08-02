import { Music2, Pause, Play, Speaker, Volume2 } from 'lucide-react';

type MainAudioBarProps = {
  bgmPlaying: boolean;
  effectsOn: boolean;
  onBgmToggle: () => void;
  onEffectsChange: () => void;
};

export default function MainAudioBar({ bgmPlaying, effectsOn, onBgmToggle, onEffectsChange }: MainAudioBarProps) {
  return (
    <section className="vr2-bgm" aria-label="BGM 컨트롤">
      <div className="vr2-bgm-track">
        <Music2 aria-hidden="true" size={21} />
        <span className="vr2-bgm-label">BGM</span>
        <span className={`vr2-bgm-title${bgmPlaying ? ' is-playing' : ''}`}><span>달빛 항해자의 마을</span></span>
        <button type="button" className={`vr2-bgm-play${bgmPlaying ? ' is-playing' : ''}`} aria-label={bgmPlaying ? 'BGM 미리보기 일시정지' : 'BGM 미리보기 재생'} onClick={onBgmToggle}>
          {bgmPlaying ? <Pause aria-hidden="true" size={18} fill="currentColor" /> : <Play aria-hidden="true" size={18} fill="currentColor" />}
        </button>
        <span className={`vr2-equalizer${bgmPlaying ? ' is-playing' : ''}`} aria-label={bgmPlaying ? '움직이는 이퀄라이저' : '정지된 이퀄라이저'}><i /><i /><i /><i /></span>
      </div>
      <div className="vr2-effects">
        {effectsOn ? <Volume2 aria-hidden="true" size={21} /> : <Speaker aria-hidden="true" size={21} />}
        <span>{effectsOn ? '효과음 켜짐' : '효과음 꺼짐'}</span>
        <button type="button" role="switch" aria-checked={effectsOn} aria-label="효과음 켜기 또는 끄기" className={`vr2-sound-toggle${effectsOn ? ' is-on' : ''}`} onClick={onEffectsChange}><span /></button>
      </div>
      <span className="sr-only">재생 버튼을 누르면 실제 배경 음악을 재생합니다.</span>
    </section>
  );
}
