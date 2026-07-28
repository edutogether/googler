import { Dices, X } from 'lucide-react';
import { useState } from 'react';

const adjectives = ['열정적인', '발랄한', '똑똑한', '용감한', '빛나는', '멋진', '귀여운', '성실한', '무적의', '날쌘', '행복한', '명랑한'];
const animals = [{ name: '토끼', emoji: '🐰' }, { name: '다람쥐', emoji: '🐿️' }, { name: '고양이', emoji: '🐱' }, { name: '강아지', emoji: '🐶' }, { name: '여우', emoji: '🦊' }, { name: '오리', emoji: '🦆' }, { name: '펭귄', emoji: '🐧' }, { name: '판다', emoji: '🐼' }, { name: '코알라', emoji: '🐨' }, { name: '거북이', emoji: '🐢' }, { name: '병아리', emoji: '🐥' }, { name: '햄스터', emoji: '🐹' }];

type ProfileEditorProps = { initialNickname: string; initialEmoji: string; onSave: (emoji: string, nickname: string) => void; onCancel: () => void; canCancel: boolean };

export function ProfileEditor({ onSave, initialNickname, initialEmoji, onCancel, canCancel }: ProfileEditorProps) {
  const [selectedEmoji, setSelectedEmoji] = useState(initialEmoji || '🐰');
  const [nicknameInput, setNicknameInput] = useState(initialNickname || '');
  const handleRandomGen = () => { const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]; const animal = animals[Math.floor(Math.random() * animals.length)]; setNicknameInput(`${adjective} ${animal.name}`); setSelectedEmoji(animal.emoji); };
  return <div className="w-full space-y-5">
    {canCancel && <button onClick={onCancel} className="absolute top-5 right-5 text-[#9AA0A6] hover:text-[#202124] transition-colors p-1 bg-[#F8F9FA] rounded-full"><X className="w-5 h-5" /></button>}
    <div className="grid grid-cols-4 gap-3 bg-[#F8F9FA] p-4 rounded-2xl border border-[#E8EAED]">{animals.map((animal) => <button key={animal.emoji} type="button" onClick={() => setSelectedEmoji(animal.emoji)} className={`text-3xl p-2 rounded-xl transition-all ${selectedEmoji === animal.emoji ? 'bg-[#E8F0FE] border-2 border-[#4285F4] scale-110 shadow-sm' : 'hover:bg-white border-2 border-transparent'}`}>{animal.emoji}</button>)}</div>
    <div><label className="block text-sm font-bold text-[#5F6368] mb-2">사용할 닉네임 입력 (또는 랜덤 생성)</label><div className="flex gap-2"><input type="text" value={nicknameInput} onChange={(event) => setNicknameInput(event.target.value)} placeholder="ex) 발랄한 다람쥐" className="flex-1 px-4 py-3 rounded-xl border border-[#E8EAED] focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#E8F0FE] font-bold" maxLength={10} /><button type="button" onClick={handleRandomGen} className="px-4 py-3 flex items-center gap-1 bg-[#F1F3F4] hover:bg-[#E8EAED] text-[#5F6368] font-bold rounded-xl transition-colors whitespace-nowrap"><Dices className="w-4 h-4" /> 랜덤</button></div></div>
    <button onClick={() => onSave(selectedEmoji, nicknameInput)} className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-extrabold py-3.5 rounded-xl shadow-md transition-transform active:scale-95 text-lg">{canCancel ? '저장하기 💾' : '이 프로필로 시작하기 🚀'}</button>
  </div>;
}
