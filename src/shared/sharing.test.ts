import { describe, expect, it } from 'vitest';
import { courseShareMessage, levelShareMessage, missionShareMessage } from './sharing';

describe('sharing messages', () => {
  it('creates mission, level, and course sharing text without missing values', () => {
    expect(missionShareMessage('크롬 & 구글 드라이브', 1, 10).text).toContain('크롬 & 구글 드라이브');
    expect(levelShareMessage('L1').text).toContain('L1');
    expect(courseShareMessage('', '')).toContain('Google Educator Maker');
  });
});
