import { Compass, Play, Sparkles } from 'lucide-react';

type MainHeroProps = {
  onUserGesture: () => void;
};

export default function MainHero({ onUserGesture }: MainHeroProps) {
  return (
    <><section className="bgc-hero" aria-labelledby="bgc-title">
      <p>배움이 모험이 되는 곳 <Sparkles aria-hidden="true" size={18} /></p>
      <h1 id="bgc-title"><span><b>구</b><b>글</b><b>러</b>의 여정을</span><span><em>시작</em>해볼까요?</span></h1>
      <p className="bgc-description">호기심을 가이드 삼아 배우고, 만들고, 성장하며<br />세상에 긍정적인 변화를 만들어요.</p>
      <div className="bgc-actions">
        <button type="button" className="bgc-primary" onClick={onUserGesture}><Compass aria-hidden="true" size={22} />새로운 여정 시작하기</button>
        <button type="button" className="bgc-secondary" onClick={onUserGesture}><Play aria-hidden="true" size={21} fill="currentColor" />이어하기</button>
      </div>
      <button type="button" className="bgc-link">여정이란? ›</button>
    </section><aside className="bgc-guide-bubble">안녕, 탐험가!<br />나는 구글러 길잡이<br />루나야. 함께 놀며<br />배워보자!</aside></>
  );
}
