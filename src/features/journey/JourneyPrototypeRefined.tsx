import { useEffect, useRef, useState } from 'react';
import { coachTones } from '../../content/coachTones';
import { journeyLevels } from '../../content/journeyLevels';
import LegacyGooglerApp from '../../legacy/LegacyGooglerApp';
import { loadAudioSettings, playJourneyEffect, saveAudioSettings, setJourneyVisibility, startJourneyBgm, stopJourneyBgm } from '../audio/audioEngine';
import { CoachToneSelector } from './CoachToneSelector';
import { IdentityStep } from './IdentityStep';
import { JourneyLevelSelector } from './JourneyLevelSelector';
import { TypingJourneyTitle } from './TypingJourneyTitle';

type Mode = 'entry' | 'return' | 'new' | 'diagnostic' | 'level' | 'tone' | 'loading' | 'planner' | 'legacy';
const questions = ['Google 계정을 직접 만들 수 있나요?', '비밀번호를 잊었을 때 복구할 수 있나요?', 'Gmail에서 파일을 첨부해 보낼 수 있나요?', 'Drive 폴더와 공유 권한을 설정할 수 있나요?', 'Docs·Slides·Sheets 공동 작업이 익숙한가요?', 'Classroom 또는 교육 도구를 사용하나요?', '이번 여정의 목표는 무엇인가요?'];

