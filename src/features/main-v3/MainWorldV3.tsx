import type { CSSProperties } from 'react';
import { WorldIcon } from './WorldIcons';
import './MainWorldV3.css';
import { asset, base, desktopBadges, desktopScenes, DESKTOP_GUIDE_MESSAGE, MAIN_V3_BGM_STORAGE_KEY, MAIN_V3_SFX_STORAGE_KEY, navigation } from './mainWorldContent';
import { playUiSound } from './uiSound';
import { useWorldAudio } from './useWorldAudio';
import { useViewportBreakpoints } from './useViewportBreakpoints';
import { useScenePreloader } from './useScenePreloader';
import { useAnnouncements } from './useAnnouncements';
import { useDesktopGuideBubble } from './useDesktopGuideBubble';
import { useParallaxTilt } from './useParallaxTilt';
import { useSceneNavigation } from './useSceneNavigation';
import { DesktopProfileCluster } from './DesktopProfileCluster';

export { MAIN_V3_BGM_STORAGE_KEY, MAIN_V3_SFX_STORAGE_KEY };

export default function MainWorldV3() {
  return <MainWorldV3Scene />;
}

function MainWorldV3Scene() {
  const { bgmEnabled, isPlaying, volume, toggle, setVolume } = useWorldAudio();
  const { isMobile, hasDesktopAmbient, hasDesktopControls } = useViewportBreakpoints();
  const { preloadScene } = useScenePreloader();
  const { sfxOn, toast, announce, toggleSfx } = useAnnouncements();
  const { guideText, guideVisible } = useDesktopGuideBubble();
  const { shellRef, handlePointerMove, handlePointerLeave } = useParallaxTilt();
  const {
    activeNav,
    setActiveNav,
    transitionPhase,
    constructionVisible,
    setConstructionVisible,
    desktopScene,
    showsMainWorld,
    revealConstruction,
    activateNavigation,
  } = useSceneNavigation({ isMobile, sfxOn, announce, preloadScene });

  const journeyCopy = <span className="mw3-card-copy"><strong>Lv. 7 탐험가</strong><small>320 / 560 XP</small><span className="mw3-progress mw3-progress--gold"><i /></span><small>다음 레벨까지 240 XP 남음</small></span>;
  return <main className={`mw3-shell${desktopScene ? ` mw3-shell--${desktopScene.name}` : ''}${desktopScene && !constructionVisible ? ' mw3-shell--awaiting-tap' : ''}`} data-transition={transitionPhase} ref={shellRef} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} onClick={revealConstruction}>
    {transitionPhase !== 'idle' && <div className={`mw3-transition-veil mw3-transition-veil--${transitionPhase}`} aria-hidden="true"><img className="mw3-transition-backdrop" src={asset(isMobile ? 'visual-reset/main/be-a-googler-loading-mobile.webp' : 'visual-reset/main/be-a-googler-loading-desktop.webp')} alt="" /><div className="mw3-transition-loader"><div className="mw3-transition-dots"><i /><i /><i /></div><div className="mw3-transition-track"><i /></div><span>다음 여정으로 이동 중…</span></div><div className="mw3-transition-flash" /></div>}
    <img className="mw3-background" src={asset(isMobile ? 'visual-reset/main/be-a-googler-main-mobile-opt.webp' : 'visual-reset/main/be-a-googler-main-desktop-16x9-opt.webp')} alt="" aria-hidden="true" /><div className="mw3-light-field" aria-hidden="true" />
    {/* The backdrop layer is only ever visible on the desktop breakpoint
        (min-width: 1000px); rendering it on mobile still downloads the
        multi-MB desktop scene even though CSS hides it, so it is left out
        of the tree entirely there. */}
    {desktopScene && <>{!isMobile && <img className="mw3-scene-backdrop" src={asset(desktopScene.asset)} alt="" aria-hidden="true" />}<img className={`mw3-scene mw3-${desktopScene.name}-scene`} src={asset(isMobile ? desktopScene.mobileAsset : desktopScene.asset)} alt="" aria-hidden="true" /><div className="mw3-scene-veil" aria-hidden="true" /></>}
    {desktopScene && !constructionVisible && <button type="button" className="mw3-construction-reveal" onClick={() => setConstructionVisible(true)}>다음 여정 안내 보기</button>}
    {showsMainWorld && isMobile && <div className="mw3-mobile-google-marks" aria-hidden="true"><span className="mw3-mobile-google-mark mw3-mobile-google-mark--character"><img src={asset('visual-reset/main/be-a-googler-brand.png')} alt="" /></span><span className="mw3-mobile-google-mark mw3-mobile-google-mark--robot"><img src={asset('visual-reset/main/be-a-googler-brand.png')} alt="" /></span></div>}
    {hasDesktopAmbient && <div className={`mw3-ambient ${isPlaying ? 'is-playing' : ''}`} aria-hidden="true"><span className="mw3-ambient-dust dust-1" /><span className="mw3-ambient-dust dust-2" /><span className="mw3-ambient-dust dust-3" /><span className="mw3-ambient-dust dust-4" /><span className="mw3-ambient-dust dust-5" /><span className="mw3-ambient-dust dust-6" /><span className="mw3-ambient-dust dust-7" /><span className="mw3-ambient-leaf leaf-1" /><span className="mw3-ambient-leaf leaf-2" /><span className="mw3-ambient-leaf leaf-3" /></div>}
    <header className="mw3-header" aria-label="메인 내비게이션">
      <div className="mw3-navigation"><a className="mw3-brand" href={base} aria-label="Be a Googler 홈으로 이동"><img src={asset('visual-reset/main/be-a-googler-brand.png')} alt="Be a Googler" /></a><span className="mw3-divider" aria-hidden="true" /><nav aria-label="주요 메뉴">{navigation.map((item) => <button type="button" key={item.id} className={activeNav === item.id ? 'is-active' : ''} aria-current={activeNav === item.id ? 'page' : undefined} onClick={(event) => { activateNavigation(item); event.currentTarget.blur(); }} onMouseEnter={() => { if (item.id in desktopScenes) preloadScene(item.id as keyof typeof desktopScenes); }} onFocus={() => { if (item.id in desktopScenes) preloadScene(item.id as keyof typeof desktopScenes); }}><WorldIcon name={isMobile ? item.mobileIcon : item.icon} /><span>{isMobile ? item.mobileLabel : item.label}</span></button>)}</nav></div>
      <section className="mw3-profile" aria-label="프로필"><button type="button" className={`mw3-mobile-bgm ${bgmEnabled ? 'is-enabled' : ''} ${isPlaying ? 'is-playing' : ''}`} aria-label={bgmEnabled ? 'BGM 끄기' : 'BGM 켜기'} onClick={() => { toggle(); playUiSound('click', sfxOn); }}><WorldIcon name="music" /></button><button className="mw3-notification" type="button" aria-label="알림 보기" onClick={() => announce('새로운 알림을 준비 중이에요.')}><WorldIcon name="bell" /><span>3</span></button><span className="mw3-divider" aria-hidden="true" /><button className="mw3-profile-button" type="button" aria-label="호기심 많은 구글러 프로필 보기" onClick={() => announce('프로필 탐험을 준비 중이에요.')}><img src={asset('visual-reset/main/assets/profile-avatar.png')} alt="" /><span className="mw3-identity"><strong>호기심 많은 구글러</strong><small>Lv. 7 탐험가</small></span><WorldIcon name="chevron" /></button></section>
      <button type="button" className="mw3-mobile-menu" aria-label="메뉴 준비 중" onClick={() => announce()}><WorldIcon name="menu" /></button>
    </header>
    {showsMainWorld && <section className="mw3-hero" aria-labelledby="mw3-title"><p className="mw3-eyebrow">배움이 모험이 되는 곳 <span>✨</span></p><h1 id="mw3-title"><span className="mw3-title-line mw3-title-line--first"><span className="mw3-word-googler"><b>G</b><b>o</b><b>o</b><b>g</b><b>l</b><b>e</b><b>r</b>{isMobile ? '의 여정을' : ' 의 여정을'}</span></span><span className="mw3-title-line mw3-title-line--second">{isMobile ? <><em>시작</em>해볼까요?</> : '시작해볼까요 ?'}</span></h1><p className="mw3-description">{isMobile ? <><span className="mw3-description-line">호기심으로 배우고 성장하며,</span><span className="mw3-description-line">세상에 긍정적인 변화를 만들어요.</span></> : <span className="mw3-description-line">호기심으로 배우고 성장하며, 세상에 긍정적인 변화를 만들어요.</span>}</p><div className="mw3-cta-row"><button type="button" className="mw3-primary-cta" onClick={() => announce('새로운 여정이 곧 열립니다.', true)}><WorldIcon name="compass" />{isMobile ? '새로운 여정' : '새로운 여정 시작하기'}</button><button type="button" className="mw3-secondary-cta" onClick={() => announce()}><WorldIcon name="play" />이어하기</button></div>{!isMobile && <button type="button" className="mw3-text-action" onClick={() => announce('여정 안내를 준비 중이에요.')}>여정이란 ? <span>›</span></button>}{!isMobile && <a className="mw3-privacy-link mw3-privacy-link--hero" href={asset('privacy.html')} target="_blank" rel="noopener">개인정보처리방침</a>}</section>}
    {desktopScene && constructionVisible && <section key={desktopScene.name} className="mw3-construction" aria-labelledby="mw3-construction-title"><span className="mw3-construction-icon" aria-hidden="true"><WorldIcon name={desktopScene.icon} /></span><p>{desktopScene.eyebrow}</p><h2 id="mw3-construction-title">새로운 여정이<br />준비되고 있어요.</h2><small>{desktopScene.detail}</small><span>구글러를 위한 새로운 모험을 열심히 만들고 있어요.<br />조금만 기다려 주세요 !</span><button type="button" onClick={(event) => { event.stopPropagation(); setActiveNav('explore'); playUiSound('click', sfxOn); }}>메인 월드로 돌아가기 <i aria-hidden="true">›</i></button></section>}
    {showsMainWorld && !isMobile && <aside className={`mw3-guide${guideVisible ? '' : ' is-cycling-out'}`} aria-label="구글러 길잡이 안내" style={{ '--mw3-guide-lines': Math.max(1, guideText.split('\n').length) } as CSSProperties}><p aria-label={DESKTOP_GUIDE_MESSAGE}><span aria-hidden="true">{guideText}</span></p></aside>}
    {hasDesktopControls && <DesktopProfileCluster bgmEnabled={bgmEnabled} isPlaying={isPlaying} volume={volume} onToggleBgm={() => { toggle(); playUiSound('click', sfxOn); }} onVolumeChange={setVolume} onProfile={() => announce('프로필 탐험을 준비 중이에요.')} />}
    {showsMainWorld && <section className="mw3-summary" aria-label="여정 요약">
      {hasDesktopAmbient ? <article className="mw3-card mw3-card--journey">
        <button type="button" className="mw3-card-click-target" aria-label="나의 여정 열기" onClick={() => announce('나의 여정을 준비 중이에요.')} />
        <span className="mw3-card-title"><WorldIcon name="compass" />나의 여정</span>
        <span className="mw3-card-content">
          <button type="button" className="mw3-avatar-frame mw3-avatar-trigger" aria-label="탐험가 프로필 안내 보기" aria-describedby="mw3-avatar-tooltip" onClick={() => announce('나의 여정을 준비 중이에요.')}><img src={asset('visual-reset/main/assets/journey-avatar-medallion.png')} alt="여정 아바타" /><span id="mw3-avatar-tooltip" className="mw3-world-tooltip mw3-avatar-tooltip" role="tooltip"><img className="mw3-tooltip-thumbnail mw3-tooltip-thumbnail--avatar" src={asset('visual-reset/main/assets/journey-avatar-medallion.png')} alt="" /><span className="mw3-tooltip-copy"><b>호기심 많은 탐험가</b><small>새로운 여정을 차근차근 만들어가고 있어요.</small></span></span></button>
          {journeyCopy}
        </span>
      </article> : <button type="button" className="mw3-card mw3-card--journey" onClick={() => announce('나의 여정을 준비 중이에요.')}>
        <span className="mw3-card-title"><WorldIcon name="compass" />나의 여정</span>
        <span className="mw3-card-content"><span className="mw3-avatar-frame"><img src={asset('visual-reset/main/assets/journey-avatar-medallion.png')} alt="여정 아바타" /></span>{journeyCopy}</span>
      </button>}
      <article className="mw3-card mw3-card--continue"><h2 className="mw3-card-title"><WorldIcon name="play" />이어하기</h2><div className="mw3-card-content"><span className="mw3-island-frame"><img src={asset('visual-reset/main/assets/data-island-thumbnail-v6-opt.webp')} alt="데이터 섬" />{hasDesktopAmbient && <span className="mw3-world-tooltip mw3-continue-tooltip" role="tooltip"><img className="mw3-tooltip-thumbnail mw3-tooltip-thumbnail--island" src={asset('visual-reset/main/assets/data-island-thumbnail-v6-opt.webp')} alt="" /><span className="mw3-tooltip-copy"><b>데이터 섬의 비밀</b><small>다음 탐험 장면을 세심하게 다듬고 있어요.</small></span></span>}</span><span className="mw3-card-copy"><strong>{isMobile ? '데이터 섬' : '데이터 섬의 비밀'}</strong><small>3. 데이터를 시각화해요</small><span className="mw3-progress mw3-progress--blue"><i /></span><b className="mw3-percent">65%</b></span><button type="button" className="mw3-resume" onClick={() => announce('데이터 섬으로 떠날 준비 중이에요.')}>계속하기</button></div></article>
      {hasDesktopAmbient ? <article className="mw3-card mw3-card--badges" aria-label="획득 배지"><span className="mw3-card-title"><WorldIcon name="badge" />획득 배지</span><span className="mw3-badge-layout"><span className="mw3-badge-row">{desktopBadges.map((badge, index) => <span className={`mw3-badge-item${index === desktopBadges.length - 1 ? ' mw3-badge-item--last' : ''}`} key={badge.asset}><button type="button" className="mw3-badge-trigger" aria-label={`${badge.name}: ${badge.lore}`}><img src={asset(`visual-reset/main/assets/${badge.asset}`)} alt="" /><small>{badge.name}</small></button><span className="mw3-badge-info" role="tooltip"><img className="mw3-tooltip-thumbnail mw3-tooltip-thumbnail--badge" src={asset(`visual-reset/main/assets/${badge.asset}`)} alt="" /><span className="mw3-tooltip-copy"><b>{badge.name}</b><small>{badge.lore}</small></span></span></span>)}<button type="button" className="mw3-badge-next" aria-label="더 많은 배지 보기" onClick={() => announce('새로운 여정을 이어가며 배지를 더 모아보세요!')}><span aria-hidden="true">›</span></button></span></span></article> : <button type="button" className="mw3-card mw3-card--badges mw3-card--compact-badges" onClick={() => announce('새로운 배지를 준비 중이에요.')}><span className="mw3-card-title"><WorldIcon name="badge" />{isMobile ? '획득 배지' : '최근 획득 배지'}</span><span className="mw3-badge-row"><span><img src={asset('visual-reset/main/assets/badge-blue-mobile-opt.webp')} alt="파란 배지" /></span><span><img src={asset('visual-reset/main/assets/badge-gold-mobile-opt.webp')} alt="금색 배지" /></span><span><img src={asset('visual-reset/main/assets/badge-silver-mobile-opt.webp')} alt="은색 배지" /></span><b aria-label="더 많은 배지">…</b></span></button>}
    </section>}
    {!isMobile && <section className="mw3-audio" aria-label="BGM 컨트롤"><div className="mw3-track"><WorldIcon name="music" /><strong>BGM</strong><span className="mw3-song">달빛 항해자의 마을</span></div><button type="button" className="mw3-audio-play" aria-label={isPlaying ? 'BGM 일시정지' : 'BGM 재생'} onClick={() => { toggle(); playUiSound('click', sfxOn); }}><WorldIcon name={isPlaying ? 'pause' : 'play'} /></button><span className={`mw3-equalizer ${isPlaying ? 'is-playing' : ''}`} aria-label={isPlaying ? '움직이는 이퀄라이저' : '정지된 이퀄라이저'}><i /><i /><i /><i /></span><div className="mw3-sfx"><WorldIcon name="speaker" /><span>{sfxOn ? '효과음 켜짐' : '효과음 꺼짐'}</span><button type="button" role="switch" aria-checked={sfxOn} aria-label="효과음 켜기 또는 끄기" className={sfxOn ? 'is-on' : ''} onClick={toggleSfx}><i /></button></div></section>}
    <div className={`mw3-toast ${toast ? 'is-visible' : ''}`} role="status" aria-live="polite">{toast}</div>
    {(!showsMainWorld || isMobile) && <a className="mw3-privacy-link" href={asset('privacy.html')} target="_blank" rel="noopener">개인정보처리방침</a>}
  </main>;
}
