import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import LegacyGooglerApp from '../../legacy/LegacyGooglerApp';

export interface PrivateLearnerProfile {
  legalName: string;
  accountEmail: string;
}

export interface PublicLearnerProfile {
  displayName: string;
  avatar: string;
  title: string;
}

const journeySteps = ['여정 시작', '계정 준비', '나만의 구글러 만들기', '수준 진단', '출발 단계', '학습 리듬', '코치 선택', '플래너 생성'];
const questions = ['Google 계정을 직접 만들 수 있나요?', '비밀번호를 잊었을 때 복구할 수 있나요?', 'Gmail에서 파일을 첨부해 보냈나요?', 'Drive 폴더와 공유 권한을 설정했나요?', 'Docs·Slides·Sheets 공동 작업을 해봤나요?', 'Classroom 또는 교육 도구를 사용했나요?', '이번 여정의 목표는 무엇인가요?'];
const nicknames = ['반짝이는 여우', '꾸준한 부엉이', '호기심 많은 탐험가', '용감한 구름', '다정한 펭귄', '지혜로운 별'];
const avatars = ['🦊', '🐰', '🐧', '🐱', '🐶', '🦉', '🐻', '🐯', '🐸', '🐼', '🌟', '☁️', '🌱', '🚀', '🎒', '📚', '🧭', '💡', '🎨', '🛠️'];
const titles = ['반짝이는 구글러 💡', '호기심 많은 구글러 🔍', '용감한 구글러 🧭', '꾸준한 구글러 🌱', '탐험하는 구글러 🚀', '성장하는 구글러 ✨'];
const levels = [
  { name: '처음부터 시작하기', description: 'Google의 첫 문을 열고 기본 동작을 천천히 익혀요.', action: '계정 만들기와 로그인 연습', reason: '처음 시작하는 답변이 많아 이 단계가 잘 맞아요.', weeks: '8주', rhythm: '주 3회', daily: '하루 30분' },
  { name: '기초를 탄탄하게', description: 'Gmail과 Drive의 기본 행동을 내 습관으로 만들어요.', action: '메일 보내기와 Drive 폴더 정리', reason: '기본 도구를 한 번 더 단단하게 연결해요.', weeks: '6주', rhythm: '주 3회', daily: '하루 30분' },
  { name: '활용 능력 넓히기', description: '협업 도구와 수업·업무 활용 능력을 넓혀요.', action: '문서 공동 편집과 공유 설정', reason: '이미 아는 도구를 함께 쓰는 힘으로 키워요.', weeks: '5주', rhythm: '주 4회', daily: '하루 35분' },
  { name: '심화·시험 준비', description: '인증 시험과 실제 활용을 위한 심화 모험이에요.', action: '모의 미션과 포트폴리오 만들기', reason: '도전 목표가 뚜렷한 구글러에게 추천해요.', weeks: '4주', rhythm: '주 4회', daily: '하루 45분' },
];
const rhythms = [
  { name: '가볍게 꾸준히', detail: '주 2회 · 하루 25분', note: '처음 습관을 만드는 데 좋아요.' },
  { name: '균형 있게', detail: '주 3회 · 하루 30분', note: '학습과 일상을 함께 챙겨요.' },
  { name: '집중해서', detail: '주 4회 · 하루 40분', note: '목표에 조금 더 빠르게 다가가요.' },
];
const coaches = [
  { name: '차분한 코치', line: '오늘도 한 걸음씩, 충분히 잘하고 있어요.', color: 'border-[#4285f4] bg-[#e8f0fe] text-[#1967d2]', badge: '천천히 함께' },
  { name: '발랄한 메이트', line: '좋아! 오늘 미션도 같이 깨보자! ✨', color: 'border-[#34a853] bg-[#e6f4ea] text-[#137333]', badge: '같이 신나게' },
  { name: '도전형 트레이너', line: '준비 완료. 오늘의 기록을 갱신해볼까요?', color: 'border-[#ea4335] bg-[#fce8e6] text-[#c5221f]', badge: '목표를 향해' },
];

type Screen = 'entry' | 'return' | 'account' | 'identity' | 'diagnostic' | 'level' | 'rhythm' | 'coach' | 'loading' | 'planner' | 'legacy';

function stableAvatar(name: string, offset = 0) {
  const value = Array.from(name.trim() || '새내기 구글러').reduce((sum, character) => sum + character.codePointAt(0)!, 0);
  return avatars[(value + offset) % avatars.length];
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) return;
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

