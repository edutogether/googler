import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, Play, BookOpen, Users, Award, 
  Calendar, CheckSquare, Rocket, Trophy, HeartHandshake, AlertCircle,
  Share2, Check, ExternalLink, HelpCircle, MonitorPlay, Flag, Medal,
  Crown, Settings, X, Dices
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot } from 'firebase/firestore';

// 배포 시 여기에 파이어베이스 프로젝트 설정값을 반드시 채워주세요!
const firebaseConfig = {
  // apiKey: "YOUR_API_KEY",
  // authDomain: "YOUR_AUTH_DOMAIN",
  // projectId: "YOUR_PROJECT_ID",
  // storageBucket: "YOUR_STORAGE_BUCKET",
  // messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  // appId: "YOUR_APP_ID"
}; 

let app, auth, db;
const appId = 'gpass-custom-app-id';

try {
  if (Object.keys(firebaseConfig).length > 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (e) {
  console.error("Firebase 초기화 에러 (설정값을 확인하세요):", e);
}

// 💬 체크리스트 3종류
const defaultChecklist = [
  "공식 도움말 살펴보기 완료 ! 💡",
  "유튜브 영상 콘텐츠 따라하기 완료 ! 📺",
  "공식 가이드 콘텐츠 실습하기 완료 ! 🖱️"
];

// 랜덤 닉네임 및 이모지 데이터
const adjectives = ["열정적인", "발랄한", "똑똑한", "용감한", "빛나는", "멋진", "귀여운", "성실한", "무적의", "날쌘", "행복한", "명랑한"];
const animals = [
  { name: "토끼", emoji: "🐰" }, { name: "다람쥐", emoji: "🐿️" }, { name: "고양이", emoji: "🐱" }, 
  { name: "강아지", emoji: "🐶" }, { name: "여우", emoji: "🦊" }, { name: "오리", emoji: "🦆" }, 
  { name: "펭귄", emoji: "🐧" }, { name: "판다", emoji: "🐼" }, { name: "코알라", emoji: "🐨" }, 
  { name: "거북이", emoji: "🐢" }, { name: "병아리", emoji: "🐥" }, { name: "햄스터", emoji: "🐹" }
];
const animalEmojis = animals.map(a => a.emoji);

const curriculumData = {
  L1: {
    learning: [
      { id: 'l1_1', day: '월요일', theme: 'blue', title: '크롬 & 구글 드라이브', desc: '크롬 동기화, 파일 업로드 및 폴더 공유하기', links: { edu: 'https://skillshop.exceedlms.com/student/path/61209-google-workspace', help: 'https://support.google.com/drive/answer/2424368?hl=ko', youtube: 'https://www.youtube.com/results?search_query=구글+공인+교육자+level+1+크롬+드라이브' } },
      { id: 'l1_2', day: '화요일', theme: 'blue', title: '구글 문서 (Docs)', desc: '문서 공동 편집, 댓글 및 제안 모드 활용', links: { edu: 'https://skillshop.exceedlms.com/student/path/61209-google-workspace', help: 'https://support.google.com/docs/answer/7068618?hl=ko', youtube: 'https://www.youtube.com/results?search_query=구글+공인+교육자+level+1+구글+문서' } },
      { id: 'l1_3', day: '수요일', theme: 'yellow', title: '구글 프레젠테이션', desc: '슬라이드 테마 적용, 애니메이션 및 동영상 삽입', links: { edu: 'https://skillshop.exceedlms.com/student/path/61209-google-workspace', help: 'https://support.google.com/docs/answer/2720754?hl=ko', youtube: 'https://www.youtube.com/results?search_query=구글+공인+교육자+level+1+프레젠테이션' } },
      { id: 'l1_4', day: '목요일', theme: 'purple', title: '구글 설문지 (Forms)', desc: '설문지 만들고 퀴즈로 설정하여 자동 채점하기', links: { edu: 'https://skillshop.exceedlms.com/student/path/61209-google-workspace', help: 'https://support.google.com/docs/answer/6281888?hl=ko', youtube: 'https://www.youtube.com/results?search_query=구글+공인+교육자+level+1+설문지' } },
      { id: 'l1_5', day: '금요일', theme: 'green', title: '구글 클래스룸', desc: '수업 개설, 학생 초대, 자료 및 과제 게시하기', links: { edu: 'https://skillshop.exceedlms.com/student/path/61209-google-workspace', help: 'https://support.google.com/edu/classroom/answer/6020279?hl=ko', youtube: 'https://www.youtube.com/results?search_query=구글+공인+교육자+level+1+클래스룸' } },
      { id: 'l1_6', day: '월요일', theme: 'red', title: '지메일 (Gmail)', desc: '라벨 관리, 중요 필터 설정, 내 서명 만들기', links: { edu: 'https://skillshop.exceedlms.com/student/path/61209-google-workspace', help: 'https://support.google.com/mail/answer/8395?hl=ko', youtube: 'https://www.youtube.com/results?search_query=구글+공인+교육자+level+1+지메일' } },
      { id: 'l1_7', day: '화요일', theme: 'blue', title: '구글 캘린더 & Tasks', desc: '일정 공유, 회의 예약, 할 일(Tasks) 연동', links: { edu: 'https://skillshop.exceedlms.com/student/path/61209-google-workspace', help: 'https://support.google.com/calendar/answer/2465776?hl=ko', youtube: 'https://www.youtube.com/results?search_query=구글+공인+교육자+level+1+캘린더' } },
      { id: 'l1_8', day: '수요일', theme: 'green', title: '구글 미트 (Meet)', desc: '화면 공유, 소모임 방 만들기', links: { edu: 'https://skillshop.exceedlms.com/student/path/61209-google-workspace', help: 'https://support.google.com/meet/answer/9302870?hl=ko', youtube: 'https://www.youtube.com/results?search_query=구글+공인+교육자+level+1+미트' } },
      { id: 'l1_9', day: '목요일', theme: 'indigo', title: '구글 사이트 도구', desc: '나만의 멋진 학급 포트폴리오 사이트 제작', links: { edu: 'https://skillshop.exceedlms.com/student/path/61209-google-workspace', help: 'https://support.google.com/sites/answer/90569?hl=ko', youtube: 'https://www.youtube.com/results?search_query=구글+공인+교육자+level+1+사이트도구' } },
      { id: 'l1_10', day: '금요일', theme: 'yellow', title: '구글 그룹스 & 킵', desc: '게시판형 그룹 만들기, 스마트하게 메모', links: { edu: 'https://skillshop.exceedlms.com/student/path/61209-google-workspace', help: 'https://support.google.com/groups/answer/2464926?hl=ko', youtube: 'https://www.youtube.com/results?search_query=구글+공인+교육자+level+1+그룹스+킵' } },
    ]
  },
  L2: {
    learning: [
      { id: 'l2_1', day: '월요일', theme: 'blue', title: '드라이브 & 문서 심화', desc: '공유 드라이브 관리, 고급 문서 서식 및 번역', links: { edu: 'https://skillshop.exceedlms.com/student/path/61210-google-workspace-advanced', help: 'https://support.google.com/a/users/answer/9310156?hl=ko', youtube: 'https://www.youtube.com/results?search_query=구글+공인+교육자+level+2+드라이브+문서' } },
      { id: 'l2_2', day: '화요일', theme: 'green', title: '스프레드시트 심화', desc: '피벗 테이블, VLOOKUP 함수 데이터 분석', links: { edu: 'https://skillshop.exceedlms.com/student/path/61210-google-workspace-advanced', help: 'https://support.google.com/docs/answer/1272900?hl=ko', youtube: 'https://www.youtube.com/results?search_query=구글+공인+교육자+level+2+스프레드시트' } },
      { id: 'l2_3', day: '수요일', theme: 'purple', title: '설문지 & 클래스룸 심화', desc: '답변 기준 섹션 이동, 클래스룸 성적 채점표', links: { edu: 'https://skillshop.exceedlms.com/student/path/61210-google-workspace-advanced', help: 'https://support.google.com/docs/answer/141062?hl=ko', youtube: 'https://www.youtube.com/results?search_query=구글+공인+교육자+level+2+설문지+클래스룸' } },
      { id: 'l2_4', day: '목요일', theme: 'red', title: '유튜브 (YouTube)', desc: '교육용 채널 관리, 재생목록, 제한 모드 설정', links: { edu: 'https://skillshop.exceedlms.com/student/path/61210-google-workspace-advanced', help: 'https://support.google.com/youtube/answer/1646861?hl=ko', youtube: 'https://www.youtube.com/results?search_query=구글+공인+교육자+level+2+유튜브' } },
      { id: 'l2_5', day: '금요일', theme: 'indigo', title: '사이트 & 블로거 심화', desc: '고급 사이트 레이아웃, 교육용 블로그 구성', links: { edu: 'https://skillshop.exceedlms.com/student/path/61210-google-workspace-advanced', help: 'https://support.google.com/sites/answer/90569?hl=ko', youtube: 'https://www.youtube.com/results?search_query=구글+공인+교육자+level+2+사이트도구' } },
      { id: 'l2_6', day: '월요일', theme: 'green', title: '구글 어스 & 지도', desc: '프로젝트 만들기, 스트리트 뷰 활용 수업 설계', links: { edu: 'https://skillshop.exceedlms.com/student/path/61210-google-workspace-advanced', help: 'https://support.google.com/earth/answer/9398104?hl=ko', youtube: 'https://www.youtube.com/results?search_query=구글+공인+교육자+level+2+구글어스' } },
      { id: 'l2_7', day: '화요일', theme: 'blue', title: '지메일 & 캘린더 심화', desc: '맞춤 레이아웃, 예약 일정 블록', links: { edu: 'https://skillshop.exceedlms.com/student/path/61210-google-workspace-advanced', help: 'https://support.google.com/calendar/answer/10729749?hl=ko', youtube: 'https://www.youtube.com/results?search_query=구글+공인+교육자+level+2+캘린더' } },
      { id: 'l2_8', day: '수요일', theme: 'yellow', title: '미트 & 챗 스페이스', desc: '출석부 자동생성, Q&A 기능, 스페이스 활용', links: { edu: 'https://skillshop.exceedlms.com/student/path/61210-google-workspace-advanced', help: 'https://support.google.com/meet/answer/10091338?hl=ko', youtube: 'https://www.youtube.com/results?search_query=구글+공인+교육자+level+2+미트' } },
      { id: 'l2_9', day: '목요일', theme: 'indigo', title: '구글 트렌드 & 학술검색', desc: '데이터 트렌드 시각화, 학술자료 알리미', links: { edu: 'https://skillshop.exceedlms.com/student/path/61210-google-workspace-advanced', help: 'https://support.google.com/trends/?hl=ko', youtube: 'https://www.youtube.com/results?search_query=구글+공인+교육자+level+2+트렌드' } },
      { id: 'l2_10', day: '금요일', theme: 'red', title: '최종 복습 & 모의고사', desc: 'L2 전체 범위 정리 및 오답 노트 작성', links: { edu: 'https://skillshop.exceedlms.com/student/path/61210-google-workspace-advanced', help: 'https://support.google.com/a/answer/1382206?hl=ko', youtube: 'https://www.youtube.com/results?search_query=구글+공인+교육자+level+2+기출문제' } },
    ]
  }
};

const themeColors = {
  blue: { bg: 'bg-[#F4F7FB]', border: 'border-[#D2E3FC]', text: 'text-[#174EA6]', highlight: 'bg-[#E8F0FE]' },
  red: { bg: 'bg-[#FCF4F4]', border: 'border-[#FAD2CF]', text: 'text-[#A50E0E]', highlight: 'bg-[#FCE8E6]' },
  yellow: { bg: 'bg-[#FFFBF0]', border: 'border-[#FEF0C3]', text: 'text-[#E37400]', highlight: 'bg-[#FEF7E0]' },
  green: { bg: 'bg-[#F3F8F4]', border: 'border-[#CEEAD6]', text: 'text-[#0D652D]', highlight: 'bg-[#E6F4EA]' },
  purple: { bg: 'bg-[#F8F5FB]', border: 'border-[#E8DDF4]', text: 'text-[#681DA8]', highlight: 'bg-[#F3E8FD]' },
  indigo: { bg: 'bg-[#F4F5F9]', border: 'border-[#D9DBE9]', text: 'text-[#3E4A89]', highlight: 'bg-[#E8EAF6]' }
};

const barColors = [
  { fill: 'bg-red-400', bg: 'bg-red-50', border: 'border-red-200' },
  { fill: 'bg-orange-400', bg: 'bg-orange-50', border: 'border-orange-200' },
  { fill: 'bg-green-400', bg: 'bg-green-50', border: 'border-green-200' },
  { fill: 'bg-blue-400', bg: 'bg-blue-50', border: 'border-blue-200' },
  { fill: 'bg-purple-400', bg: 'bg-purple-50', border: 'border-purple-200' },
  { fill: 'bg-pink-400', bg: 'bg-pink-50', border: 'border-pink-200' },
  { fill: 'bg-teal-400', bg: 'bg-teal-50', border: 'border-teal-200' },
  { fill: 'bg-indigo-400', bg: 'bg-indigo-50', border: 'border-indigo-200' },
];

function ProfileSetupForm({ onSave, initialNickname, initialEmoji, onCancel, canCancel }) {
  const [selectedEmoji, setSelectedEmoji] = useState(initialEmoji || "🐰");
  const [nicknameInput, setNicknameInput] = useState(initialNickname || "");

  const handleRandomGen = () => {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    setNicknameInput(`${adj} ${animal.name}`);
    setSelectedEmoji(animal.emoji);
  };

  return (
    <div className="w-full space-y-5">
      {canCancel && (
        <button onClick={onCancel} className="absolute top-5 right-5 text-[#9AA0A6] hover:text-[#202124] transition-colors p-1 bg-[#F8F9FA] rounded-full">
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="grid grid-cols-4 gap-3 bg-[#F8F9FA] p-4 rounded-2xl border border-[#E8EAED]">
        {animals.map(animal => (
          <button 
            key={animal.emoji} 
            type="button"
            onClick={() => setSelectedEmoji(animal.emoji)}
            className={`text-3xl p-2 rounded-xl transition-all ${selectedEmoji === animal.emoji ? 'bg-[#E8F0FE] border-2 border-[#4285F4] scale-110 shadow-sm' : 'hover:bg-white border-2 border-transparent'}`}
          >
            {animal.emoji}
          </button>
        ))}
      </div>
      
      <div>
        <label className="block text-sm font-bold text-[#5F6368] mb-2">사용할 닉네임 입력 (또는 랜덤 생성)</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            placeholder="ex) 발랄한 다람쥐" 
            className="flex-1 px-4 py-3 rounded-xl border border-[#E8EAED] focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#E8F0FE] font-bold"
            maxLength={10}
          />
          <button type="button" onClick={handleRandomGen} className="px-4 py-3 flex items-center gap-1 bg-[#F1F3F4] hover:bg-[#E8EAED] text-[#5F6368] font-bold rounded-xl transition-colors whitespace-nowrap">
            <Dices className="w-4 h-4"/> 랜덤
          </button>
        </div>
      </div>

      <button 
        onClick={() => onSave(selectedEmoji, nicknameInput)}
        className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-extrabold py-3.5 rounded-xl shadow-md transition-transform active:scale-95 text-lg"
      >
        {canCancel ? "저장하기 💾" : "이 프로필로 시작하기 🚀"}
      </button>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState({ nickname: "", emoji: "" });
  const [showProfileSetup, setShowProfileSetup] = useState(false); 
  
  const [showRanking, setShowRanking] = useState(false); 
  const [currentLevel, setCurrentLevel] = useState('L1'); 
  const [activeTab, setActiveTab] = useState('intro'); 
  
  const [progress, setProgress] = useState({}); 
  const [rankings, setRankings] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  const textAreaRef = useRef(null);

  useEffect(() => {
    if (!auth) { setIsLoading(false); return; } // DB 연결 안되었을때 방어코드

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("인증 에러:", error);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && db) {
        try {
          const profileRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'info');
          const docSnap = await getDoc(profileRef);
          
          if (docSnap.exists() && docSnap.data().nickname) {
            setUserProfile({ nickname: docSnap.data().nickname, emoji: docSnap.data().emoji || "🐰" });
            setShowProfileSetup(false);
          } else {
            setShowProfileSetup(true);
          }
        } catch (e) {
          console.error(e);
          setShowProfileSetup(true);
        }
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    
    const progressRef = doc(db, 'artifacts', appId, 'users', user.uid, 'user_progress', 'gpass_data');
    const unsubProgress = onSnapshot(progressRef, (docSnap) => {
      if (docSnap.exists()) setProgress(docSnap.data().progress || {});
      setIsLoading(false);
    }, (error) => {
      console.error("데이터 로드 에러:", error);
      setIsLoading(false);
    });

    const rankingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'rankings');
    const unsubRankings = onSnapshot(rankingsRef, (querySnapshot) => {
      const ranks = [];
      querySnapshot.forEach((d) => ranks.push(d.data()));
      setRankings(ranks);
    }, (error) => console.error("랭킹 로드 에러:", error));
    
    return () => {
      unsubProgress();
      unsubRankings();
    };
  }, [user]);

  const handleSaveProfile = async (selectedEmoji, nicknameInput) => {
    if (!nicknameInput.trim()) {
      showToastMsg("닉네임을 입력해주세요!");
      return;
    }
    
    if (db && user) {
      const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info');
      await setDoc(profileRef, { nickname: nicknameInput, emoji: selectedEmoji });
      
      const rankRef = doc(db, 'artifacts', appId, 'public', 'data', 'rankings', user.uid);
      await setDoc(rankRef, {
        uid: user.uid,
        nickname: nicknameInput,
        emoji: selectedEmoji,
        updatedAt: Date.now()
      }, { merge: true });
    }

    setUserProfile({ nickname: nicknameInput, emoji: selectedEmoji });
    setShowProfileSetup(false);
    showToastMsg(`환영합니다!`);
  };

  const l1Completed = Object.keys(progress).filter(k => k.startsWith(`L1_`) && !k.startsWith('L1_passed') && progress[k]).length;
  const l2Completed = Object.keys(progress).filter(k => k.startsWith(`L2_`) && !k.startsWith('L2_passed') && progress[k]).length;
  const currentLevelMissions = currentLevel === 'L1' ? l1Completed : l2Completed;
  const progressPercent = Math.round((currentLevelMissions / 30) * 100) || 0;

  const showToastMsg = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const copyToClipboard = (text) => {
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

  const invokeNativeShare = async (title, text) => {
    const currentUrl = window.location.href.split('?')[0];
    const shareText = text + "\n\n🔗 접속 링크:\n" + currentUrl;
    const isIframe = window.self !== window.top; 
    
    if (navigator.share && !isIframe) {
      try {
        await navigator.share({ title, text: shareText });
      } catch (error) {
        if (error.name !== 'AbortError') copyToClipboard(shareText); 
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const handleKakaoShare = (dayItem, index) => {
    const title = `Google Educator Maker 미션 인증`;
    const text = `🚀 [Google Educator Maker]\n\n오늘 미션 클리어! ✌️✨\n👉 Day ${index + 1} - '${dayItem.title}'\n\n🔥 나의 현재 달성률: ${progressPercent}%\n얼른 들어와서 같이 구글 마스터 됩시다! 🏃‍♂️💨`;
    invokeNativeShare(title, text);
  };

  const handlePassShare = async () => {
    if (user && db) {
      const newProgress = { ...progress, [`passed${currentLevel}`]: true };
      setProgress(newProgress);
      
      const progressRef = doc(db, 'artifacts', appId, 'users', user.uid, 'user_progress', 'gpass_data');
      await setDoc(progressRef, { progress: newProgress }, { merge: true });

      const rankRef = doc(db, 'artifacts', appId, 'public', 'data', 'rankings', user.uid);
      await setDoc(rankRef, {
        [`passed${currentLevel}`]: true,
        updatedAt: Date.now()
      }, { merge: true });

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }

    const title = `Google Educator Maker 합격 인증`;
    const text = `🎉 꺄아악! 저 구글 교육자 ${currentLevel} 합격했어요!! 🏆✨\n\n같이 으쌰으쌰 해준 멤버들 덕분이에요! 💖\n아직 시험 안 보신 분들 제 꿀기운 팍팍 받아가세요! 무조건 할 수 있습니다! 화이팅!! 🚀`;
    invokeNativeShare(title, text);
  };

  const toggleCheck = async (dayId, checkIndex) => {
    if (!user) return;

    const key = `${currentLevel}_${dayId}_${checkIndex}`;
    const isNowChecked = !progress[key];
    const newProgress = { ...progress, [key]: isNowChecked };
    setProgress(newProgress);

    if (isNowChecked) {
      let dayCompleted = true;
      for(let i=0; i<3; i++) {
        if(i !== checkIndex && !newProgress[`${currentLevel}_${dayId}_${i}`]) dayCompleted = false;
      }
      if(dayCompleted) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }

    if (db) {
      try {
        const progressRef = doc(db, 'artifacts', appId, 'users', user.uid, 'user_progress', 'gpass_data');
        await setDoc(progressRef, { progress: newProgress }, { merge: true });

        const l1Score = Object.keys(newProgress).filter(k => k.startsWith('L1_') && !k.startsWith('L1_passed') && newProgress[k]).length;
        const l2Score = Object.keys(newProgress).filter(k => k.startsWith('L2_') && !k.startsWith('L2_passed') && newProgress[k]).length;
        
        const rankRef = doc(db, 'artifacts', appId, 'public', 'data', 'rankings', user.uid);
        await setDoc(rankRef, {
          uid: user.uid,
          nickname: userProfile.nickname,
          emoji: userProfile.emoji,
          scoreL1: l1Score,
          scoreL2: l2Score,
          passedL1: newProgress.passedL1 || false,
          passedL2: newProgress.passedL2 || false,
          updatedAt: Date.now()
        }, { merge: true });

      } catch (error) {
        console.error("데이터 저장 실패:", error);
      }
    }
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

  const sortedRankings = [...rankings].sort((a, b) => {
    const totalA = (a.scoreL1 || 0) + (a.scoreL2 || 0);
    const totalB = (b.scoreL1 || 0) + (b.scoreL2 || 0);
    const passedCountA = (a.passedL1 ? 1 : 0) + (a.passedL2 ? 1 : 0);
    const passedCountB = (b.passedL1 ? 1 : 0) + (b.passedL2 ? 1 : 0);

    if (totalA !== totalB) return totalB - totalA;
    return passedCountB - passedCountA; 
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#202124] pb-24 selection:bg-[#E8F0FE]">
      
      {showProfileSetup && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl flex flex-col items-center relative">
            <h2 className="text-2xl font-black mb-2 text-[#202124]">
              {userProfile.nickname ? "프로필 수정 ⚙️" : "환영합니다! 👋"}
            </h2>
            <p className="text-[#5F6368] text-sm text-center mb-6">
              {userProfile.nickname 
                ? "랭킹에 표시될 동물 아이콘과 닉네임을 변경해보세요." 
                : "여정을 시작하기 전, 랭킹에 표시될\n동물 아이콘과 닉네임을 골라주세요."}
            </p>
            <ProfileSetupForm 
              onSave={handleSaveProfile} 
              initialNickname={userProfile.nickname} 
              initialEmoji={userProfile.emoji} 
              onCancel={() => setShowProfileSetup(false)}
              canCancel={!!userProfile.nickname}
            />
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

      {showConfetti && (
        <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-10 py-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 flex flex-col items-center animate-bounce border border-[#E8EAED]">
          <span className="text-6xl mb-3">🎉</span>
          <h2 className="text-xl font-bold text-[#202124] text-center">완벽하게 해냈어요!</h2>
          <p className="text-[#5F6368] text-sm mt-1">아래 공유 버튼으로 자랑해보세요!</p>
        </div>
      )}

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
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full bg-[#E8EAED] rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${currentLevel === 'L1' ? 'bg-[#4285F4]' : 'bg-[#EA4335]'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </nav>

      {showRanking ? (
        <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in space-y-6">
          <div className="bg-gradient-to-r from-[#34A853] to-[#1E8E3E] p-8 rounded-[2rem] shadow-sm text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent blur-xl"></div>
            <h2 className="text-2xl md:text-3xl font-black mb-2 relative z-10 flex justify-center items-center gap-2">
              <Flag className="w-8 h-8 text-white"/> Google Educator가 되기 위한 여정
            </h2>
            <p className="text-white/90 font-medium relative z-10 text-sm">L1과 L2를 합쳐 총 60개의 미션! 최종 목적지를 향해 달려요 🏁</p>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#E8EAED] space-y-4 relative">
            <div className="absolute right-[12%] top-6 bottom-6 w-1 bg-[#EA4335]/20 border-r-2 border-dashed border-[#EA4335] z-0 hidden sm:block"></div>
            <span className="absolute right-[9%] top-2 text-[10px] font-black text-[#EA4335] hidden sm:block">FINISH</span>

            {sortedRankings.length === 0 && <p className="text-center text-[#9AA0A6] py-10 font-bold">아직 레이스에 참여한 멤버가 없습니다! 🏃💨</p>}
            
            {sortedRankings.map((rank, idx) => {
              const totalScore = (rank.scoreL1 || 0) + (rank.scoreL2 || 0);
              const hasBoth = rank.passedL1 && rank.passedL2;
              const percent = hasBoth ? 100 : Math.min((totalScore / 60) * 85, 85); 
              const isMe = rank.uid === user?.uid;
              const colorTheme = barColors[idx % barColors.length];

              return (
                <div key={rank.uid} className={`relative w-full h-16 ${colorTheme.bg} rounded-2xl border ${colorTheme.border} overflow-hidden flex items-center shadow-sm ${isMe ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}>
                  <div className={`absolute left-0 top-0 bottom-0 ${colorTheme.fill} transition-all duration-1000 z-0 opacity-40`} style={{ width: `${percent}%`}}></div>
                  
                  <div className="absolute left-4 font-black text-sm text-[#202124] z-10 flex items-center gap-2">
                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs text-white shadow-sm ${idx === 0 ? 'bg-[#FBBC05]' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-[#CD7F32]' : 'bg-[#BDC1C6]'}`}>
                      {idx + 1}
                    </span>
                    <span className="bg-white/90 px-2.5 py-1 rounded-lg shadow-sm whitespace-nowrap border border-[#E8EAED] flex items-center gap-1">
                      {rank.nickname} 
                      {isMe && <span className="text-[#1A73E8] text-xs">(나)</span>}
                    </span>
                  </div>

                  <div className="absolute z-20 transition-all duration-1000 ease-out flex items-center justify-center" style={{ left: `calc(${percent}% - ${hasBoth ? '45px' : '20px'})` }}>
                    <div className="relative flex items-center justify-center">
                      <span className="text-3xl drop-shadow-md relative z-10">{rank.emoji || '🏃'}</span>
                      
                      {hasBoth && (
                        <span className="absolute -top-4 -right-1 text-2xl drop-shadow-md animate-bounce z-20" style={{ transform: 'rotate(15deg)' }}>👑</span>
                      )}
                      
                      {!hasBoth && rank.passedL1 && (
                        <span className="absolute -bottom-1 -right-2 text-xl drop-shadow-md z-20">🥇</span>
                      )}
                      {!hasBoth && !rank.passedL1 && rank.passedL2 && (
                        <span className="absolute -bottom-1 -right-2 text-xl drop-shadow-md z-20">🥈</span>
                      )}
                    </div>
                  </div>

                  <div className="absolute right-4 font-black text-sm z-10 bg-white/90 px-2 py-1 rounded-lg border border-[#E8EAED] text-xs shadow-sm">
                    {totalScore} / 60
                  </div>
                </div>
              )
            })}
          </div>
        </div>
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
            
            {activeTab === 'intro' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#E8EAED] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8F0FE] rounded-bl-full -z-10 opacity-70"></div>
                  <h2 className="text-2xl font-extrabold mb-8 flex items-center gap-2 text-[#202124]">
                    <Rocket className="w-7 h-7 text-[#4285F4]" />
                    시험 준비, 차근차근 시작해요
                  </h2>
                  <div className="space-y-6">
                    <div className="flex gap-5 group">
                      <div className="bg-[#E8F0FE] text-[#1A73E8] font-black text-xl w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">1</div>
                      <div className="pt-1">
                        <h3 className="font-bold text-lg text-[#202124]">개인 구글 계정 준비</h3>
                        <p className="text-[#5F6368] mt-1.5 leading-relaxed text-sm">학교 계정은 나중에 시험 결제가 막힐 수 있습니다. 반드시 **개인 Gmail 계정**으로 진행해 주세요.</p>
                      </div>
                    </div>
                    <div className="flex gap-5 group">
                      <div className="bg-[#FCE8E6] text-[#D93025] font-black text-xl w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">2</div>
                      <div className="pt-1">
                        <h3 className="font-bold text-lg text-[#202124]">학습 센터(Skillshop) 연동</h3>
                        <p className="text-[#5F6368] mt-1.5 leading-relaxed text-sm">구글 공식 교육 플랫폼에 내 계정을 연결합니다.</p>
                        <a href="https://skillshop.exceedlms.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-sm font-bold text-[#1A73E8] bg-[#E8F0FE] hover:bg-[#D2E3FC] px-4 py-2 rounded-xl transition-colors">
                          스킬샵 바로가기 <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                    <div className="flex gap-5 group">
                      <div className="bg-[#FEF7E0] text-[#E37400] font-black text-xl w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">3</div>
                      <div className="pt-1">
                        <h3 className="font-bold text-lg text-[#202124]">언어 설정 확인 (필수)</h3>
                        <p className="text-[#5F6368] mt-1.5 leading-relaxed text-sm">우측 상단 내 프로필을 눌러 언어가 **'한국어'**로 설정되어 있는지 꼭 확인하세요.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'learning' && (
              <div className="space-y-6 animate-fade-in">
                <div className={`p-8 rounded-[2rem] shadow-sm text-white relative overflow-hidden ${currentLevel === 'L1' ? 'bg-gradient-to-r from-[#1A73E8] to-[#4285F4]' : 'bg-gradient-to-r from-[#EA4335] to-[#f06b60]'}`}>
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                  <h2 className="text-2xl font-extrabold mb-2 relative z-10">핵심 역량 마스터 코스 🌱</h2>
                  <p className="text-white/90 relative z-10 font-medium text-sm">하루 30분, 매일매일 미션을 깨고 랭킹 점수를 획득하세요!</p>
                </div>

                <div className="space-y-5">
                  {curriculumData[currentLevel].learning.map((dayItem, index) => {
                    const isDayComplete = defaultChecklist.every((_, idx) => progress[`${currentLevel}_${dayItem.id}_${idx}`]);
                    const theme = themeColors[dayItem.theme] || themeColors.blue;

                    return (
                      <div key={dayItem.id} className={`bg-white rounded-[2rem] shadow-sm border overflow-hidden transition-all duration-300 ${isDayComplete ? 'border-[#CEEAD6] shadow-[#E6F4EA]' : 'border-[#E8EAED] hover:shadow-md'}`}>
                        <div className={`p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isDayComplete ? 'bg-[#F3F8F4]' : theme.bg}`}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs font-extrabold px-3 py-1 rounded-lg tracking-wide ${isDayComplete ? 'bg-[#CEEAD6] text-[#0D652D]' : `${theme.highlight} ${theme.text}`}`}>
                                Day {index + 1}
                              </span>
                              {isDayComplete && <span className="flex items-center text-xs font-bold text-[#0D652D]"><Check className="w-3.5 h-3.5 mr-0.5" /> 100% 완료</span>}
                            </div>
                            <h3 className="text-xl font-extrabold text-[#202124] flex items-center gap-2">{dayItem.title}</h3>
                            <p className="text-sm text-[#5F6368] mt-1.5 font-medium">{dayItem.desc}</p>
                          </div>
                        </div>

                        <div className="px-6 md:px-8 py-4 border-y border-[#E8EAED] bg-white flex flex-wrap gap-2">
                          <a href={dayItem.links.help} target="_blank" rel="noreferrer" className="flex-1 min-w-[100px] flex flex-col items-center justify-center p-3 rounded-xl bg-[#F8F9FA] hover:bg-[#FCE8E6] text-[#5F6368] hover:text-[#D93025] transition-colors border border-[#E8EAED] group"><HelpCircle className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" /><span className="text-[11px] font-bold">공식 도움말</span></a>
                          <a href={dayItem.links.youtube} target="_blank" rel="noreferrer" className="flex-1 min-w-[100px] flex flex-col items-center justify-center p-3 rounded-xl bg-[#F8F9FA] hover:bg-[#FEF7E0] text-[#5F6368] hover:text-[#E37400] transition-colors border border-[#E8EAED] group"><MonitorPlay className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" /><span className="text-[11px] font-bold">영상 콘텐츠</span></a>
                          <a href={dayItem.links.edu} target="_blank" rel="noreferrer" className="flex-1 min-w-[100px] flex flex-col items-center justify-center p-3 rounded-xl bg-[#F8F9FA] hover:bg-[#E8F0FE] text-[#5F6368] hover:text-[#1A73E8] transition-colors border border-[#E8EAED] group"><BookOpen className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" /><span className="text-[11px] font-bold">공식 가이드</span></a>
                        </div>

                        <div className="p-6 md:p-8 bg-white">
                          <div className="space-y-3">
                            {defaultChecklist.map((checkText, idx) => {
                              const isChecked = progress[`${currentLevel}_${dayItem.id}_${idx}`] || false;
                              return (
                                <label key={idx} className={`flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border ${isChecked ? 'bg-[#F8F9FA] border-transparent shadow-none' : 'bg-white border-[#E8EAED] hover:border-[#DADCE0]'}`}>
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isChecked ? 'bg-[#34A853] border-[#34A853]' : 'border-[#DADCE0]'}`}>
                                    {isChecked && <Check className="w-4 h-4 text-white" />}
                                  </div>
                                  <input type="checkbox" className="hidden" checked={isChecked} onChange={() => toggleCheck(dayItem.id, idx)} />
                                  <span className={`text-sm font-medium transition-colors ${isChecked ? 'text-[#9AA0A6] line-through' : 'text-[#202124]'}`}>{checkText}</span>
                                </label>
                              )
                            })}
                          </div>
                          <div className="mt-6 pt-6 border-t border-[#E8EAED]">
                            <button 
                              onClick={() => handleKakaoShare(dayItem, index)}
                              disabled={!isDayComplete}
                              className={`w-full font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-transform text-lg ${isDayComplete ? 'bg-[#FEE500] hover:bg-[#F4DC00] text-[#371D1E] active:scale-95 cursor-pointer' : 'bg-[#F1F3F4] text-[#9AA0A6] cursor-not-allowed opacity-70'}`}
                            >
                              <Share2 className="w-6 h-6" />
                              {isDayComplete ? '미션 완료! 단톡방에 링크 공유하기 🎉' : '위 미션을 먼저 완료해주세요!'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeTab === 'week3' && (
              <div className="space-y-6 animate-fade-in">
                 <div className="bg-[#34A853] text-white p-10 rounded-[2rem] shadow-sm text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent blur-xl"></div>
                  <Medal className="w-16 h-16 mx-auto mb-4 text-[#FEF0C3] drop-shadow-md relative z-10" />
                  <h2 className="text-3xl font-black mb-2 relative z-10">D-Day: 다 함께 따는 날!</h2>
                  <p className="text-[#CEEAD6] font-medium relative z-10">각자 집에서, 하지만 마음은 함께! 화상으로 모여 시험을 치릅니다.</p>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#E8EAED]">
                  <h3 className="text-xl font-bold mb-6 text-[#202124] flex items-center gap-2"><Calendar className="w-6 h-6 text-[#9AA0A6]" /> Pass Party 일정표 🌙</h3>
                  <div className="relative border-l-2 border-[#E8EAED] ml-3 space-y-8 pb-4">
                    <div className="relative pl-6">
                      <div className="absolute w-4 h-4 bg-[#4285F4] rounded-full -left-[9px] top-1 border-4 border-white shadow-sm"></div>
                      <div className="flex items-center gap-2 mb-1"><span className="text-sm font-bold text-[#1A73E8] bg-[#E8F0FE] px-2.5 py-0.5 rounded-md">밤 9:00</span></div>
                      <h4 className="font-bold text-lg text-[#202124] mb-1">화상회의 접속 및 접수</h4>
                      <p className="text-[#5F6368] text-sm leading-relaxed">다같이 모여서 인사를 나누고, 공지된 바우처(쿠폰)를 등록해 무료로 시험 결제를 진행해요.</p>
                    </div>
                    <div className="relative pl-6">
                      <div className="absolute w-4 h-4 bg-[#EA4335] rounded-full -left-[9px] top-1 border-4 border-white shadow-sm"></div>
                      <div className="flex items-center gap-2 mb-1"><span className="text-sm font-bold text-[#D93025] bg-[#FCE8E6] px-2.5 py-0.5 rounded-md">밤 9:30</span></div>
                      <h4 className="font-bold text-lg text-[#202124] mb-1">시험 시작! (최대 3시간)</h4>
                      <p className="text-[#5F6368] text-sm leading-relaxed">마이크는 끄고 카메라는 켜둔 채로 집중해서 시험을 풉니다. 일찍 끝난 분은 먼저 나가셔도 좋아요!</p>
                    </div>
                    <div className="relative pl-6">
                      <div className="absolute w-4 h-4 bg-[#FBBC05] rounded-full -left-[9px] top-1 border-4 border-white shadow-sm"></div>
                      <div className="flex items-center gap-2 mb-1"><span className="text-sm font-bold text-[#E37400] bg-[#FEF7E0] px-2.5 py-0.5 rounded-md">실시간</span></div>
                      <h4 className="font-bold text-lg text-[#202124] mb-1">채팅 헬프 데스크 운영 🆘</h4>
                      <p className="text-[#5F6368] text-sm leading-relaxed">문제가 아니라 "다음 버튼이 안 눌려요" 같은 기술적 막힘이 생기면 채팅창에 질문하세요. 함께 문제를 해결합니다.</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-[#E8EAED] animate-fade-in-up">
                    <button onClick={handlePassShare} className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 text-lg">
                      <Trophy className="w-6 h-6 text-yellow-300" />
                      시험 끝! 단톡방에 합격 인증하기 🎉
                    </button>
                    <p className="text-center text-xs text-[#9AA0A6] mt-3 font-bold">버튼을 누르면 내 캐릭터에 멋진 뱃지(🥇/👑)가 달립니다!</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'week4' && (
              <div className="space-y-6 animate-fade-in">
                 <div className="bg-[#EA4335] text-white p-8 rounded-[2rem] shadow-sm text-center">
                  <HeartHandshake className="w-16 h-16 mx-auto mb-4 text-[#FAD2CF]" />
                  <h2 className="text-2xl font-black mb-2">여유로운 재도전 (보안관 주간) 🛡️</h2>
                  <p className="text-[#FCE8E6] font-medium">안타깝게 불합격하셨나요? 전혀 문제없습니다. 우리에겐 아직 시간이 있습니다!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#E8EAED] hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-[#FCE8E6] rounded-2xl flex items-center justify-center mb-4"><AlertCircle className="w-6 h-6 text-[#D93025]" /></div>
                    <h3 className="font-bold text-lg text-[#202124] mb-2">나의 약점 파악하기</h3>
                    <p className="text-sm text-[#5F6368] leading-relaxed">시험 종료 후 받은 이메일 리포트를 확인하세요. 점수가 낮았던 특정 Unit을 스킬샵에서 집중적으로 다시 읽어봅니다.</p>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#E8EAED] hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-[#E8F0FE] rounded-2xl flex items-center justify-center mb-4"><Users className="w-6 h-6 text-[#1A73E8]" /></div>
                    <h3 className="font-bold text-lg text-[#202124] mb-2">보안관 찬스 쓰기</h3>
                    <p className="text-sm text-[#5F6368] leading-relaxed">먼저 합격한 멤버들이 '보안관'으로 대기 중입니다. 단톡방에 질문을 남기면 Google Meet 화면 공유를 통해 1:1로 도와드릴 거예요.</p>
                  </div>
                </div>

                <div className="bg-[#202124] p-6 rounded-[2rem] text-center shadow-lg">
                  <p className="font-bold text-white tracking-wide mb-4">준비가 완료되었다면 주중에 마음 편히 재응시 하세요! 화이팅! 🚀</p>
                  <button onClick={handlePassShare} className="w-full bg-[#FEE500] hover:bg-[#F4DC00] text-[#371D1E] font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95">
                    <Share2 className="w-5 h-5" />
                    재도전 성공! 단톡방에 합격 자랑하기 🎉
                  </button>
                  <p className="text-center text-xs text-white/50 mt-3 font-bold">버튼을 누르면 내 캐릭터에 멋진 뱃지(🥇/👑)가 달립니다!</p>
                </div>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
}