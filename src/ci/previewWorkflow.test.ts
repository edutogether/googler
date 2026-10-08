import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// The PR preview deploy uses a production service account, so it must run only
// for pull requests aimed at main. Pinned here because nothing else would
// notice if the trigger were widened again.
const workflow = readFileSync(
  path.join(import.meta.dirname, '..', '..', '.github', 'workflows', 'firebase-hosting-pull-request.yml'),
  'utf8',
);
const previewJob = workflow.slice(workflow.indexOf('\n  preview:'));

describe('firebase-hosting-pull-request.yml', () => {
  it('found the preview job — otherwise the checks below are vacuous', () => {
    expect(previewJob).toContain('firebaseServiceAccount');
  });

  it('triggers only for pull requests targeting main', () => {
    expect(workflow).toMatch(/pull_request:\s*\n\s+branches:\s*\[main\]/);
  });

  it('deploys the preview only when the base branch is main', () => {
    const condition = previewJob.match(/\n {4}if: (.+)/);
    expect(condition).not.toBeNull();
    expect(condition![1]).toContain("github.event.pull_request.base.ref == 'main'");
  });
});