export default function JourneyPrototypeRefined() {
  const [mode, setMode] = useState<Mode>('entry');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [levelId, setLevelId] = useState<(typeof journeyLevels)[number]['id']>('start');
  const [toneId, setToneId] = useState<(typeof coachTones)[number]['id']>('mate');
  const [audioSettings, setAudioSettings] = useState(loadAudioSettings);
  const audio = useRef<AudioContext | null>(null);
  const level = journeyLevels.find((item) => item.id === levelId) ?? journeyLevels[0];
  const tone = coachTones.find((item) => item.id === toneId) ?? coachTones[0];
  const play = (frequency = 440) => { if (!audioSettings.effectsEnabled || !audioSettings.activated || typeof AudioContext === 'undefined') return; if (!audio.current) audio.current = new AudioContext(); const oscillator = audio.current.createOscillator(); const gain = audio.current.createGain(); gain.gain.value = .02; oscillator.frequency.value = frequency; oscillator.connect(gain).connect(audio.current.destination); oscillator.start(); oscillator.stop(audio.current.currentTime + .06); };
  useEffect(() => { const visibility = () => setJourneyVisibility(document.hidden); document.addEventListener('visibilitychange', visibility); return () => { document.removeEventListener('visibilitychange', visibility); stopJourneyBgm(); }; }, []);
  useEffect(() => { if (mode !== 'loading') return undefined; const timer = window.setTimeout(() => setMode('planner'), 1600); return () => window.clearTimeout(timer); }, [mode]);
  const stage = mode === 'entry' ? 1 : mode === 'return' ? 2 : mode === 'new' ? 3 : mode === 'diagnostic' ? 4 : mode === 'level' ? 5 : mode === 'tone' ? 7 : 8;
  const stageNames = ['여정 시작', '계정 준비', '이름과 캐릭터', '수준 진단', '출발 단계', '학습 리듬', '코치 선택', '플래너 생성'];
  const shell = (children: React.ReactNode) => <main className="min-h-screen overflow-x-hidden bg-[#f8f9fa] px-4 py-6"><div className="mx-auto max-w-6xl"><header className="mb-6 flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-[#5f6368]">여정 준비 {stage} / 8</p><p className="text-sm font-bold text-[#1a73e8]">{stageNames[stage - 1]}</p></div><div className="flex max-w-[190px] flex-wrap justify-end gap-2 text-xs"><button aria-label="BGM 켜기 또는 끄기" onClick={() => { const next = saveAudioSettings({ bgmEnabled: !audioSettings.bgmEnabled }); setAudioSettings(next); if (!next.bgmEnabled) stopJourneyBgm(); else void startJourneyBgm(); }} className="rounded-full border border-[#dadce0] bg-white px-3 py-2">BGM {audioSettings.bgmEnabled ? '켜짐' : '꺼짐'}</button><button aria-label="효과음 켜기 또는 끄기" onClick={() => setAudioSettings(saveAudioSettings({ effectsEnabled: !audioSettings.effectsEnabled }))} className="rounded-full border border-[#dadce0] bg-white px-3 py-2">효과음 {audioSettings.effectsEnabled ? '켜짐' : '꺼짐'}</button></div></header><div className="mb-8 h-1.5 overflow-hidden rounded-full bg-[#e8eaed]"><div className="h-full bg-[#1a73e8]" style={{ width: `${stage / 8 * 100}%` }} /></div>{children}</div></main>;
  if (mode === 'legacy') return <LegacyGooglerApp />;
  if (mode === 'new') return shell(<IdentityStep onContinue={() => { play(); setMode('diagnostic'); }} />);
  if (mode === 'entry') return shell(<section className="mx-auto max-w-4xl py-10"><p className="font-bold text-[#1a73e8]">Google Educator journey</p><h1 className="mt-6 text-5xl font-black text-[#202124]">Be a Googler</h1><TypingJourneyTitle /><p className="mt-5 text-xl text-[#5f6368]">배우고 직접 해보며 함께 성장하는 구글러의 여정을 시작해보세요.</p><div className="mt-12 grid gap-5 md:grid-cols-2">{[['모험 시작하기', '나에게 맞는 출발 단계를 찾아볼게요.', '🧭', 'new'], ['지난 모험 이어가기', '지금의 학습 여정으로 돌아갈게요.', '🎒', 'return']].map(([title, text, icon, target]) => <button key={title} onClick={() => { void startJourneyBgm(); playJourneyEffect('next'); play(520); setMode(target as Mode); }} className="rounded-[2rem] border border-[#dadce0] bg-white p-8 text-left shadow-sm"><span className="text-4xl">{icon}</span><h2 className="mt-5 text-2xl font-black text-[#202124]">{title}</h2><p className="mt-2 text-[#5f6368]">{text}</p></button>)}</div></section>);
  if (mode === 'return') return shell(<section className="mx-auto max-w-md py-16"><h1 className="text-3xl font-black text-[#202124]">다시 만나 반가워요</h1><p className="mt-2 text-[#5f6368]">지난 여정을 이어가 볼까요?</p><button onClick={() => setMode('planner')} className="mt-8 w-full rounded-xl bg-[#1a73e8] p-4 font-bold text-white">여정 이어가기</button></section>);
  if (mode === 'diagnostic') return shell(<section className="mx-auto max-w-2xl py-10"><p className="text-sm font-bold text-[#1a73e8]">수준 진단 {questionIndex + 1} / {questions.length}</p><h1 className="mt-6 text-3xl font-black text-[#202124]">{questions[questionIndex]}</h1><div className="mt-7 grid gap-3">{['아직 익숙하지 않아요', '조금 해봤어요', '자신 있게 할 수 있어요'].map((answer, index) => <button key={answer} onClick={() => { play(400 + index * 80); if (questionIndex === questions.length - 1) setMode('level'); else setQuestionIndex(questionIndex + 1); }} className="rounded-2xl border border-[#dadce0] bg-white p-5 text-left text-[#202124]">{answer}</button>)}</div></section>);
  if (mode === 'level') return shell(<JourneyLevelSelector levels={journeyLevels} selectedId={levelId} onSelect={(id) => { setLevelId(id); play(600); }} onContinue={() => { play(); setMode('tone'); }} />);
  if (mode === 'tone') return shell(<CoachToneSelector tones={coachTones} selectedId={toneId} onSelect={(id) => { setToneId(id); play(500); }} onContinue={() => { play(700); setMode('loading'); }} />);
  if (mode === 'loading') return shell(<section className="py-32 text-center"><h1 className="text-3xl font-black text-[#202124]">나만의 구글러 여정을 준비하고 있어요</h1><p className="mt-8 animate-pulse text-[#1a73e8]">첫 미션을 고르고 있어요.</p></section>);
  return shell(<section className="mx-auto max-w-4xl"><p className="font-bold text-[#1a73e8]">{tone.name}의 첫 안내</p><h1 className="mt-3 text-4xl font-black text-[#202124]">Google 학습 플래너가 완성됐어요</h1><p className="mt-3 text-[#5f6368]">{level.name} · 예상 완료 {level.duration}</p><div className="mt-10 grid gap-5 md:grid-cols-2"><div className="rounded-3xl bg-white p-7 shadow-sm"><h2 className="text-xl font-black text-[#202124]">이번 주 학습 일정</h2><p className="mt-4 text-[#5f6368]">{level.example}</p></div><div className="rounded-3xl bg-[#e8f0fe] p-7"><h2 className="text-xl font-black text-[#202124]">오늘의 첫 미션</h2><p className="mt-4 text-[#202124]">{tone.line}</p><button onClick={() => setMode('legacy')} className="mt-8 rounded-xl bg-[#1a73e8] px-5 py-3 font-bold text-white">기존 학습 공간으로 가기</button></div></div></section>);
}
