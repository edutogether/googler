import { Bell, ChevronDown } from 'lucide-react';
import { MAIN_NAV_ITEMS, type MainNavId } from './mainVisualData';

type MainHeaderProps = {
  activeTab: MainNavId;
  onTabChange: (tab: MainNavId) => void;
  onUserGesture: () => void;
};

export default function MainHeader({ activeTab, onTabChange, onUserGesture }: MainHeaderProps) {
  return (
    <><header className="bgc-nav-capsule" aria-label="메인 내비게이션">
      <div className="bgc-brand">
        <img src={`${import.meta.env.BASE_URL}visual-reset/main/be-a-googler-brand.png`} alt="Be a Googler" />
      </div>
      <nav className="bgc-nav" aria-label="주요 메뉴">
        {MAIN_NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
              className={`bgc-nav-button${activeTab === id ? ' is-active' : ''}`}
            aria-current={activeTab === id ? 'page' : undefined}
            onClick={() => {
              onUserGesture();
              onTabChange(id);
            }}
          >
            <Icon aria-hidden="true" size={20} strokeWidth={2.1} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      </header><section className="bgc-profile-capsule" aria-label="프로필">
      <button type="button" className="bgc-notification" aria-label="알림 보기">
        <Bell aria-hidden="true" size={24} /><span aria-label="새 알림 3개">3</span>
      </button>
      <button type="button" className="bgc-profile" aria-label="호기심 많은 구글러 프로필 보기">
        <img src={`${import.meta.env.BASE_URL}visual-reset/main/assets/profile-avatar.png`} alt="" />
        <span><strong>호기심 많은 구글러</strong><small>Lv. 7 탐험가</small></span>
        <ChevronDown aria-hidden="true" size={18} />
      </button>
    </section></>
  );
}
