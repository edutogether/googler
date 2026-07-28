import { describe, expect, it } from 'vitest'
import { missionShareText, passShareText } from './sharing'
describe('share messages', () => { it('includes mission context', () => expect(missionShareText(2, 'Drive', 40)).toContain('Day 2')); it('includes the level', () => expect(passShareText('L1')).toContain('L1')) })
