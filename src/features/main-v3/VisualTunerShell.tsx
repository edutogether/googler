import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import './VisualTunerShell.css';

type Scope = 'all' | 'desktop' | 'desktop-narrow' | 'desktop-wide' | 'mobile' | 'mobile-wide' | 'current';
type ViewMode = 'single' | 'desktop-pair' | 'mobile-pair' | 'overview';
type ZoomMode = 'fit' | '1' | '.75' | '.5';
type Values = Record<string, string>;
type OverrideMap = Record<string, Record<string, Values>>;
type TextMap = Record<string, Record<string, string>>;

type Draft = { overrides: OverrideMap; text: TextMap; updatedAt?: string };
type FrameSpec = { key: string; label: string; width: number; height: number };

const TUNER_ENDPOINT = '/__visual-tuner/state';
const previewUrl = `${window.location.pathname}?preview=main-v3&tuner-preview=1`;

const viewports: FrameSpec[] = [
  { key: 'pc-1760', label: 'PC 1760×900', width: 1760, height: 900 },
  { key: 'pc-1440', label: 'PC 1440×900', width: 1440, height: 900 },
  { key: 'pc-1366', label: 'PC 1366×768', width: 1366, height: 768 },
  { key: 'pc-1024', label: 'PC 1024×768', width: 1024, height: 768 },
  { key: 'mobile-390', label: '모바일 390×844', width: 390, height: 844 },
  { key: 'mobile-400', label: '모바일 400×860', width: 400, height: 860 },
  { key: 'mobile-414', label: '모바일 414×896', width: 414, height: 896 },
  { key: 'mobile-430', label: '모바일 430×932', width: 430, height: 932 },
];

const targets = [
  ['brand', '브랜드'], ['navigation', 'PC 내비게이션'], ['profile', '프로필'], ['desktop-audio', 'BGM 영역'], ['notification', '알림'],
  ['hero', '히어로 전체'], ['hero-eyebrow', '히어로 작은 문구'], ['hero-title', '메인 타이틀'], ['hero-description', '설명'],
  ['text-action', '여정이란?'], ['primary-cta', '주요 CTA'], ['secondary-cta', '보조 CTA'], ['guide', '말풍선'],
  ['summary', '하단 카드 행'], ['journey-card', '나의 여정 카드'], ['journey-avatar', '프로필 아바타'],
  ['continue-card', '이어하기 카드'], ['island-thumbnail', '섬 썸네일'], ['continue-title', '이어하기 제목'], ['continue-progress', '진행 막대'],
  ['resume-button', '계속하기 버튼'], ['badges-card', '배지 카드'], ['badge-row', '배지 목록'], ['badge-blue', '개별 배지'], ['badge-more', '더보기 …'], ['audio-dock', '오디오 컨트롤'],
] as const;

const scopes: Array<[Scope, string]> = [
  ['all', '전체 공통'], ['desktop', 'PC 공통'], ['desktop-narrow', '좁은 PC'], ['desktop-wide', '넓은 PC'],
  ['mobile', '모바일 공통'], ['mobile-wide', '넓은 모바일'], ['current', '현재 화면 임시 확인'],
];

const controls = [
  ['x', 'X 이동', 'px'], ['y', 'Y 이동', 'px'], ['width', '폭', 'px'], ['height', '높이', 'px'],
  ['margin', 'margin', 'px'], ['padding', 'padding', 'px'], ['gap', 'gap', 'px'], ['opacity', '투명도', ''],
  ['border', 'border', ''], ['borderRadius', 'radius', 'px'], ['boxShadow', 'shadow', ''],
  ['fontSize', '글자 크기', 'px'], ['lineHeight', '행간', ''], ['letterSpacing', '자간', 'px'], ['fontWeight', '글자 굵기', ''],
  ['maxWidth', '최대 폭', 'px'], ['backgroundPositionX', '배경 X', '%'], ['backgroundPositionY', '배경 Y', '%'], ['backgroundSize', '배경 크기', ''],
] as const;

const textTargets = new Set(['hero-eyebrow', 'hero-description', 'guide', 'text-action']);

