import { ExternalLink, Rocket } from 'lucide-react';

export function StartPage() {
  return (
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

  );
}
