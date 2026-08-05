import { useEffect, useState } from 'react';
import { coachTones } from '../../content/coachTones';
import { journeyLevels } from '../../content/journeyLevels';
import { clearJourneyState, createInitialJourneyState, loadJourneyState, moveJourneyBack, moveJourneyStep, saveJourneyState, type JourneyState, type JourneyStep } from '../../domain/journeyState';
import LegacyGooglerApp from '../../legacy/LegacyGooglerApp';
import { loadAudioSettings, playJourneySfx, saveAudioSettings, setJourneyVisibility, startJourneyBgm, stopJourneyBgm } from '../audio/audioEngine';
import { CoachToneSelector } from './CoachToneSelector';
import { IdentityStep } from './IdentityStep';
import { JourneyLevelSelector } from './JourneyLevelSelector';
import './JourneyPreview.css';

const questions = ['Google 계정을 직접 만들 수 있나요?', '비밀번호를 잊었을 때 복구할 수 있나요?', 'Gmail에서 파일을 첨부해 보냈나요?', 'Drive 폴더와 공유 권한을 설정했나요?', 'Docs·Slides·Sheets 공동 작업을 해봤나요?', 'Classroom 또는 교육 도구를 사용했나요?', '이번 여정의 목표는 무엇인가요?'];
const stageNames = ['여정 시작', '계정 준비', '나만의 구글러 만들기', '수준 진단', '출발 단계', '학습 리듬', '코치 선택', '플래너 생성'];

const stageFor = (step: JourneyStep) => step === 'entry' ? 1 : step === 'return' ? 2 : step === 'identity' ? 3 : step === 'diagnostic' ? 4 : step === 'level' ? 5 : step === 'tone' ? 7 : 8;

