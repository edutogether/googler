import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StartPage } from './StartPage';

describe('StartPage', () => {
  it('renders the three preparation steps', () => {
    render(<StartPage />);

    expect(screen.getByRole('heading', { name: /시험 준비, 차근차근 시작해요/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '개인 구글 계정 준비' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '학습 센터(Skillshop) 연동' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '언어 설정 확인 (필수)' })).toBeInTheDocument();
  });

  it('emphasises key phrases as real elements, never as literal markdown', () => {
    const { container } = render(<StartPage />);

    // These two phrases used to carry ** ** from a markdown paste, which JSX
    // renders as visible asterisks rather than bold text.
    expect(container.textContent).not.toContain('**');
    expect(screen.getByText('개인 Gmail 계정').tagName).toBe('STRONG');
    expect(screen.getByText("'한국어'").tagName).toBe('STRONG');
  });

  it('opens the Skillshop link in a new tab without leaking the opener', () => {
    render(<StartPage />);

    const link = screen.getByRole('link', { name: /스킬샵 바로가기/ });
    expect(link).toHaveAttribute('href', 'https://skillshop.exceedlms.com/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
  });
});
