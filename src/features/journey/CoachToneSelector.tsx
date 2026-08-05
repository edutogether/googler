import type { CoachTone } from '../../content/coachTones';

type CoachToneSelectorProps = {
  tones: readonly CoachTone[];
  selectedId: CoachTone['id'];
  onSelect: (id: CoachTone['id']) => void;
  onContinue: () => void;
};

export function CoachToneSelector({ tones, selectedId, onSelect, onContinue }: CoachToneSelectorProps) {
  return (
    <section className="mx-auto max-w-5xl">
      <p className="text-sm font-bold text-[#1a73e8]">플래너를 함께 만들 코치</p>
      <h1 className="mt-2 text-3xl font-black text-[#202124]">어떤 코치와 함께할까요?</h1>
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {tones.map((tone) => {
          const selected = tone.id === selectedId;
          return <button key={tone.id} onClick={() => onSelect(tone.id)} className={`rounded-3xl border-2 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 ${selected ? `${tone.selectedClass} shadow-md` : 'border-[#dadce0]'}`}>
            <span className={`inline-block h-2.5 w-10 rounded-full ${tone.accentClass}`} />
            <h2 className="mt-4 text-xl font-black text-[#202124]">{tone.name}</h2>
            <p className="mt-3 text-sm leading-6 text-[#5f6368]">{tone.description}</p>
            <blockquote className="mt-5 rounded-2xl bg-white/80 p-4 text-sm font-medium leading-6 text-[#202124]">“{tone.line}”</blockquote>
          </button>;
        })}
      </div>
      <button onClick={onContinue} className="mt-8 rounded-xl bg-[#1a73e8] px-6 py-3 font-bold text-white">이 코치와 함께하기</button>
    </section>
  );
}
