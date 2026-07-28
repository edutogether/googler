import { useMemo, useState } from 'react'
import { Award, BookOpen, Check, ExternalLink, HeartHandshake, Rocket, Share2, Trophy } from 'lucide-react'
import { courses, courseFor } from './content/courses'
import type { CourseLevel } from './domain/course'
import { isDayComplete, levelProgress, missionKey, type Progress } from './domain/progress'
import { missionShareText, passShareText, share } from './shared/sharing'

type Tab = 'intro' | 'learning' | 'week3' | 'week4'
const tabs: Array<{ id: Tab; label: string; icon: typeof Rocket }> = [{ id: 'intro', label: '시작하기', icon: Rocket }, { id: 'learning', label: '무엇을 배울까?', icon: BookOpen }, { id: 'week3', label: '시험 응시', icon: Award }, { id: 'week4', label: '재도전', icon: HeartHandshake }]

export default function App() {
  const [level, setLevel] = useState<CourseLevel>('L1')
  const [tab, setTab] = useState<Tab>('intro')
  const [showRanking, setShowRanking] = useState(false)
  const [progress, setProgress] = useState<Progress>({})
  const [nickname, setNickname] = useState('')
  const [toast, setToast] = useState('')
  const course = courseFor(level)
  const percent = levelProgress(course, progress)
  const missionCount = useMemo(() => courses.flatMap((item) => item.days.flatMap((day) => day.missions)).length, [])
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 3000) }
  const toggle = (id: string) => setProgress((current) => ({ ...current, [id]: !current[id] }))
  const onShare = async (text: string) => notify((await share('Be a Googler', text)) === 'copied' ? '클립보드에 복사되었습니다.' : '공유를 완료했거나 취소했습니다.')

  return <div className="min-h-screen bg-[#F8F9FA] text-[#202124] pb-16">
    {toast && <p role="status" className="fixed z-50 bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-[#202124] px-5 py-3 text-sm text-white shadow-lg">{toast}</p>}
    <header className="sticky top-0 z-20 border-b border-[#E8EAED] bg-white shadow-sm"><div className="mx-auto max-w-3xl px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-bold text-xl"><span className="text-[#4285F4]">Google</span> Educator Maker</h1><label className="text-sm font-bold">프로필 <input aria-label="닉네임" value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="닉네임" className="ml-2 rounded-lg border border-[#DADCE0] px-2 py-1" /></label></div>
      <div className="mt-4 flex gap-2"><button onClick={() => { setLevel('L1'); setShowRanking(false) }} className="rounded-xl px-4 py-2 font-bold bg-[#E8F0FE]">🎓 Level 1</button><button onClick={() => { setLevel('L2'); setShowRanking(false) }} className="rounded-xl px-4 py-2 font-bold bg-[#FCE8E6]">🚀 Level 2</button><button onClick={() => setShowRanking(true)} className="rounded-xl px-4 py-2 font-bold bg-[#FEF7E0]"><Trophy className="inline w-4" aria-hidden="true"/> 랭킹보기</button></div>
      {!showRanking && <div className="mt-3"><div className="flex justify-between text-sm"><span>{course.title} 달성률 (30개 미션)</span><strong>{percent}%</strong></div><div className="mt-1 h-2 overflow-hidden rounded bg-[#E8EAED]"><div className="h-full bg-[#4285F4]" style={{ width: `${percent}%` }} /></div></div>}
    </div></header>
    {showRanking ? <main className="mx-auto max-w-3xl p-4"><section className="rounded-[2rem] bg-white p-8 text-center shadow-sm"><Trophy className="mx-auto w-10 text-[#FBBC05]" aria-hidden="true"/><h2 className="mt-2 text-2xl font-black">Google Educator가 되기 위한 여정</h2><p className="mt-2 text-[#5F6368]">총 {missionCount}개 미션 · Firebase 저장소 연결 전에는 개인 미리보기만 제공합니다.</p><p className="mt-6 rounded-xl bg-[#F1F3F4] p-4">공개 랭킹은 Firebase 연결과 보안 규칙 설정 후 활성화됩니다.</p></section></main> : <><nav className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 py-4">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`whitespace-nowrap rounded-full border px-4 py-2 font-bold ${tab === id ? 'bg-[#E8F0FE] border-[#4285F4]' : 'bg-white border-[#E8EAED]'}`}><Icon className="mr-1 inline w-4" aria-hidden="true"/>{label}</button>)}</nav><main className="mx-auto max-w-3xl space-y-5 px-4">
      {tab === 'intro' && <section className="rounded-[2rem] border border-[#E8EAED] bg-white p-8"><h2 className="text-2xl font-black">시험 준비, 차근차근 시작해요</h2><ol className="mt-5 space-y-4"><li><strong>1. 개인 구글 계정 준비</strong><p>개인 Gmail 계정으로 진행해 주세요.</p></li><li><strong>2. 학습 센터 연동</strong><p><a className="text-[#1A73E8] underline" href="https://skillshop.exceedlms.com/" target="_blank" rel="noreferrer">스킬샵 바로가기 <ExternalLink className="inline w-4" aria-hidden="true"/></a></p></li><li><strong>3. 언어 설정 확인</strong><p>Skillshop의 언어를 한국어로 설정해 주세요.</p></li></ol></section>}
      {tab === 'learning' && <section className="space-y-5"><p role="note" className="rounded-2xl border border-[#FAD2CF] bg-[#FEF7E0] p-4 text-sm">저장소 연결 전에는 이 브라우저의 미리보기 상태로만 체크됩니다. 실제 학습 기록이나 랭킹에는 저장되지 않습니다.</p>{course.days.map((day, index) => { const done = isDayComplete(level, day, progress); return <article key={day.id} className="overflow-hidden rounded-[2rem] border border-[#E8EAED] bg-white"><div className="p-6"><span className="rounded bg-[#E8F0FE] px-2 py-1 text-xs font-bold">Day {index + 1}</span><h2 className="mt-3 text-xl font-black">{day.title}</h2><p className="mt-1 text-sm text-[#5F6368]">{day.description}</p></div><div className="flex gap-2 border-y p-4">{day.resources.map((resource) => <a key={resource.label} href={resource.href} target="_blank" rel="noreferrer" className="flex-1 rounded-lg bg-[#F1F3F4] p-2 text-center text-xs font-bold">{resource.label}</a>)}</div><div className="space-y-2 p-5">{day.missions.map((mission) => { const key = missionKey(level, mission.id); const checked = Boolean(progress[key]); return <label key={mission.id} className="flex cursor-pointer items-center gap-3 rounded-xl border p-3"><input type="checkbox" checked={checked} onChange={() => toggle(key)} /><span>{checked && <Check className="mr-1 inline w-4 text-[#34A853]" aria-label="완료"/>}{mission.label}</span></label> })}<button disabled={!done} onClick={() => void onShare(missionShareText(index + 1, day.title, percent))} className="mt-3 w-full rounded-xl bg-[#FEE500] p-3 font-bold disabled:bg-[#E8EAED]"><Share2 className="mr-1 inline w-4" aria-hidden="true"/>미션 완료 공유</button></div></article> })}</section>}
      {tab === 'week3' && <section className="rounded-[2rem] bg-[#34A853] p-8 text-white"><h2 className="text-2xl font-black">D-Day: 다 함께 따는 날!</h2><p className="mt-2">화상으로 모여 시험을 치릅니다. 시험 후 합격 인증을 공유해 보세요.</p><button onClick={() => void onShare(passShareText(level))} className="mt-5 rounded-xl bg-white px-4 py-3 font-bold text-[#1A73E8]">합격 인증 공유</button></section>}
      {tab === 'week4' && <section className="rounded-[2rem] bg-[#EA4335] p-8 text-white"><h2 className="text-2xl font-black">여유로운 재도전 (보충 주간)</h2><p className="mt-2">시험 리포트의 약점을 확인하고 스킬샵 콘텐츠를 다시 학습해 보세요.</p><button onClick={() => void onShare(passShareText(level))} className="mt-5 rounded-xl bg-[#FEE500] px-4 py-3 font-bold text-[#371D1E]">재도전 성공 공유</button></section>}
    </main></>}
  </div>
}
