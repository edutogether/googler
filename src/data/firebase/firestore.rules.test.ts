import { readFileSync } from 'node:fs';
import { afterAll, afterEach, beforeAll, describe, it } from 'vitest';
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';

let environment: RulesTestEnvironment;
const projectId = 'googler-rules-test';
const appId = 'gpass-custom-app-id';
const anonymous = (uid: string) => environment.authenticatedContext(uid, { firebase: { sign_in_provider: 'anonymous' } }).firestore();

const profileRef = (db: ReturnType<typeof anonymous>, uid: string) => doc(db, 'artifacts', appId, 'users', uid, 'profile', 'info');
const progressRef = (db: ReturnType<typeof anonymous>, uid: string) => doc(db, 'artifacts', appId, 'users', uid, 'user_progress', 'gpass_data');
const rankingRef = (db: ReturnType<typeof anonymous>, uid: string) => doc(db, 'artifacts', appId, 'public', 'data', 'rankings', uid);
const rankingsCollection = (db: ReturnType<typeof anonymous>) => collection(db, 'artifacts', appId, 'public', 'data', 'rankings');

const entry = (uid: string, overrides: Record<string, unknown> = {}) => ({
  uid, nickname: '탐험가', emoji: '🐧', scoreL1: 80, scoreL2: 90, passedL1: true, passedL2: false, ...overrides,
});

beforeAll(async () => { environment = await initializeTestEnvironment({ projectId, firestore: { rules: readFileSync('firestore.rules', 'utf8') } }); });
afterEach(async () => { await environment.clearFirestore(); });
afterAll(async () => { await environment.cleanup(); });

const describeRules = process.env.FIRESTORE_EMULATOR_HOST ? describe : describe.skip;
describeRules('firestore.rules', () => {
  it('scopes a user\'s own profile and progress to that signed-in user only', async () => {
    await assertFails(setDoc(profileRef(environment.unauthenticatedContext().firestore(), 'mobile'), { nickname: 'x', emoji: '🐧' }));
    await assertSucceeds(setDoc(profileRef(anonymous('mobile'), 'mobile'), { nickname: 'x', emoji: '🐧' }));
    await assertFails(setDoc(profileRef(anonymous('attacker'), 'mobile'), { nickname: 'x', emoji: '🐧' }));
    await assertFails(getDoc(profileRef(anonymous('attacker'), 'mobile')));

    await assertSucceeds(setDoc(progressRef(anonymous('mobile'), 'mobile'), { progress: { day1: true } }, { merge: true }));
    await assertFails(setDoc(progressRef(anonymous('attacker'), 'mobile'), { progress: { day1: true } }, { merge: true }));
  });

  it('lets anyone read the public leaderboard', async () => {
    await environment.withSecurityRulesDisabled(async (context) => setDoc(rankingRef(context.firestore(), 'mobile'), entry('mobile')));
    await assertSucceeds(getDocs(rankingsCollection(environment.unauthenticatedContext().firestore())));
  });

  it('only lets a user write their own leaderboard entry, matching both the doc id and the uid field', async () => {
    await assertFails(setDoc(rankingRef(environment.unauthenticatedContext().firestore(), 'mobile'), entry('mobile')));
    await assertSucceeds(setDoc(rankingRef(anonymous('mobile'), 'mobile'), entry('mobile')));
    // Doc id matches the caller, but the uid field inside the payload claims someone else.
    await assertFails(setDoc(rankingRef(anonymous('mobile'), 'mobile'), entry('someone-else')));
    // Caller tries to write under a different entrant's doc id entirely.
    await assertFails(setDoc(rankingRef(anonymous('attacker'), 'victim'), entry('victim')));
  });

  it('rejects leaderboard writes with extra fields, wrong types, or out-of-range scores', async () => {
    const db = anonymous('mobile');
    await assertFails(setDoc(rankingRef(db, 'mobile'), entry('mobile', { email: 'blocked@example.test' })));
    await assertFails(setDoc(rankingRef(db, 'mobile'), entry('mobile', { nickname: 123 })));
    await assertFails(setDoc(rankingRef(db, 'mobile'), entry('mobile', { scoreL1: -1 })));
    await assertFails(setDoc(rankingRef(db, 'mobile'), entry('mobile', { scoreL1: 999999999 })));
    await assertFails(setDoc(rankingRef(db, 'mobile'), entry('mobile', { passedL1: 'yes' })));
    await assertSucceeds(setDoc(rankingRef(db, 'mobile'), entry('mobile')));
  });

  it('rejects leaderboard writes with an oversized nickname or emoji', async () => {
    const db = anonymous('mobile');
    await assertFails(setDoc(rankingRef(db, 'mobile'), entry('mobile', { nickname: 'x'.repeat(31) })));
    await assertSucceeds(setDoc(rankingRef(db, 'mobile'), entry('mobile', { nickname: 'x'.repeat(30) })));
    await assertFails(setDoc(rankingRef(db, 'mobile'), entry('mobile', { emoji: 'x'.repeat(9) })));
    await assertSucceeds(setDoc(rankingRef(db, 'mobile'), entry('mobile', { emoji: 'x'.repeat(8) })));
  });

  it('denies everything outside the modeled paths by default', async () => {
    const db = anonymous('mobile');
    await assertFails(setDoc(doc(db, 'artifacts', appId, 'admin', 'settings'), { open: true }));
  });
});
