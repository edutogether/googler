/**
 * 첫 진입 스플래시를 화면에서 걷어낸다.
 *
 * 마크업은 index.html에 정적으로 두고(리액트가 그리면 번들 로드 전까지 빈 화면이
 * 잠깐 보인다), 사라지는 타이밍은 CSS 애니메이션이 잡는다(문서가 그려지는 순간부터
 * 흐르므로 번들 로드 시간에 밀리지 않는다). 여기서 하는 일은 두 가지뿐이다 —
 * 애니메이션이 끝난 노드를 지우는 것, 그리고 그 시점에 page load가 아직이면
 * 끝날 때까지 유지를 연장하는 것. **시간을 재지 않고 "끝났는가"만 판정한다.**
 */

/** load가 끝내 오지 않아도 스플래시에 갇히지 않게 하는 상한. 네비게이션 시작 기준. */
const MAX_VISIBLE_MS = 4000;

export function installSplash(doc: Document = document): void {
  const splash = doc.getElementById('splash');
  const win = doc.defaultView;
  if (!splash || !win) return;

  const remove = () => splash.remove();

  const leave = () => {
    if (!splash.isConnected) return;
    splash.classList.remove('is-held');
    splash.classList.add('is-leaving');
    splash.addEventListener('animationend', remove, { once: true });
  };

  const holdUntilLoaded = () => {
    if (doc.readyState === 'complete') { remove(); return; }
    splash.classList.add('is-held');
    let cap = 0;
    const release = () => {
      win.clearTimeout(cap);
      win.removeEventListener('load', release);
      leave();
    };
    win.addEventListener('load', release, { once: true });
    cap = win.setTimeout(release, Math.max(0, MAX_VISIBLE_MS - win.performance.now()));
  };

  splash.addEventListener('animationend', (event) => {
    if ((event as AnimationEvent).animationName === 'splashOut') holdUntilLoaded();
  });

  // 번들이 늦게 실행돼 애니메이션이 이미 끝났을 수도 있다 — 그 경우 남은 노드만
  // 지운다. **여기서 유지 연장으로 보내면 안 된다**: 이미 화면에서 사라진(opacity 0)
  // 스플래시가 .is-held로 다시 나타났다가 페이드하는 깜빡임이 생긴다(3G급 실측에서
  // 확인). 유지 연장은 애니메이션이 "방금" 끝난 순간에만 의미가 있다.
  // 목록이 비어 있는 경우(스타일시트가 아직/영영 안 붙은 상태)는 "끝났다"로 보지
  // 않는다. 그렇게 보면 스플래시가 첫 프레임에 사라진다.
  const animations = typeof splash.getAnimations === 'function' ? splash.getAnimations() : [];
  if (animations.length > 0 && animations.every((animation) => animation.playState === 'finished')) {
    remove();
  }
}
