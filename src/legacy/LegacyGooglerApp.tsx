import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Award, BookOpen, CheckCircle, HeartHandshake, Rocket, Settings, Trophy } from 'lucide-react';

import { coursesByLevel } from '../content/courses';
import { courses } from '../content/courses';
import { completedMissionIds, countCompletedMissions, isDayComplete as isLearningDayComplete, missionStorageKey, progressPercent as calculateProgressPercent, shouldCelebrateDayCompletion } from '../domain/progress';
import { levelShareMessage, missionShareMessage } from '../shared/sharing';
import { createAppServices } from '../data/createAppServices';
import { LearningPage } from '../pages/LearningPage';
import { StartPage } from '../pages/StartPage';
import { ExamPage } from '../pages/ExamPage';
import { RetryPage } from '../pages/RetryPage';
import { ProfileEditor } from '../features/profile/ProfileEditor';
import { CompletionCelebration } from '../features/learning/CompletionCelebration';
import { LeaderboardPage } from '../pages/LeaderboardPage';
import type { LeaderboardEntry } from '../data/appServices';
import type { LearningDay } from '../domain/course';

export default function LegacyGooglerApp() {
  const [user, setUser] = useState<{ uid: string } | null>(null);
  const [userProfile, setUserProfile] = useState({ nickname: "", emoji: "" });
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const [showRanking, setShowRanking] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<'L1' | 'L2'>('L1');
  const [activeTab, setActiveTab] = useState('intro');

  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const saveTimerRef = useRef<number | undefined>(undefined);

  const services = useMemo(() => createAppServices(), []);

  useEffect(() => () => window.clearTimeout(saveTimerRef.current), []);

  useEffect(() => services.subscribeToSession(async (uid) => {
    setUser(uid ? { uid } : null);
    if (!uid) { setIsLoading(false); return; }
    try {
      const profile = await services.profiles.get(uid);
      if (profile?.nickname) { setUserProfile(profile); setShowProfileSetup(false); }
      else setShowProfileSetup(true);
    } catch { setShowProfileSetup(true); }
    setIsLoading(false);
  }), [services]);

  useEffect(() => {
    if (!user) return;
    const unsubProgress = services.progress.subscribe(user.uid, (next) => { setProgress(next); setIsLoading(false); });
    return () => unsubProgress();
  }, [services, user]);

  // Only listens while the ranking tab is actually open — a session-long
  // leaderboard subscription meant every other participant's progress save
  // fanned out a read to every open tab regardless of whether anyone was
  // looking at the board (see COMMON_STANDARDS.md-driven audit, 확장성/비용
  // finding).
  useEffect(() => {
    if (!user || !showRanking) return;
    return services.leaderboard.subscribe(setRankings);
  }, [services, user, showRanking]);
  const handleSaveProfile = async (selectedEmoji: string, nicknameInput: string) => {
    if (!nicknameInput.trim()) {
      showToastMsg("닉네임을 입력해주세요!");
      return;
    }

    if (user) {
      const profile = { nickname: nicknameInput, emoji: selectedEmoji };
      try {
        await services.profiles.save(user.uid, profile);
        await services.leaderboard.save({ uid: user.uid, ...profile });
      } catch (error) {
        console.error("프로필 저장 실패:", error);
        showToastMsg("프로필 저장에 실패했어요. 다시 시도해주세요 😢");
        return;
      }
    }

    setUserProfile({ nickname: nicknameInput, emoji: selectedEmoji });
    setShowProfileSetup(false);
    showToastMsg(`환영합니다!`);
  };

  const completedIds = completedMissionIds(progress, courses);
  const l1Completed = countCompletedMissions(completedIds, coursesByLevel.L1);
  const l2Completed = countCompletedMissions(completedIds, coursesByLevel.L2);
  const currentLevelMissions = currentLevel === 'L1' ? l1Completed : l2Completed;
  const currentProgressPercent = calculateProgressPercent(completedIds, coursesByLevel[currentLevel]);

  const showToastMsg = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const copyToClipboard = (text: string) => {
    if(textAreaRef.current) {
      textAreaRef.current.value = text;
      textAreaRef.current.select();
      try {
        document.execCommand('copy');
        showToastMsg("✨ 클립보드에 복사되었습니다! 붙여넣기 해주세요.");
      } catch (err) {
        showToastMsg("복사 실패 😢 직접 복사해주세요.");
      }
    }
  };

  const invokeNativeShare = async (title: string, text: string) => {
    const currentUrl = window.location.href.split('?')[0];
    const shareText = text + "\n\n🔗 접속 링크:\n" + currentUrl;
    const isIframe = window.self !== window.top;

    if (navigator.share && !isIframe) {
      try {
        await navigator.share({ title, text: shareText });
      } catch (error) {
        const errorName = error instanceof DOMException || error instanceof Error ? error.name : undefined;
        if (errorName !== 'AbortError') copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const handleKakaoShare = (dayItem: LearningDay, index: number) => {
    const message = missionShareMessage(dayItem.title, index + 1, currentProgressPercent);
    invokeNativeShare(message.title, message.text);
  };

  const handlePassShare = async () => {
    if (user) {
      const newProgress = { ...progress, [`passed${currentLevel}`]: true };
      setProgress(newProgress);

      try {
        await services.progress.save(user.uid, newProgress);
        await services.leaderboard.save({ uid: user.uid, ...userProfile, [`passed${currentLevel}`]: true });
      } catch (error) {
        console.error("합격 기록 저장 실패:", error);
        showToastMsg("합격 기록 저장에 실패했어요. 잠시 후 다시 시도해주세요 😢");
      }

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }

    const message = levelShareMessage(currentLevel);
    invokeNativeShare(message.title, message.text);
  };

  const persistProgress = async (uid: string, nextProgress: Record<string, boolean>) => {
    try {
      await services.progress.save(uid, nextProgress);

      const updatedIds = completedMissionIds(nextProgress, courses);
      const l1Score = countCompletedMissions(updatedIds, coursesByLevel.L1);
      const l2Score = countCompletedMissions(updatedIds, coursesByLevel.L2);

      await services.leaderboard.save({
        uid,
        nickname: userProfile.nickname,
        emoji: userProfile.emoji,
        scoreL1: l1Score,
        scoreL2: l2Score,
        passedL1: nextProgress.passedL1 || false,
        passedL2: nextProgress.passedL2 || false
      });
    } catch (error) {
      console.error("데이터 저장 실패:", error);
      showToastMsg("저장에 실패했어요. 인터넷 연결을 확인해주세요 😢");
    }
  };

  const toggleCheck = (dayId: string, checkIndex: number) => {
    if (!user) return;

    const key = `${currentLevel}_${dayId}_${checkIndex}`;
    const day = coursesByLevel[currentLevel].days.find((item) => item.progressKey === dayId);
    const previousIds = completedMissionIds(progress, courses);
    const isNowChecked = !progress[key];
    const newProgress = { ...progress, [key]: isNowChecked };
    setProgress(newProgress);

    if (isNowChecked && day && shouldCelebrateDayCompletion(previousIds, completedMissionIds(newProgress, courses), day)) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    // Debounced: a learner ticking several boxes in quick succession
    // previously fired two Firestore writes (progress + leaderboard) per
    // click, each fanning out to every open leaderboard subscription. Only
    // the last state in a burst actually needs to be persisted.
    const uid = user.uid;
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => { void persistProgress(uid, newProgress); }, 600);
  };

  const tabs = [
    { id: 'intro', label: '시작하기', icon: Rocket },
    { id: 'learning', label: '무엇을 배울까?', icon: BookOpen },
    { id: 'week3', label: '시험 응시', icon: Award },
    { id: 'week4', label: '재도전', icon: HeartHandshake },
  ];

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-[#5F6368] font-bold text-lg animate-pulse">데이터를 불러오는 중입니다... ☁️</div>;
  }


  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#202124] pb-24 selection:bg-[#E8F0FE]">

      {showProfileSetup && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl flex flex-col items-center relative">
            <h2 className="text-2xl font-black mb-2 text-[#202124]">{userProfile.nickname ? '프로필 수정 ⚙️' : '환영합니다! 👋'}</h2>
            <p className="text-[#5F6368] text-sm text-center mb-6">{userProfile.nickname ? '랭킹에 표시될 동물 아이콘과 닉네임을 변경해보세요.' : '여정을 시작하기 전, 랭킹에 표시될\n동물 아이콘과 닉네임을 골라주세요.'}</p>
            <ProfileEditor onSave={handleSaveProfile} initialNickname={userProfile.nickname} initialEmoji={userProfile.emoji} onCancel={() => setShowProfileSetup(false)} canCancel={!!userProfile.nickname} />
          </div>
        </div>
      )}

      <textarea ref={textAreaRef} className="absolute left-[-9999px]" readOnly />

      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#202124] text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-fade-in-up font-medium text-sm w-max max-w-[90vw]">
          <CheckCircle className="w-5 h-5 text-[#81C995]" />
          {toastMsg}
        </div>
      )}

      <CompletionCelebration visible={showConfetti} />

      <nav className="bg-white border-b border-[#E8EAED] sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4">

            <div className="flex justify-between items-center w-full md:w-auto">
              <div className="flex items-center gap-2 cursor-default select-none">
                <div className="flex text-2xl font-bold tracking-tighter">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC05]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                </div>
                <span className="text-[#5F6368] font-medium text-lg pt-1">Educator Maker</span>
              </div>
              <button onClick={() => setShowProfileSetup(true)} className="md:hidden p-2 text-[#5F6368] hover:bg-[#F1F3F4] rounded-full transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex bg-[#F1F3F4] p-1.5 rounded-2xl w-full md:w-auto shadow-inner gap-1">
                <button
                  onClick={() => { setCurrentLevel('L1'); setShowRanking(false); }}
                  className={`flex-1 md:w-28 py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${!showRanking && currentLevel === 'L1' ? 'bg-white text-[#1A73E8] shadow-sm' : 'text-[#5F6368] hover:text-[#202124]'}`}
                >
                  <span className="text-sm font-bold">🎓 Level 1</span>
                </button>
                <button
                  onClick={() => { setCurrentLevel('L2'); setShowRanking(false); }}
                  className={`flex-1 md:w-28 py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${!showRanking && currentLevel === 'L2' ? 'bg-white text-[#D93025] shadow-sm' : 'text-[#5F6368] hover:text-[#202124]'}`}
                >
                  <span className="text-sm font-bold">🚀 Level 2</span>
                </button>
                <button
                  onClick={() => setShowRanking(true)}
                  className={`flex-1 md:w-32 py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${showRanking ? 'bg-gradient-to-r from-[#FBBC05] to-[#F9AB00] text-white shadow-md' : 'text-[#5F6368] hover:text-[#202124]'}`}
                >
                  <span className="text-sm font-bold flex items-center gap-1"><Trophy className="w-4 h-4"/> 랭킹보기</span>
                </button>
              </div>
              <button onClick={() => setShowProfileSetup(true)} className="hidden md:block p-2 text-[#5F6368] hover:bg-[#F1F3F4] rounded-full transition-colors shrink-0">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>

          {!showRanking && (
            <div className="pb-4 animate-fade-in">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold text-[#5F6368]">{currentLevel} 달성률 (30개 미션)</span>
                <span className={`text-lg font-black ${currentLevel === 'L1' ? 'text-[#1A73E8]' : 'text-[#D93025]'}`}>
                  {currentProgressPercent}%
                </span>
              </div>
              <div className="w-full bg-[#E8EAED] rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${currentLevel === 'L1' ? 'bg-[#4285F4]' : 'bg-[#EA4335]'}`}
                  style={{ width: `${currentProgressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </nav>

      {showRanking ? (
        <LeaderboardPage rankings={rankings} userId={user?.uid} />
      ) : (

        <>
          <div className="max-w-3xl mx-auto px-4 py-5">
            <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const activeBg = tab.id === 'intro' ? 'bg-[#FCE8E6] text-[#C5221F] border-[#FAD2CF]' : (currentLevel === 'L1' ? 'bg-[#E8F0FE] text-[#1967D2] border-[#D2E3FC]' : 'bg-[#FCE8E6] text-[#C5221F] border-[#FAD2CF]');

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all border ${
                      isActive
                        ? activeBg
                        : 'bg-white text-[#5F6368] border-transparent hover:bg-[#F1F3F4] hover:border-[#E8EAED] shadow-sm'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? (tab.id === 'intro' ? 'text-[#C5221F]' : (currentLevel === 'L1' ? 'text-[#1967D2]' : 'text-[#C5221F]')) : 'text-[#9AA0A6]'}`} />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          <main className="max-w-3xl mx-auto px-4 space-y-6">

            {activeTab === 'intro' && <StartPage />}
            {activeTab === 'learning' && (
              <LearningPage
                currentLevel={currentLevel}
                completedIds={completedIds}
                progress={progress}
                onToggleCheck={toggleCheck}
                onShare={handleKakaoShare}
              />
            )}

            {activeTab === 'week3' && <ExamPage onPassShare={handlePassShare} />}
            {activeTab === 'week4' && <RetryPage onPassShare={handlePassShare} />}
          </main>
        </>
      )}
    </div>
  );
}
