import { AlertCircle, HeartHandshake, Share2, Users } from 'lucide-react';

type RetryPageProps = {
  onPassShare: () => void;
};

export function RetryPage({ onPassShare }: RetryPageProps) {
  return (
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
            <button onClick={onPassShare} className="w-full bg-[#FEE500] hover:bg-[#F4DC00] text-[#371D1E] font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95">
              <Share2 className="w-5 h-5" />
              재도전 성공! 단톡방에 합격 자랑하기 🎉
            </button>
            <p className="text-center text-xs text-white/50 mt-3 font-bold">버튼을 누르면 내 캐릭터에 멋진 뱃지(🥇/👑)가 달립니다!</p>
          </div>
        </div>

  );
}
