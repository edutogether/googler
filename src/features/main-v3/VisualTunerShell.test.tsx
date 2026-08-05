import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MainWorldV3 from './MainWorldV3';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (init?.method === 'PUT') return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
    if (url.includes('draft.json')) return Promise.resolve({ ok: true, json: async () => ({ overrides: {}, text: {} }) });
    return Promise.resolve({ ok: false, json: async () => ({}) });
  });
  vi.stubGlobal('fetch', fetchMock);
  window.history.replaceState({}, '', '/googler/?preview=main-v3&tuner=1');
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState({}, '', '/');
});

describe('개발 전용 비주얼튜너', () => {
  it('preview와 tuner query가 함께 있을 때만 실제 화면 프레임을 렌더링한다', async () => {
    render(<MainWorldV3 />);
    expect(screen.getByRole('heading', { name: '반응형 비주얼튜너' })).toBeInTheDocument();
    expect(screen.getByTestId('tuner-frame-pc-1760')).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('draft.json')));
  });

  it('범위별 값은 Undo, Redo, 초기화와 외부 초안 저장을 지원한다', async () => {
    render(<MainWorldV3 />);
    const xInput = screen.getAllByPlaceholderText('px')[0];
    fireEvent.change(xInput, { target: { value: '12px' } });
    expect(xInput).toHaveValue('12px');
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(xInput).toHaveValue('');
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }));
    expect(xInput).toHaveValue('12px');
    fireEvent.click(screen.getByRole('button', { name: '초안 저장' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/__visual-tuner/state', expect.objectContaining({ method: 'PUT' })));
    fireEvent.click(screen.getByRole('button', { name: '현재 요소 초기화' }));
    expect(xInput).toHaveValue('');
  });

  it('PC와 모바일 확정 및 코드 반영 후보 내보내기를 분리한다', async () => {
    render(<MainWorldV3 />);
    fireEvent.click(screen.getByRole('button', { name: 'PC 비주얼 확정' }));
    fireEvent.click(screen.getByRole('button', { name: '모바일 비주얼 확정' }));
    fireEvent.click(screen.getByRole('button', { name: '코드 반영 후보 내보내기' }));
    await waitFor(() => {
      const bodies = fetchMock.mock.calls.filter((call) => String(call[0]) === '/__visual-tuner/state').map((call) => JSON.parse(String((call[1] as RequestInit).body)) as { file: string });
      expect(bodies.map((body) => body.file)).toEqual(expect.arrayContaining(['pc-approved.json', 'mobile-approved.json', 'approved-adjustments.json', 'approved-adjustments.md']));
    });
  });

  it('패널 접기와 미리보기 전체 화면, 새 창 기능을 제공한다', () => {
    const popup = { postMessage: vi.fn() } as unknown as Window;
    vi.spyOn(window, 'open').mockReturnValue(popup);
    render(<MainWorldV3 />);
    fireEvent.click(screen.getByRole('button', { name: '편집 패널 접기' }));
    expect(document.querySelector('.visual-tuner-shell')).toHaveClass('is-collapsed');
    fireEvent.click(screen.getByRole('button', { name: '편집 패널 펼치기' }));
    fireEvent.click(screen.getByRole('button', { name: '미리보기 전체 화면' }));
    expect(document.querySelector('.visual-tuner-shell')).toHaveClass('is-fullscreen');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(document.querySelector('.visual-tuner-shell')).not.toHaveClass('is-fullscreen');
    fireEvent.click(screen.getByRole('button', { name: '미리보기 새 창' }));
    expect(window.open).toHaveBeenCalled();
  });

  it('선택과 잘못된 입력은 override를 만들지 않고, 목록 선택은 즉시 반영한다', () => {
    render(<MainWorldV3 />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[2], { target: { value: 'primary-cta' } });
    expect(screen.getByText('선택됨:')).toHaveTextContent('주요 CTA');
    const xInput = screen.getAllByPlaceholderText('px')[0];
    fireEvent.change(xInput, { target: { value: '잘못된 값' } });
    expect(xInput).toHaveValue('');
  });

  it('방향키와 길게 누르기 버튼은 조정값을 만들고 Undo로 한 단계 복구한다', async () => {
    render(<MainWorldV3 />);
    const xInput = screen.getAllByPlaceholderText('px')[0];
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyUp(window, { key: 'ArrowRight' });
    expect(xInput).toHaveValue('1px');
    fireEvent.keyDown(window, { key: 'ArrowRight', shiftKey: true });
    fireEvent.keyUp(window, { key: 'ArrowRight' });
    expect(xInput).toHaveValue('11px');
    fireEvent.pointerDown(screen.getByRole('button', { name: 'X 이동 증가' }));
    fireEvent.pointerUp(screen.getByRole('button', { name: 'X 이동 증가' }));
    expect(xInput).toHaveValue('12px');
    expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled();
  });
});
