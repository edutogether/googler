import type { JourneyLevel } from '../../content/journeyLevels';

type JourneyLevelSelectorProps = {
  levels: readonly JourneyLevel[];
  selectedId: JourneyLevel['id'];
  onSelect: (id: JourneyLevel['id']) => void;
  onContinue: () => void;
};

export function JourneyLevelSelector({ levels, selectedId, onSelect, onContinue }: JourneyLevelSelectorProps) {
  const selectedIndex = Math.max(0, levels.findIndex((level) => level.id === selectedId));
  const selectOffset = (offset: number) => onSelect(levels[(selectedIndex + offset + levels.length) % levels.length].id);

  return (
    <section className="mx-auto max-w-6xl">
      <p className="text-sm font-bold text-[#1a73e8]">진단을 바탕으로 추천했어요</p>
      <h1 className="mt-2 text-3xl font-black text-[#202124]">나에게 맞는 출발 단계를 골라볼까요?</h1>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm text-[#5f6368]">카드를 눌러 언제든 다른 단계로 바꿀 수 있어요.</p>
        <div className="flex shrink-0 gap-2" aria-label="출발 단계 이동">
          <button aria-label="이전 출발 단계" onClick={() => selectOffset(-1)} className="rounded-full border border-[#dadce0] bg-white px-3 py-2 text-[#1a73e8]">←</button>
          <button aria-label="다음 출발 단계" onClick={() => selectOffset(1)} className="rounded-full border border-[#dadce0] bg-white px-3 py-2 text-[#1a73e8]">→</button>
        </div>
      </div>
      <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:overflow-visible" onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') selectOffset(-1);
        if (event.key === 'ArrowRight') selectOffset(1);
      }}>
        {levels.map((level, index) => {
          const selected = level.id === selectedId;
          return <button key={level.id} onClick={() => onSelect(level.id)} className={`min-w-[84%] snap-center rounded-3xl border-2 p-5 text-left transition md:min-w-0 ${selected ? 'border-[#1a73e8] bg-[#e8f0fe] shadow-lg md:-translate-y-2' : 'border-[#dadce0] bg-white opacity-80 hover:opacity-100'} ${index === selectedIndex ? 'ring-1 ring-[#1a73e8]/20' : ''}`}>
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${selected ? 'bg-[#1a73e8]' : 'bg-[#dadce0]'}`} />
            <p className="mt-3 text-xs font-bold text-[#1967d2]">{selected ? '추천 출발 단계' : '출발 단계'}</p>
            <h2 className="mt-1 text-xl font-black text-[#202124]">{level.name}</h2>
            <p className="mt-3 text-sm leading-6 text-[#5f6368]">{level.description}</p>
            <p className="mt-4 text-sm font-bold text-[#202124]">시작 예시</p><p className="mt-1 text-sm leading-6 text-[#5f6368]">{level.example}</p>
            <p className="mt-4 text-sm font-bold text-[#202124]">추천 이유</p><p className="mt-1 text-sm leading-6 text-[#5f6368]">{level.recommendation}</p>
            <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-[#dadce0] pt-4 text-xs text-[#5f6368]"><div><dt>예상 기간</dt><dd className="mt-1 font-bold text-[#202124]">{level.duration}</dd></div><div><dt>학습 횟수</dt><dd className="mt-1 font-bold text-[#202124]">{level.weeklySessions}</dd></div><div><dt>하루 시간</dt><dd className="mt-1 font-bold text-[#202124]">{level.dailyMinutes}</dd></div></dl>
          </button>;
        })}
      </div>
      <button onClick={onContinue} className="mt-5 rounded-xl bg-[#1a73e8] px-6 py-3 font-bold text-white">이 단계로 여정 만들기</button>
    </section>
  );
}