function blankDraft(): Draft { return { overrides: {}, text: {} }; }
function cloneDraft(draft: Draft): Draft { return JSON.parse(JSON.stringify(draft)) as Draft; }
function isScopeActive(scope: Scope, width: number) {
  if (scope === 'all' || scope === 'current') return true;
  if (scope === 'desktop') return width >= 768;
  if (scope === 'desktop-narrow') return width >= 768 && width < 1200;
  if (scope === 'desktop-wide') return width >= 1451;
  if (scope === 'mobile') return width < 768;
  return width >= 420 && width < 768;
}
function resolvedDraft(draft: Draft, viewport: FrameSpec) {
  const overrides: Record<string, Values> = {};
  const text: Record<string, string> = {};
  for (const [scope, byTarget] of Object.entries(draft.overrides)) {
    if (!isScopeActive(scope as Scope, viewport.width)) continue;
    Object.entries(byTarget).forEach(([target, values]) => { overrides[target] = { ...(overrides[target] ?? {}), ...values }; });
  }
  for (const [scope, byTarget] of Object.entries(draft.text)) {
    if (!isScopeActive(scope as Scope, viewport.width)) continue;
    Object.assign(text, byTarget);
  }
  return { overrides, text };
}

async function readState(file: string) {
  const response = await fetch(`${TUNER_ENDPOINT}?file=${encodeURIComponent(file)}`);
  if (!response.ok) throw new Error('저장된 조정값을 읽지 못했습니다.');
  return response.json() as Promise<Draft>;
}
async function writeState(file: string, value: unknown) {
  const response = await fetch(TUNER_ENDPOINT, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ file, value }) });
  if (!response.ok) throw new Error('조정값을 저장하지 못했습니다.');
}

function TunerFrame({ spec, draft, selectedId, onSelected, zoom, popup, workspaceWidth }: { spec: FrameSpec; draft: Draft; selectedId: string; onSelected: (id: string) => void; zoom: ZoomMode; popup: Window | null; workspaceWidth: number }) {
  const frame = useRef<HTMLIFrameElement | null>(null);
  const send = useCallback(() => {
    const payload = { type: 'visual-tuner-update', selectedId, ...resolvedDraft(draft, spec) };
    frame.current?.contentWindow?.postMessage(payload, window.location.origin);
    popup?.postMessage(payload, window.location.origin);
  }, [draft, popup, selectedId, spec]);
  useEffect(() => { send(); }, [send]);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== 'visual-tuner-select') return;
      if (event.source === frame.current?.contentWindow && typeof event.data.id === 'string') onSelected(event.data.id);
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [onSelected]);
  const fitScale = Math.max(.1, Math.min(workspaceWidth / spec.width, Math.max(280, window.innerHeight - 112) / spec.height));
  const scale = zoom === 'fit' ? fitScale : Number(zoom);
  const frameStyle = { '--vt-scale': String(scale), '--vt-display-width': `${Math.round(spec.width * scale)}px`, '--vt-display-height': `${Math.round(spec.height * scale)}px` } as CSSProperties;
  return <figure className="vt-frame" style={frameStyle} data-testid={`tuner-frame-${spec.key}`}>
    <figcaption>{spec.label} <small>{Math.round(scale * 100)}%</small></figcaption>
    <div className="vt-frame-scale"><iframe ref={frame} title={`${spec.label} 실제 화면`} src={previewUrl} width={spec.width} height={spec.height} onLoad={send} /></div>
  </figure>;
}

