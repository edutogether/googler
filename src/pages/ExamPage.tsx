import { Calendar, Medal, Trophy } from 'lucide-react';

type ExamPageProps = {
  onPassShare: () => void;
};

export function ExamPage({ onPassShare }: ExamPageProps) {
  return (
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
              <button onClick={onPassShare} className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 text-lg">
                <Trophy className="w-6 h-6 text-yellow-300" />
                시험 끝! 단톡방에 합격 인증하기 🎉
              </button>
              <p className="text-center text-xs text-[#9AA0A6] mt-3 font-bold">버튼을 누르면 내 캐릭터에 멋진 뱃지(🥇/👑)가 달립니다!</p>
            </div>
          </div>
        </div>

  );
}
