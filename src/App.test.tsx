import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
describe('app', () => { it('renders accessible content without Firebase configuration', () => { render(<App />); expect(screen.getByText('시험 준비, 차근차근 시작해요')).toBeInTheDocument(); fireEvent.click(screen.getByRole('button', { name: /무엇을 배울까/ })); expect(screen.getByText('크롬 & 구글 드라이브')).toBeInTheDocument(); expect(screen.getAllByRole('checkbox')).toHaveLength(30) }) })