function useTypingTitle(reducedMotion: boolean) {
  const [text, setText] = useState(reducedMotion ? titles[0] : '');
  useEffect(() => {
    if (reducedMotion) {
      setText(titles[0]);
      return;
    }
    let titleIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let timer = 0;
    const tick = () => {
      const title = titles[titleIndex];
      if (!deleting) {
        characterIndex += 1;
        setText(title.slice(0, characterIndex));
        if (characterIndex === title.length) {
          deleting = true;
          timer = window.setTimeout(tick, 1100);
          return;
        }
      } else {
        characterIndex -= 1;
        setText(title.slice(0, characterIndex));
        if (characterIndex === 0) {
          deleting = false;
          titleIndex = (titleIndex + 1) % titles.length;
        }
      }
      timer = window.setTimeout(tick, deleting ? 35 : 75);
    };
    timer = window.setTimeout(tick, 75);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);
  return text;
}

function JourneyProgress({ step }: { step: number }) {
  const currentName = journeySteps[step - 1];
  return (
    <header className="mb-7 border-b border-[#e8eaed] bg-white px-4 py-3 shadow-sm sm:mb-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-3 pr-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1a73e8]">Be a Googler</p>
            <p className="mt-0.5 text-sm font-semibold text-[#3c4043] sm:text-base"><span className="sm:hidden">{step} / 8 · </span>{currentName}</p>
          </div>
          <div className="hidden items-center gap-2 sm:flex" aria-label={`전체 여정 ${step} / 8`}>
            <span className="text-sm font-bold text-[#1a73e8]">{step}</span>
            <span className="text-sm text-[#5f6368]">/ 8</span>
            <span className="ml-1 text-sm font-semibold text-[#3c4043]">{currentName}</span>
          </div>
        </div>
        <div className="mt-3 flex gap-1" aria-hidden="true">
          {journeySteps.map((name, index) => <span key={name} className={`h-1 flex-1 rounded-full ${index < step ? 'bg-[#4285f4]' : 'bg-[#e8eaed]'}`} />)}
        </div>
      </div>
    </header>
  );
}

function NoteIcon({ off }: { off: boolean }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[2]" ><path d="M9 18V6l9-2v12" /><path d="M9 10l9-2" /><circle cx="6" cy="18" r="3" /><circle cx="15" cy="16" r="3" />{off ? <path d="M3 3l18 18" /> : <path d="M19 7c1.4.8 2 2 2 3.5S20.4 13.2 19 14" />}</svg>;
}

function SpeakerIcon({ off }: { off: boolean }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[2]" ><path d="M4 10v4h4l5 4V6l-5 4H4z" />{off ? <path d="M3 3l18 18" /> : <><path d="M16 9.5c.9.7 1.4 1.5 1.4 2.5s-.5 1.8-1.4 2.5" /><path d="M19 7c1.5 1.3 2 3 2 5s-.5 3.7-2 5" /></>}</svg>;
}

function SoundControls({ bgmOn, effectsOn, onBgm, onEffects }: { bgmOn: boolean; effectsOn: boolean; onBgm: () => void; onEffects: () => void }) {
  const bgmLabel = bgmOn ? '배경음악 끄기' : '배경음악 켜기';
  const effectsLabel = effectsOn ? '효과음 끄기' : '효과음 켜기';
  return <div className="absolute right-4 top-3 z-10 flex gap-2 sm:right-6" aria-label="사운드 설정">
    <button type="button" onClick={onBgm} aria-label={bgmLabel} title={bgmLabel} className={`relative grid h-11 w-11 place-items-center rounded-full border transition ${bgmOn ? 'border-[#d2e3fc] bg-[#e8f0fe] text-[#1967d2]' : 'border-[#dadce0] bg-[#f1f3f4] text-[#5f6368]'}`}><NoteIcon off={!bgmOn} />{bgmOn && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#1a73e8]" />}</button>
    <button type="button" onClick={onEffects} aria-label={effectsLabel} title={effectsLabel} className={`grid h-11 w-11 place-items-center rounded-full border transition ${effectsOn ? 'border-[#ceead6] bg-[#e6f4ea] text-[#137333]' : 'border-[#dadce0] bg-[#f1f3f4] text-[#5f6368]'}`}><SpeakerIcon off={!effectsOn} /></button>
  </div>;
}

function Layout({ step, children, bgmOn, effectsOn, onBgm, onEffects }: { step: number; children: ReactNode; bgmOn: boolean; effectsOn: boolean; onBgm: () => void; onEffects: () => void }) {
  return <main className="min-h-screen overflow-x-hidden bg-[#f8f9fa] text-[#202124]"><div className="relative"><SoundControls bgmOn={bgmOn} effectsOn={effectsOn} onBgm={onBgm} onEffects={onEffects} /><JourneyProgress step={step} /></div><div className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6">{children}</div></main>;
}

export default function JourneyPrototype() {
  const [screen, setScreen] = useState<Screen>('entry');
  const [privateProfile, setPrivateProfile] = useState<PrivateLearnerProfile>({ legalName: '', accountEmail: '' });
  const [publicProfile, setPublicProfile] = useState<PublicLearnerProfile>({ displayName: nicknames[0], avatar: avatars[0], title: titles[0] });
  const [nicknameTouched, setNicknameTouched] = useState(false);
  const [manualAvatar, setManualAvatar] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [diagnosticIndex, setDiagnosticIndex] = useState(0);
  const [diagnosticScore, setDiagnosticScore] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [selectedRhythm, setSelectedRhythm] = useState(1);
  const [selectedCoach, setSelectedCoach] = useState(0);
  const [calendarPublished, setCalendarPublished] = useState(false);
  const [bgmOn, setBgmOn] = useState(() => localStorage.getItem('journey-bgm') !== 'off');
  const [effectsOn, setEffectsOn] = useState(() => localStorage.getItem('journey-effects') !== 'off');
  const avatarIndex = useRef(0);
  const pickerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const audio = useRef<AudioContext | null>(null);
  const reducedMotion = useReducedMotion();
  const animatedTitle = useTypingTitle(reducedMotion);

  const nicknameValid = publicProfile.displayName.trim().length >= 2 && publicProfile.displayName.trim().length <= 16;
  const levelDots = useMemo(() => levels.map((_, index) => index), []);

  const playEffect = (frequency = 520) => {
    if (!effectsOn || typeof AudioContext === 'undefined') return;
    if (!audio.current) audio.current = new AudioContext();
    const oscillator = audio.current.createOscillator();
    const gain = audio.current.createGain();
    gain.gain.value = 0.02;
    oscillator.frequency.value = frequency;
    oscillator.connect(gain).connect(audio.current.destination);
    oscillator.start();
    oscillator.stop(audio.current.currentTime + 0.07);
  };

  useEffect(() => localStorage.setItem('journey-bgm', bgmOn ? 'on' : 'off'), [bgmOn]);
  useEffect(() => localStorage.setItem('journey-effects', effectsOn ? 'on' : 'off'), [effectsOn]);
  useEffect(() => {
    if (nicknameTouched || manualAvatar) return;
    const timer = window.setInterval(() => {
      avatarIndex.current = (avatarIndex.current + 1) % avatars.length;
      setPublicProfile((profile) => ({ ...profile, avatar: avatars[avatarIndex.current] }));
    }, 320);
    return () => window.clearInterval(timer);
  }, [manualAvatar, nicknameTouched]);
  useEffect(() => {
    if (!nicknameTouched || manualAvatar) return;
    const timer = window.setTimeout(() => setPublicProfile((profile) => ({ ...profile, avatar: stableAvatar(profile.displayName) })), 500);
    return () => window.clearTimeout(timer);
  }, [manualAvatar, nicknameTouched, publicProfile.displayName]);
  useEffect(() => {
    const closePicker = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) setPickerOpen(false);
    };
    const closePickerWithEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setPickerOpen(false);
    };
    document.addEventListener('mousedown', closePicker);
    document.addEventListener('keydown', closePickerWithEscape);
    return () => {
      document.removeEventListener('mousedown', closePicker);
      document.removeEventListener('keydown', closePickerWithEscape);
    };
  }, []);
  useEffect(() => {
    if (screen !== 'loading') return;
    const timer = window.setTimeout(() => setScreen('planner'), 1200);
    return () => window.clearTimeout(timer);
  }, [screen]);

  const updateDisplayName = (displayName: string) => {
    setNicknameTouched(true);
    setPublicProfile((profile) => ({ ...profile, displayName }));
  };
  const selectAvatar = (avatar: string) => {
    setManualAvatar(true);
    setPublicProfile((profile) => ({ ...profile, avatar }));
    setPickerOpen(false);
  };
  const goNextDiagnostic = (answer: number) => {
    playEffect(420 + answer * 80);
    const nextScore = diagnosticScore + answer;
    if (diagnosticIndex === questions.length - 1) {
      setDiagnosticScore(nextScore);
      setSelectedLevel(Math.min(levels.length - 1, Math.round(nextScore / questions.length)));
      setScreen('level');
      return;
    }
    setDiagnosticScore(nextScore);
    setDiagnosticIndex((index) => index + 1);
  };
  const moveLevelCarousel = (direction: number) => {
    const next = Math.min(levels.length - 1, Math.max(0, selectedLevel + direction));
    setSelectedLevel(next);
    carouselRef.current?.children[next]?.scrollIntoView?.({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };
  const handleLevelKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); moveLevelCarousel(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); moveLevelCarousel(-1); }
  };

  if (screen === 'legacy') return <LegacyGooglerApp />;

  if (screen === 'entry') return <Layout step={1} bgmOn={bgmOn} effectsOn={effectsOn} onBgm={() => setBgmOn((value) => !value)} onEffects={() => setEffectsOn((value) => !value)}>
    <section className="mx-auto max-w-4xl py-8 text-center sm:py-14">
      <p className="text-sm font-bold tracking-wide text-[#1a73e8]">Google Educator journey</p>
      <h1 className="mt-4 text-4xl font-black tracking-tight text-[#202124] sm:text-6xl">Be a Googler</h1>
      <p className="mt-6 text-lg leading-relaxed text-[#5f6368] sm:text-xl"><span className="block">배우고, 직접 해보고, 함께 성장하는</span><span className="block">구글러의 작은 모험을 시작해보세요.</span></p>
      <div className="mx-auto mt-12 grid max-w-3xl gap-5 text-left md:grid-cols-2">
        <button type="button" onClick={() => { playEffect(); setScreen('account'); }} className="group rounded-3xl border-2 border-[#d2e3fc] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-[#4285f4] hover:bg-[#f8fbff] hover:shadow-lg"><span className="text-4xl" aria-hidden="true">🌱</span><h2 className="mt-5 text-2xl font-black">모험 시작하기</h2><p className="mt-2 leading-relaxed text-[#5f6368]">나에게 맞는 출발점과 학습 리듬을 찾아볼게요.</p></button>
        <button type="button" onClick={() => { playEffect(); setScreen('return'); }} className="group rounded-3xl border-2 border-[#fce8e6] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-[#ea4335] hover:bg-[#fffafa] hover:shadow-lg"><span className="text-4xl" aria-hidden="true">🧭</span><h2 className="mt-5 text-2xl font-black">지난 모험 이어가기</h2><p className="mt-2 leading-relaxed text-[#5f6368]">저장해 둔 플래너와 다음 미션으로 돌아가요.</p></button>
      </div>
    </section>
  </Layout>;

  if (screen === 'return') return <Layout step={1} bgmOn={bgmOn} effectsOn={effectsOn} onBgm={() => setBgmOn((value) => !value)} onEffects={() => setEffectsOn((value) => !value)}>
    <section className="mx-auto max-w-lg py-10"><p className="text-sm font-bold text-[#1a73e8]">여정 시작 · 1 / 8</p><h1 className="mt-3 text-3xl font-black">다시 만나 반가워요</h1><p className="mt-3 text-[#5f6368]">이 preview에서는 저장된 모험을 불러오는 대신 플래너 예시를 보여드려요.</p><button type="button" onClick={() => { playEffect(); setScreen('planner'); }} className="mt-8 w-full rounded-2xl bg-[#1a73e8] px-6 py-4 font-bold text-white shadow-sm hover:bg-[#1967d2]">지난 모험 이어가기</button><button type="button" onClick={() => setScreen('entry')} className="mt-4 w-full py-3 font-semibold text-[#5f6368]">처음으로</button></section>
  </Layout>;

  if (screen === 'account') return <Layout step={2} bgmOn={bgmOn} effectsOn={effectsOn} onBgm={() => setBgmOn((value) => !value)} onEffects={() => setEffectsOn((value) => !value)}>
    <section className="mx-auto max-w-xl py-8"><p className="text-sm font-bold text-[#1a73e8]">여정 준비 2 / 8</p><h1 className="mt-3 text-3xl font-black">계정 준비</h1><p className="mt-3 text-[#5f6368]">모험 안내를 받을 이메일을 확인해볼까요? preview에서는 이 기기에만 잠시 머물러요.</p><label className="mt-8 block text-sm font-bold">계정 이메일<input type="email" value={privateProfile.accountEmail} onChange={(event) => setPrivateProfile((profile) => ({ ...profile, accountEmail: event.target.value }))} placeholder="name@example.com" className="mt-2 w-full rounded-2xl border border-[#dadce0] bg-white px-4 py-3 text-base outline-none transition focus:border-[#1a73e8] focus:ring-2 focus:ring-[#d2e3fc]" /></label><button type="button" onClick={() => { playEffect(); setScreen('identity'); }} className="mt-7 rounded-2xl bg-[#1a73e8] px-7 py-4 font-bold text-white shadow-sm hover:bg-[#1967d2]">내 모험 프로필 만들기</button></section>
  </Layout>;

  if (screen === 'identity') return <Layout step={3} bgmOn={bgmOn} effectsOn={effectsOn} onBgm={() => setBgmOn((value) => !value)} onEffects={() => setEffectsOn((value) => !value)}>
    <section className="py-4"><p className="text-sm font-bold text-[#1a73e8]">여정 준비 3 / 8</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">나만의 구글러 만들기</h1><p className="mt-3 whitespace-pre-line text-lg leading-relaxed text-[#5f6368]">모험에서 사용할 이름과{`\n`}함께할 캐릭터를 정해볼까요?</p>
      <div className="mt-9 grid items-start gap-6 lg:grid-cols-[2fr_3fr]">
        <section className="rounded-3xl border border-[#d2e3fc] bg-white p-6 shadow-sm" aria-label="모험 프로필 미리보기">
          <p className="text-sm font-bold text-[#1a73e8]">모험 프로필 미리보기</p>
          <div className="mt-6 flex min-h-[236px] flex-col justify-between lg:min-h-[252px]">
            <div className="flex items-center gap-4"><span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-[#f8fbff] text-5xl" aria-label={`선택한 캐릭터 ${publicProfile.avatar}`}>{publicProfile.avatar}</span><div className="min-w-0"><h2 className="break-words text-2xl font-black">{publicProfile.displayName.trim() || '이름을 정해볼까요?'}</h2><p className="journey-title-slot mt-1 text-sm font-semibold text-[#5f6368]" aria-live="polite">{animatedTitle || '\u00a0'}</p><span className="mt-2 inline-flex rounded-full bg-[#e8f0fe] px-3 py-1 text-xs font-bold text-[#1967d2]">새내기 구글러</span></div></div>
            <div className="border-t border-[#e8eaed] pt-5"><p className="text-sm font-bold text-[#3c4043]">다른 구글러에게는 이렇게 보여요</p><p className="mt-2 text-sm leading-relaxed text-[#5f6368]">오늘도 새로운 도구를 탐험하고 있어요.</p></div>
          </div>
        </section>
        <section className="flex min-w-0 flex-col justify-between rounded-3xl border border-[#e8eaed] bg-white p-6 shadow-sm lg:min-h-full">
          <div className="space-y-5">
            <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-black">용사님의 이름</h2><span className="rounded-full bg-[#f1f3f4] px-2.5 py-1 text-xs font-bold text-[#5f6368]">운영자 확인용</span></div><p className="mt-1.5 text-sm leading-relaxed text-[#5f6368]">본인 확인과 수료·운영 안내에만 사용되며, 다른 구글러에게는 공개되지 않아요.</p><label className="sr-only" htmlFor="legal-name">용사님의 이름</label><input id="legal-name" value={privateProfile.legalName} onChange={(event) => setPrivateProfile((profile) => ({ ...profile, legalName: event.target.value }))} placeholder="실명 또는 운영 확인 이름" className="mt-3 w-full rounded-2xl border border-[#dadce0] px-4 py-3 outline-none transition focus:border-[#1a73e8] focus:ring-2 focus:ring-[#d2e3fc]" /></div>
            <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-black">모험 닉네임</h2><span className="rounded-full bg-[#e6f4ea] px-2.5 py-1 text-xs font-bold text-[#137333]">다른 구글러에게 공개</span></div><p className="mt-1.5 text-sm text-[#5f6368]">캘린더와 랭킹에서는 이 이름으로 보여요.</p><div ref={pickerRef} className="relative mt-3"><div className="flex min-w-0 flex-wrap items-stretch rounded-2xl border border-[#dadce0] bg-white transition focus-within:border-[#1a73e8] focus-within:ring-2 focus-within:ring-[#d2e3fc] sm:flex-nowrap"><button type="button" aria-label="캐릭터 바꾸기" onClick={() => setPickerOpen((open) => !open)} title="캐릭터 바꾸기" className="group relative grid h-11 w-11 shrink-0 place-items-center rounded-l-2xl text-2xl transition hover:bg-[#e8f0fe] focus:bg-[#e8f0fe] focus:outline-none"><span>{publicProfile.avatar}</span><span className="absolute inset-0 grid place-items-center rounded-l-2xl bg-[#1a73e8]/15 text-xs text-[#1967d2] opacity-0 transition group-hover:opacity-100 group-focus:opacity-100" aria-hidden="true">↻</span><span className="absolute bottom-0.5 right-1 text-[10px] text-[#1967d2] sm:hidden" aria-hidden="true">⌄</span></button><label className="sr-only" htmlFor="display-name">모험 닉네임</label><input id="display-name" value={publicProfile.displayName} onChange={(event) => updateDisplayName(event.target.value)} placeholder="2~16자 모험 닉네임" className="min-w-0 flex-1 border-x border-[#e8eaed] px-3 py-2 outline-none" /><button type="button" onClick={() => { const currentIndex = nicknames.indexOf(publicProfile.displayName); updateDisplayName(nicknames[(currentIndex + 1 + nicknames.length) % nicknames.length]); }} className="min-h-11 shrink-0 px-3 text-sm font-bold text-[#1967d2] hover:bg-[#f8fbff] sm:rounded-r-2xl">새로운 모험 이름</button></div>{pickerOpen && <div className="absolute left-0 top-full z-20 mt-2 grid w-[min(18rem,100%)] grid-cols-5 gap-1 rounded-2xl border border-[#dadce0] bg-white p-3 shadow-xl" role="dialog" aria-label="캐릭터 선택기"><button type="button" onClick={() => setPickerOpen(false)} aria-label="캐릭터 선택기 닫기" className="col-span-5 mb-1 rounded-lg px-2 py-1 text-right text-sm font-bold text-[#5f6368]">닫기 ×</button>{avatars.map((avatar) => <button type="button" key={avatar} onClick={() => selectAvatar(avatar)} className={`rounded-xl p-2 text-2xl hover:bg-[#e8f0fe] ${publicProfile.avatar === avatar ? 'bg-[#e8f0fe] ring-1 ring-[#4285f4]' : ''}`} aria-label={`${avatar} 선택`}>{avatar}</button>)}</div>}</div>{!nicknameValid && <p role="alert" className="mt-2 text-sm font-semibold text-[#c5221f]">공백을 제외하고 2~16자로 입력해주세요.</p>}</div>
          </div>
          <button type="button" disabled={!nicknameValid} onClick={() => { playEffect(650); setScreen('diagnostic'); }} className="mt-5 w-full rounded-2xl bg-[#1a73e8] px-6 py-4 font-bold text-white shadow-sm transition hover:bg-[#1967d2] disabled:cursor-not-allowed disabled:bg-[#dadce0]">이 모습으로 출발하기</button>
        </section>
      </div>
    </section>
  </Layout>;

  if (screen === 'diagnostic') return <Layout step={4} bgmOn={bgmOn} effectsOn={effectsOn} onBgm={() => setBgmOn((value) => !value)} onEffects={() => setEffectsOn((value) => !value)}>
    <section className="mx-auto max-w-2xl py-8"><p className="text-sm font-bold text-[#1a73e8]">수준 진단 4 / 8 · 질문 {diagnosticIndex + 1} / {questions.length}</p><h1 className="mt-5 text-3xl font-black leading-snug">{questions[diagnosticIndex]}</h1><p className="mt-3 text-[#5f6368]">정답은 없어요. 지금의 나와 가장 가까운 답을 골라주세요.</p><div className="mt-8 grid gap-3">{['아직 익숙하지 않아요', '조금 해봤어요', '자신 있게 할 수 있어요'].map((answer, index) => <button type="button" key={answer} onClick={() => goNextDiagnostic(index)} className="rounded-2xl border border-[#dadce0] bg-white p-5 text-left font-semibold shadow-sm transition hover:-translate-y-0.5 hover:border-[#4285f4] hover:bg-[#f8fbff]">{answer}</button>)}</div></section>
  </Layout>;

  if (screen === 'level') return <Layout step={5} bgmOn={bgmOn} effectsOn={effectsOn} onBgm={() => setBgmOn((value) => !value)} onEffects={() => setEffectsOn((value) => !value)}>
    <section className="py-5"><p className="text-sm font-bold text-[#1a73e8]">5 / 8 · 출발 단계</p><h1 className="mt-3 text-3xl font-black">나에게 맞는 출발 단계를 골라볼까요?</h1><p className="mt-3 text-[#5f6368]">진단 결과로 한 단계를 추천했어요. 언제든 마음에 드는 단계로 바꿀 수 있어요.</p><div className="mt-7 flex items-center justify-end gap-2"><button type="button" aria-label="이전 출발 단계" onClick={() => moveLevelCarousel(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-[#dadce0] bg-white text-xl hover:bg-[#f1f3f4]">‹</button><button type="button" aria-label="다음 출발 단계" onClick={() => moveLevelCarousel(1)} className="grid h-11 w-11 place-items-center rounded-full border border-[#dadce0] bg-white text-xl hover:bg-[#f1f3f4]">›</button></div><div ref={carouselRef} onKeyDown={handleLevelKeys} tabIndex={0} aria-label="출발 단계 카드. 방향키로 이동" className="hide-scrollbar mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 outline-none">{levels.map((item, index) => <button type="button" key={item.name} onClick={() => { setSelectedLevel(index); playEffect(580); }} className={`min-w-[84%] snap-center rounded-3xl border-2 bg-white p-6 text-left shadow-sm transition sm:min-w-[310px] lg:min-w-[calc(25%-12px)] ${selectedLevel === index ? 'border-[#4285f4] bg-[#f8fbff] shadow-lg ring-2 ring-[#d2e3fc]' : 'border-[#e8eaed] hover:border-[#a8c7fa]'}`}><div className="flex items-center justify-between gap-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${selectedLevel === index ? 'bg-[#e8f0fe] text-[#1967d2]' : 'bg-[#f1f3f4] text-[#5f6368]'}`}>{selectedLevel === index ? '선택됨' : index === Math.min(levels.length - 1, Math.round(diagnosticScore / questions.length)) ? '추천 단계' : '선택 가능'}</span><span className="text-sm font-bold text-[#5f6368]">{index + 1}</span></div><h2 className="mt-5 text-xl font-black">{item.name}</h2><p className="mt-3 min-h-12 text-sm leading-relaxed text-[#5f6368]">{item.description}</p><dl className="mt-6 space-y-2 text-sm"><div><dt className="font-bold">시작 행동</dt><dd className="text-[#5f6368]">{item.action}</dd></div><div><dt className="font-bold">추천 이유</dt><dd className="text-[#5f6368]">{item.reason}</dd></div><div className="flex justify-between gap-2 pt-2 text-[#5f6368]"><span>{item.weeks}</span><span>{item.rhythm}</span><span>{item.daily}</span></div></dl></button>)}</div><div className="flex justify-center gap-2" aria-label="단계 위치 표시">{levelDots.map((index) => <button type="button" key={index} aria-label={`${index + 1}번째 출발 단계`} onClick={() => setSelectedLevel(index)} className={`h-2.5 w-2.5 rounded-full ${selectedLevel === index ? 'bg-[#1a73e8]' : 'bg-[#dadce0]'}`} />)}</div><button type="button" onClick={() => { playEffect(); setScreen('rhythm'); }} className="mt-8 rounded-2xl bg-[#1a73e8] px-7 py-4 font-bold text-white shadow-sm hover:bg-[#1967d2]">이 단계로 여정 만들기</button></section>
  </Layout>;

  if (screen === 'rhythm') return <Layout step={6} bgmOn={bgmOn} effectsOn={effectsOn} onBgm={() => setBgmOn((value) => !value)} onEffects={() => setEffectsOn((value) => !value)}>
    <section className="mx-auto max-w-3xl py-8"><p className="text-sm font-bold text-[#1a73e8]">6 / 8 · 학습 리듬</p><h1 className="mt-3 text-3xl font-black">나에게 맞는 학습 리듬은?</h1><p className="mt-3 text-[#5f6368]">언제든 플래너에서 조절할 수 있어요.</p><div className="mt-8 grid gap-4 md:grid-cols-3">{rhythms.map((rhythm, index) => <button type="button" key={rhythm.name} onClick={() => { setSelectedRhythm(index); playEffect(520); }} className={`rounded-3xl border-2 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 ${selectedRhythm === index ? 'border-[#34a853] bg-[#f6fff8] ring-2 ring-[#ceead6]' : 'border-[#e8eaed]'}`}><h2 className="font-black">{rhythm.name}</h2><p className="mt-3 font-bold text-[#137333]">{rhythm.detail}</p><p className="mt-3 text-sm leading-relaxed text-[#5f6368]">{rhythm.note}</p></button>)}</div><button type="button" onClick={() => { playEffect(); setScreen('coach'); }} className="mt-8 rounded-2xl bg-[#1a73e8] px-7 py-4 font-bold text-white">이 리듬으로 계속하기</button></section>
  </Layout>;

  if (screen === 'coach') return <Layout step={7} bgmOn={bgmOn} effectsOn={effectsOn} onBgm={() => setBgmOn((value) => !value)} onEffects={() => setEffectsOn((value) => !value)}>
    <section className="mx-auto max-w-4xl py-8"><p className="text-sm font-bold text-[#1a73e8]">7 / 8 · 코치 선택</p><h1 className="mt-3 text-3xl font-black">어떤 코치와 함께할까요?</h1><p className="mt-3 text-[#5f6368]">말투는 언제든 플래너에서 바꿀 수 있어요.</p><div className="mt-8 grid gap-4 md:grid-cols-3">{coaches.map((coach, index) => <button type="button" key={coach.name} onClick={() => { setSelectedCoach(index); playEffect(500 + index * 60); }} className={`rounded-3xl border-2 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 ${selectedCoach === index ? `${coach.color} -translate-y-1 shadow-lg` : 'border-[#e8eaed] hover:border-[#a8c7fa]'}`}><div className="flex items-start justify-between gap-3"><h2 className="text-xl font-black">{coach.name}</h2>{selectedCoach === index && <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-bold">{coach.badge}</span>}</div><p className="mt-6 min-h-16 leading-relaxed">“{coach.line}”</p>{index === 1 && <span className="mt-5 inline-flex rounded-full bg-[#e6f4ea] px-2.5 py-1 text-xs font-bold text-[#137333]">Yellow + Green energy</span>}</button>)}</div><button type="button" onClick={() => { playEffect(700); setScreen('loading'); }} className="mt-8 rounded-2xl bg-[#1a73e8] px-7 py-4 font-bold text-white shadow-sm hover:bg-[#1967d2]">내 학습 플래너 준비하기</button></section>
  </Layout>;

  if (screen === 'loading') return <Layout step={8} bgmOn={bgmOn} effectsOn={effectsOn} onBgm={() => setBgmOn((value) => !value)} onEffects={() => setEffectsOn((value) => !value)}><section className="mx-auto max-w-2xl py-28 text-center"><span className="text-6xl" aria-hidden="true">✨</span><h1 className="mt-6 text-3xl font-black">당신만의 구글러 여정을 준비하고 있어요.</h1><p className="mt-4 text-[#5f6368]">첫 번째 작은 모험을 고르고 있어요.</p><div className="mt-10 h-2 overflow-hidden rounded-full bg-[#e8eaed]"><div className="h-full w-4/5 animate-pulse rounded-full bg-gradient-to-r from-[#4285f4] via-[#34a853] to-[#fbbc05]" /></div></section></Layout>;

  return <Layout step={8} bgmOn={bgmOn} effectsOn={effectsOn} onBgm={() => setBgmOn((value) => !value)} onEffects={() => setEffectsOn((value) => !value)}><section className="py-6"><p className="text-sm font-bold text-[#1a73e8]">8 / 8 · 플래너 생성</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">{publicProfile.displayName}님의 작은 모험이 준비됐어요!</h1><p className="mt-3 text-[#5f6368]">{levels[selectedLevel].name} · {rhythms[selectedRhythm].detail} · {coaches[selectedCoach].name}와 함께</p><div className="mt-8 grid gap-5 md:grid-cols-2"><section className="rounded-3xl border border-[#d2e3fc] bg-white p-6 shadow-sm"><h2 className="text-xl font-black">이번 주 학습 일정</h2>{['Google 계정 만들기', '로그인과 로그아웃 연습', 'Gmail 메일 보내기', 'Drive 폴더 만들기', '첫 주 복습 퀴즈'].map((item, index) => <button type="button" key={item} onClick={() => setScreen('legacy')} className="mt-3 block w-full rounded-xl bg-[#f8f9fa] p-4 text-left hover:bg-[#e8f0fe]"><b>Day {index + 1}</b> · {item}</button>)}</section><section className="rounded-3xl bg-[#1a73e8] p-6 text-white shadow-sm"><h2 className="text-xl font-black">오늘의 첫 미션</h2><p className="mt-4 leading-relaxed">{coaches[selectedCoach].line}</p><p className="mt-7 text-sm text-white/80">Course 2 · Day 20 · Mission 60 · URL 60 콘텐츠는 기존 학습 공간에서 이어져요.</p><button type="button" onClick={() => setCalendarPublished(true)} className="mt-7 rounded-xl bg-white px-5 py-3 font-bold text-[#1967d2]">캘린더에 공개하기</button>{calendarPublished && <p className="mt-3 rounded-xl bg-white/15 p-3 text-sm">모험 닉네임으로 캘린더에 표시할 준비가 됐어요.</p>}<button type="button" onClick={() => setScreen('legacy')} className="mt-4 block font-bold underline underline-offset-4">기존 학습 공간으로 가기</button></section></div></section></Layout>;
}
