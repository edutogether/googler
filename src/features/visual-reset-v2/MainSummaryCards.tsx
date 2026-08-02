import { Award, ChevronRight, Compass, Map } from 'lucide-react';

function Progress({ value }: { value: number }) {
  return <span className="visual-main-progress" aria-label={`진행률 ${value}%`}><span style={{ width: `${value}%` }} /></span>;
}

export default function MainSummaryCards() {
  return (
    <section className="bgc-summary-grid" aria-label="여정 요약">
      <button type="button" className="visual-main-card visual-main-card--journey">
        <span className="visual-main-card__eyebrow"><Compass aria-hidden="true" size={17} />나의 여정</span>
        <span className="visual-main-journey-card__body">
          <img className="bgc-card-image" src={`${import.meta.env.BASE_URL}visual-reset/main/assets/journey-avatar-medallion.png`} alt="여정 아바타" />
          <span className="visual-main-card__content"><strong>Lv. 7 탐험가</strong><span className="visual-main-card__xp">320 / 560 XP</span><Progress value={57} /><small>다음 레벨까지 240 XP 남음</small></span>
        </span>
      </button>
      <button type="button" className="visual-main-card visual-main-card--continue">
        <span className="visual-main-card__eyebrow"><Map aria-hidden="true" size={17} />이어하기</span>
        <span className="visual-main-continue-card__body">
          <img className="bgc-island" src={`${import.meta.env.BASE_URL}visual-reset/main/assets/data-island-thumbnail.png`} alt="데이터 섬" />
          <span className="visual-main-card__content"><strong>데이터 섬의 비밀</strong><small>3. 데이터를 시각화해요</small><span className="visual-main-continue-row"><b>65%</b><span>계속하기 <ChevronRight aria-hidden="true" size={15} /></span></span><Progress value={65} /></span>
        </span>
      </button>
      <button type="button" className="visual-main-card visual-main-card--badges">
        <span className="visual-main-card__eyebrow"><Award aria-hidden="true" size={17} />최근 획득 배지</span>
        <span className="visual-main-badges" aria-label="최근 획득 배지 3개와 추가 12개">
          <img src={`${import.meta.env.BASE_URL}visual-reset/main/assets/badge-blue.png`} alt="파란 배지" />
          <img src={`${import.meta.env.BASE_URL}visual-reset/main/assets/badge-gold.png`} alt="금색 배지" />
          <img src={`${import.meta.env.BASE_URL}visual-reset/main/assets/badge-silver.png`} alt="은색 배지" />
          <span className="visual-main-badge-count">+12</span>
        </span>
      </button>
    </section>
  );
}