export default function JourneyPrototypeRefined() {
  const [journey, setJourney] = useState<JourneyState>(loadJourneyState);
  const [audioSettings, setAudioSettings] = useState(loadAudioSettings);
  const mode = journey.currentStep;
  const level = journeyLevels.find((item) => item.id === journey.levelId) ?? journeyLevels[0];
  const tone = coachTones.find((item) => item.id === journey.toneId) ?? coachTones[0];
  const stage = stageFor(mode);

  const updateJourney = (update: (current: JourneyState) => JourneyState) => {
    setJourney((current) => {
      const next = update(current);
      if (next === current) return current;
      saveJourneyState(next);
      return next;
    });
  };
  const navigate = (next: JourneyStep) => updateJourney((current) => moveJourneyStep(current, next));
  const goBack = () => {
    updateJourney(moveJourneyBack);
    void playJourneySfx('select');
  };
  const restart = () => {
    clearJourneyState();
    setJourney(createInitialJourneyState());
  };

  useEffect(() => {
    const visibility = () => setJourneyVisibility(document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => { document.removeEventListener('visibilitychange', visibility); stopJourneyBgm(); };
  }, []);
  useEffect(() => {
    if (mode !== 'loading') return undefined;
    const timer = window.setTimeout(() => setJourney((current) => {
      const next = { ...current, currentStep: 'planner' as const };
      saveJourneyState(next);
      return next;
    }), 1600);
    return () => window.clearTimeout(timer);
  }, [mode]);

  const shell = (children: React.ReactNode) => <main className="journey-preview min-h-screen overflow-x-hidden bg-[#f8f9fa] px-4 py-6"><div className="mx-auto max-w-6xl"><header className="mb-6 flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-[#5f6368]">여정 준비 {stage} / 8</p><p className="text-sm font-bold text-[#1a73e8]">{stageNames[stage - 1]}</p></div><div className="flex max-w-[260px] flex-wrap justify-end gap-2 text-xs">{journey.history.length > 0 && <button type="button" aria-label="이전 단계" onClick={goBack} className="rounded-full border border-[#dadce0] bg-white px-3 py-2">이전 단계</button>}{mode !== 'entry' && <button type="button" onClick={restart} className="rounded-full border border-[#dadce0] bg-white px-3 py-2">처음부터 다시 시작</button>}<button aria-label="BGM 켜기 또는 끄기" onClick={() => { const next = saveAudioSettings({ bgmEnabled: !audioSettings.bgmEnabled }); setAudioSettings(next); if (!next.bgmEnabled) stopJourneyBgm(); else void startJourneyBgm(); }} className="rounded-full border border-[#dadce0] bg-white px-3 py-2">BGM {audioSettings.bgmEnabled ? '켜짐' : '꺼짐'}</button><button aria-label="효과음 켜기 또는 끄기" onClick={() => setAudioSettings(saveAudioSettings({ effectsEnabled: !audioSettings.effectsEnabled }))} className="rounded-full border border-[#dadce0] bg-white px-3 py-2">효과음 {audioSettings.effectsEnabled ? '켜짐' : '꺼짐'}</button></div></header><div className="mb-8 h-1.5 overflow-hidden rounded-full bg-[#e8eaed]"><div className="h-full bg-[#1a73e8]" style={{ width: `${stage / 8 * 100}%` }} /></div>{children}</div></main>;

  if (mode === 'legacy') return <LegacyGooglerApp />;
  if (mode === 'identity') return shell(<IdentityStep initialLegalName={journey.legalName} initialPublicProfile={journey.publicProfile} onProfileChange={(legalName, publicProfile) => updateJourney((current) => current.legalName === legalName && current.publicProfile === publicProfile ? current : { ...current, legalName, publicProfile })} onSfx={(id) => { void playJourneySfx(id); }} onContinue={() => { void playJourneySfx('levelConfirm'); navigate('diagnostic'); }} />);
  if (mode === 'entry') return shell(<section className="mx-auto max-w-4xl py-10"><p className="font-bold text-[#1a73e8]">Google Educator journey</p><h1 className="mt-6 text-5xl font-black text-[#202124]">Be a Googler</h1><p className="mt-5 text-xl text-[#5f6368]">배우고, 직접 해보고, 함께 성장하는<br/>구글러의 작은 모험을 시작해보세요.</p><div className="mt-12 grid gap-5 md:grid-cols-2">{[['모험 시작하기', '나에게 맞는 출발 단계를 찾아볼게요.', '🧭', 'identity'], ['지난 모험 이어가기', '지금의 학습 여정으로 돌아갈게요.', '🎒', 'return']].map(([title, text, icon, target]) => <button key={title} onClick={() => { void startJourneyBgm(); void playJourneySfx(target === 'identity' ? 'journeyStart' : 'next'); navigate(target as JourneyStep); }} className="rounded-[2rem] border border-[#dadce0] bg-white p-8 text-left shadow-sm"><span className="text-4xl">{icon}</span><h2 className="mt-5 text-2xl font-black text-[#202124]">{title}</h2><p className="mt-2 text-[#5f6368]">{text}</p></button>)}</div></section>);
  if (mode === 'return') return shell(<section className="mx-auto max-w-md py-16"><h1 className="text-3xl font-black text-[#202124]">다시 만나 반가워요</h1><p className="mt-2 text-[#5f6368]">이전 여정이 없다면 새 프로필부터 준비할 수 있어요.</p><button onClick={() => { void playJourneySfx('next'); navigate('identity'); }} className="mt-8 w-full rounded-xl bg-[#1a73e8] p-4 font-bold text-white">여정 준비하기</button></section>);
  if (mode === 'diagnostic') { const questionIndex = journey.diagnosticAnswers.length; return shell(<section className="mx-auto max-w-2xl py-10"><p className="text-sm font-bold text-[#1a73e8]">수준 진단 {questionIndex + 1} / {questions.length}</p><h1 className="mt-6 text-3xl font-black text-[#202124]">{questions[questionIndex]}</h1><div className="mt-7 grid gap-3">{['아직 익숙하지 않아요', '조금 해봤어요', '자신 있게 할 수 있어요'].map((answer, answerIndex) => <button key={answer} onClick={() => { const finished = questionIndex === questions.length - 1; void playJourneySfx(finished ? 'next' : 'select'); updateJourney((current) => { if (current.diagnosticAnswers.length !== questionIndex) return current; const next = { ...current, diagnosticAnswers: [...current.diagnosticAnswers, answerIndex] }; return finished ? moveJourneyStep(next, 'level') : next; }); }} className="rounded-2xl border border-[#dadce0] bg-white p-5 text-left text-[#202124]">{answer}</button>)}</div></section>); }
  if (mode === 'level') return shell(<JourneyLevelSelector levels={journeyLevels} selectedId={journey.levelId} onSelect={(id) => { if (id !== journey.levelId) { updateJourney((current) => ({ ...current, levelId: id })); void playJourneySfx('select'); } }} onContinue={() => { void playJourneySfx('levelConfirm'); navigate('tone'); }} />);
  if (mode === 'tone') return shell(<CoachToneSelector tones={coachTones} selectedId={journey.toneId} onSelect={(id) => { if (id !== journey.toneId) { updateJourney((current) => ({ ...current, toneId: id })); void playJourneySfx('coachSelect'); } }} onContinue={() => { void playJourneySfx('plannerStart'); updateJourney((current) => moveJourneyStep({ ...current, plannerStarted: true }, 'loading')); }} />);
  if (mode === 'loading') return shell(<section className="py-32 text-center"><h1 className="text-3xl font-black text-[#202124]">나만의 구글러 여정을 준비하고 있어요</h1><p className="mt-8 animate-pulse text-[#1a73e8]">첫 미션을 고르고 있어요.</p></section>);
  return shell(<section className="mx-auto max-w-4xl"><p className="font-bold text-[#1a73e8]">{tone.name}의 첫 안내</p><h1 className="mt-3 text-4xl font-black text-[#202124]">Google 학습 플래너가 완성됐어요</h1><p className="mt-3 text-[#5f6368]">{level.name} · 예상 완료 {level.duration}</p><div className="mt-10 grid gap-5 md:grid-cols-2"><div className="rounded-3xl bg-white p-7 shadow-sm"><h2 className="text-xl font-black text-[#202124]">이번 주 학습 일정</h2><p className="mt-4 text-[#5f6368]">{level.example}</p></div><div className="rounded-3xl bg-[#e8f0fe] p-7"><h2 className="text-xl font-black text-[#202124]">오늘의 첫 미션</h2><p className="mt-4 text-[#202124]">{tone.line}</p><button onClick={() => { void playJourneySfx('lessonComplete'); updateJourney((current) => moveJourneyStep({ ...current, completed: true }, 'legacy')); }} className="mt-8 rounded-xl bg-[#1a73e8] px-5 py-3 font-bold text-white">기존 학습 공간으로 가기</button></div></div></section>);
}