export default function VisualTunerShell() {
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [history, setHistory] = useState<Draft[]>([]);
  const [redo, setRedo] = useState<Draft[]>([]);
  const [selectedId, setSelectedId] = useState('hero');
  const [scope, setScope] = useState<Scope>('desktop');
  const [lastProperty, setLastProperty] = useState('x');
  const [viewportKey, setViewportKey] = useState('pc-1760');
  const [mode, setMode] = useState<ViewMode>('single');
  const [zoom, setZoom] = useState<ZoomMode>('fit');
  const [collapsed, setCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [popup, setPopup] = useState<Window | null>(null);
  const [status, setStatus] = useState('초안 저장소를 불러오는 중입니다.');
  const [locked, setLocked] = useState<Partial<Record<'pc' | 'mobile', boolean>>>({});

  const viewport = viewports.find((item) => item.key === viewportKey) ?? viewports[0];
  const selectedName = targets.find(([id]) => id === selectedId)?.[1] ?? selectedId;
  const current = draft.overrides[scope]?.[selectedId] ?? {};
  const currentText = draft.text[scope]?.[selectedId] ?? '';
  const workspaceWidth = Math.max(320, window.innerWidth - (fullscreen ? 48 : collapsed ? 86 : 304));

  useEffect(() => {
    void readState('draft.json').then((saved) => { setDraft(saved?.overrides ? saved : blankDraft()); setStatus('저장된 초안을 복원했습니다.'); }).catch(() => setStatus('새 초안으로 시작합니다.'));
    void readState('pc-approved.json').then(() => setLocked((value) => ({ ...value, pc: true }))).catch(() => undefined);
    void readState('mobile-approved.json').then(() => setLocked((value) => ({ ...value, mobile: true }))).catch(() => undefined);
  }, []);

  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setFullscreen(false); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, []);

  const mutate = useCallback((update: (previous: Draft) => Draft) => {
    setDraft((previous) => { setHistory((items) => [...items, cloneDraft(previous)].slice(-80)); setRedo([]); return update(cloneDraft(previous)); });
  }, []);
  const ensureUnlocked = useCallback(() => {
    const key = viewport.width < 768 ? 'mobile' : 'pc';
    if (!locked[key]) return true;
    return window.confirm(`${key === 'pc' ? 'PC' : '모바일'} 확정값은 잠겨 있습니다. 계속 수정하시겠습니까?`);
  }, [locked, viewport.width]);
  const setValue = (key: string, value: string) => {
    if (!ensureUnlocked()) return;
    setLastProperty(key);
    mutate((next) => {
      next.overrides[scope] ??= {}; next.overrides[scope][selectedId] ??= {};
      if (value.trim()) next.overrides[scope][selectedId][key] = value; else delete next.overrides[scope][selectedId][key];
      next.updatedAt = new Date().toISOString(); return next;
    });
  };
  const setText = (value: string) => {
    if (!ensureUnlocked()) return;
    mutate((next) => { next.text[scope] ??= {}; next.text[scope][selectedId] = value; next.updatedAt = new Date().toISOString(); return next; });
  };
  const saveDraft = async () => {
    try { await writeState('draft.json', draft); setStatus('초안을 외부 개발 저장소에 저장했습니다.'); } catch (error) { setStatus(error instanceof Error ? error.message : '저장에 실패했습니다.'); }
  };
  const approve = async (kind: 'pc' | 'mobile') => {
    try { await writeState(kind === 'pc' ? 'pc-approved.json' : 'mobile-approved.json', { ...draft, approvedAt: new Date().toISOString(), approvedFor: kind }); await writeState('change-log.json', { updatedAt: new Date().toISOString(), latest: draft, approved: kind }); setLocked((value) => ({ ...value, [kind]: true })); setStatus(`${kind === 'pc' ? 'PC' : '모바일'} 비주얼을 확정하고 잠갔습니다.`); } catch (error) { setStatus(error instanceof Error ? error.message : '확정 저장에 실패했습니다.'); }
  };
  const exportApproved = async () => {
    const recommendation = { product: 'BE A GOOGLER', generatedAt: new Date().toISOString(), draft, scopes, note: '이 파일은 개발 비주얼튜너의 승인 후보입니다. 실제 CSS 반영 전 검토가 필요합니다.' };
    const markdown = `# BE A GOOGLER 비주얼튜너 반영 후보\n\n- 생성 시각: ${recommendation.generatedAt}\n- 변경 요소: ${Object.keys(draft.overrides).flatMap((key) => Object.keys(draft.overrides[key])).join(', ') || '없음'}\n- 실제 CSS 반영 전 별도 검토가 필요합니다.\n`;
    try { await writeState('approved-adjustments.json', recommendation); await writeState('approved-adjustments.md', markdown); setStatus('코드 반영 후보 파일을 외부 개발 저장소에 내보냈습니다.'); } catch (error) { setStatus(error instanceof Error ? error.message : '내보내기에 실패했습니다.'); }
  };
  const undo = () => setHistory((items) => { const previous = items.at(-1); if (!previous) return items; setRedo((redoItems) => [...redoItems, cloneDraft(draft)]); setDraft(previous); return items.slice(0, -1); });
  const redoAction = () => setRedo((items) => { const next = items.at(-1); if (!next) return items; setHistory((historyItems) => [...historyItems, cloneDraft(draft)]); setDraft(next); return items.slice(0, -1); });
  const resetProperty = () => setValue(lastProperty, '');
  const resetTarget = () => mutate((next) => { delete next.overrides[scope]?.[selectedId]; delete next.text[scope]?.[selectedId]; return next; });
  const resetAll = () => { if (window.confirm('모든 미확정 조정값을 초기화할까요?')) { setHistory((items) => [...items, cloneDraft(draft)]); setDraft(blankDraft()); setRedo([]); setStatus('모든 미확정 조정값을 초기화했습니다.'); } };
  const frames = useMemo(() => {
    if (mode === 'desktop-pair') return [viewports[0], viewports[3]];
    if (mode === 'mobile-pair') return [viewports[4], viewports[7]];
    if (mode === 'overview') return [viewports[0], viewports[2], viewports[4], viewports[7]];
    return [viewport];
  }, [mode, viewport]);
  const openPreviewWindow = () => {
    const next = window.open(previewUrl, 'be-a-googler-visual-tuner-preview', `popup=yes,width=${viewport.width},height=${viewport.height},noopener=no`);
    if (next) { setPopup(next); setStatus('선택한 viewport를 별도 창으로 열었습니다.'); }
    else setStatus('브라우저가 새 창을 차단했습니다. 팝업 허용 후 다시 시도하세요.');
  };

  return <main className={`visual-tuner-shell${collapsed ? ' is-collapsed' : ''}${fullscreen ? ' is-fullscreen' : ''}`}>
    <aside className="vt-panel" aria-label="개발 전용 비주얼튜너">
      <button type="button" className="vt-panel-toggle" aria-label={collapsed ? '편집 패널 펼치기' : '편집 패널 접기'} onClick={() => setCollapsed((value) => !value)}>{collapsed ? '☰' : '‹'}</button>
      <header><p>개발 전용</p><h1>반응형 비주얼튜너</h1><output aria-live="polite">{status}</output></header>
      <label>화면<select value={viewportKey} onChange={(event) => setViewportKey(event.target.value)}>{viewports.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
      <label>비교 보기<select value={mode} onChange={(event) => setMode(event.target.value as ViewMode)}><option value="single">단일 화면 크게 보기</option><option value="desktop-pair">PC 2개 비교</option><option value="mobile-pair">모바일 2개 비교</option><option value="overview">전체 축소 비교</option></select></label>
      <label>요소<select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>{targets.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <p className="vt-selected">선택됨: <strong>{selectedName}</strong></p>
      <label>적용 범위<select value={scope} onChange={(event) => setScope(event.target.value as Scope)}>{scopes.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <section className="vt-controls" aria-label="선택 요소 조정">
        {controls.map(([key, label, unit]) => <label key={key}>{label}<span><button type="button" onClick={() => setValue(key, String((Number.parseFloat(current[key] || '0') || 0) - 1) + unit)}>−</button><input value={current[key] ?? ''} placeholder={unit || '값'} onChange={(event) => setValue(key, event.target.value)} /><button type="button" onClick={() => setValue(key, String((Number.parseFloat(current[key] || '0') || 0) + 1) + unit)}>+</button></span></label>)}
        {textTargets.has(selectedId) && <label className="vt-text">실제 문구<textarea value={currentText} placeholder="줄바꿈은 Enter로 입력" onChange={(event) => setText(event.target.value)} /></label>}
      </section>
      <section className="vt-actions" aria-label="편집 명령">
        <button type="button" onClick={undo} disabled={!history.length}>Undo</button><button type="button" onClick={redoAction} disabled={!redo.length}>Redo</button>
        <button type="button" onClick={resetProperty}>현재 속성 초기화</button><button type="button" onClick={resetTarget}>현재 요소 초기화</button><button type="button" onClick={resetAll}>전체 초기화</button>
        <button type="button" onClick={() => void saveDraft()}>초안 저장</button><button type="button" onClick={() => void approve('pc')}>PC 비주얼 확정</button><button type="button" onClick={() => void approve('mobile')}>모바일 비주얼 확정</button><button type="button" onClick={() => void exportApproved()}>코드 반영 후보 내보내기</button>
      </section>
    </aside>
    <section className="vt-workspace" aria-label="실제 MainWorldV3 미리보기">
      <header className="vt-toolbar"><strong>{viewport.label}</strong><label>배율 <select value={zoom} onChange={(event) => setZoom(event.target.value as ZoomMode)}><option value="fit">화면에 맞춤</option><option value="1">100%</option><option value=".75">75%</option><option value=".5">50%</option></select></label><button type="button" onClick={() => setFullscreen((value) => !value)}>{fullscreen ? '전체 화면 종료' : '미리보기 전체 화면'}</button><button type="button" onClick={openPreviewWindow}>미리보기 새 창</button></header>
      <section className={`vt-canvas vt-${mode}`} aria-label="실제 MainWorldV3 미리보기">{frames.map((spec) => <TunerFrame key={spec.key} spec={spec} draft={draft} selectedId={selectedId} onSelected={setSelectedId} zoom={zoom} popup={popup} workspaceWidth={workspaceWidth} />)}</section>
    </section>
  </main>;
}
