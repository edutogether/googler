import { readFileSync } from 'node:fs';
import { afterAll, afterEach, beforeAll, describe, it } from 'vitest';
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, limit, query, setDoc } from 'firebase/firestore';

let environment: RulesTestEnvironment;
const projectId = 'googler-rules-test';
const appId = 'gpass-custom-app-id';
const anonymous = (uid: string) => environment.authenticatedContext(uid, { firebase: { sign_in_provider: 'anonymous' } }).firestore();

const profileRef = (db: ReturnType<typeof anonymous>, uid: string) => doc(db, 'artifacts', appId, 'users', uid, 'profile', 'info');
const progressRef = (db: ReturnType<typeof anonymous>, uid: string) => doc(db, 'artifacts', appId, 'users', uid, 'user_progress', 'gpass_data');
const rankingRef = (db: ReturnType<typeof anonymous>, uid: string) => doc(db, 'artifacts', appId, 'public', 'data', 'rankings', uid);
const rankingsCollection = (db: ReturnType<typeof anonymous>) => collection(db, 'artifacts', appId, 'public', 'data', 'rankings');

const entry = (uid: string, overrides: Record<string, unknown> = {}) => ({
  uid, nickname: '탐험가', emoji: '🐧', ...overrides,
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
    // The owner must also be able to read back what they wrote.
    await assertSucceeds(getDoc(profileRef(anonymous('mobile'), 'mobile')));

    await assertSucceeds(setDoc(progressRef(anonymous('mobile'), 'mobile'), { progress: { day1: true } }, { merge: true }));
    await assertFails(setDoc(progressRef(anonymous('attacker'), 'mobile'), { progress: { day1: true } }, { merge: true }));
    await assertSucceeds(getDoc(progressRef(anonymous('mobile'), 'mobile')));
    await assertFails(getDoc(progressRef(anonymous('attacker'), 'mobile')));
  });

  it('rejects profile and progress writes with extra fields, wrong types, or oversized values', async () => {
    const db = anonymous('mobile');
    await assertFails(setDoc(profileRef(db, 'mobile'), { nickname: 'x', emoji: '🐧', role: 'admin' }));
    await assertFails(setDoc(profileRef(db, 'mobile'), { nickname: 123, emoji: '🐧' }));
    await assertFails(setDoc(profileRef(db, 'mobile'), { nickname: 'x'.repeat(31), emoji: '🐧' }));
    await assertSucceeds(setDoc(profileRef(db, 'mobile'), { nickname: 'x', emoji: '🐧' }));

    await assertFails(setDoc(progressRef(db, 'mobile'), { progress: {}, extra: true }));
    await assertFails(setDoc(progressRef(db, 'mobile'), { progress: 'not-a-map' }));
  });

  // Progress is a flat map of mission flags (60 missions + 2 pass flags). Nested
  // maps, other value types and oversized maps are rejected.
  it('only accepts a flat, bounded map of boolean progress flags', async () => {
    const db = anonymous('mobile');
    const flags = (count: number) => Object.fromEntries(Array.from({ length: count }, (_, i) => [`k${i}`, true]));
    await assertSucceeds(setDoc(progressRef(db, 'mobile'), { progress: flags(62) }));
    await assertFails(setDoc(progressRef(db, 'mobile'), { progress: flags(63) }));
    await assertFails(setDoc(progressRef(db, 'mobile'), { progress: { day1: { nested: true } } }));
    await assertFails(setDoc(progressRef(db, 'mobile'), { progress: { day1: 'x'.repeat(1000) } }));
    await assertFails(setDoc(progressRef(db, 'mobile'), { progress: { day1: 1 } }));
    // A normal merge write from a fresh user, as the client does it.
    await assertSucceeds(setDoc(progressRef(anonymous('other'), 'other'), { progress: { day1: true, day2: false } }, { merge: true }));
  });

  it('no longer lets a signed-in user create arbitrary documents under their own uid', async () => {
    const db = anonymous('mobile');
    await assertFails(setDoc(doc(db, 'artifacts', appId, 'users', 'mobile', 'anything', 'else'), { open: true }));
  });

  it('lets signed-in participants read the public leaderboard, but not anonymous visitors', async () => {
    await environment.withSecurityRulesDisabled(async (context) => setDoc(rankingRef(context.firestore(), 'mobile'), entry('mobile')));
    await assertSucceeds(getDoc(rankingRef(anonymous('reader'), 'mobile')));
    await assertSucceeds(getDocs(query(rankingsCollection(anonymous('reader')), limit(200))));
    await assertFails(getDocs(query(rankingsCollection(environment.unauthenticatedContext().firestore()), limit(200))));
  });

  // The client always reads the leaderboard with limit(200); the rules enforce
  // the same ceiling so a modified client cannot pull the whole collection.
  it('caps leaderboard list reads at 200 documents and rejects unbounded lists', async () => {
    const db = anonymous('reader');
    await assertSucceeds(getDocs(query(rankingsCollection(db), limit(1))));
    await assertSucceeds(getDocs(query(rankingsCollection(db), limit(200))));
    await assertFails(getDocs(query(rankingsCollection(db), limit(201))));
    await assertFails(getDocs(rankingsCollection(db)));
  });

  it('only lets a user write their own leaderboard entry, matching both the doc id and the uid field', async () => {
    await assertFails(setDoc(rankingRef(environment.unauthenticatedContext().firestore(), 'mobile'), entry('mobile')));
    await assertSucceeds(setDoc(rankingRef(anonymous('mobile'), 'mobile'), entry('mobile')));
    // Doc id matches the caller, but the uid field inside the payload claims someone else.
    await assertFails(setDoc(rankingRef(anonymous('mobile'), 'mobile'), entry('someone-else')));
    // Caller tries to write under a different entrant's doc id entirely.
    await assertFails(setDoc(rankingRef(anonymous('attacker'), 'victim'), entry('victim')));
  });

  it('rejects leaderboard writes with extra fields or wrong types', async () => {
    const db = anonymous('mobile');
    await assertFails(setDoc(rankingRef(db, 'mobile'), entry('mobile', { email: 'blocked@example.test' })));
    await assertFails(setDoc(rankingRef(db, 'mobile'), entry('mobile', { nickname: 123 })));
    await assertSucceeds(setDoc(rankingRef(db, 'mobile'), entry('mobile')));
  });

  // Score and pass fields are not client-writable: the client cannot be trusted
  // to report them. They are reopened when scoring moves server-side.
  it('does not let a client write or change score and pass fields', async () => {
    const db = anonymous('mobile');
    for (const field of ['scoreL1', 'scoreL2'] as const) {
      await assertFails(setDoc(rankingRef(db, 'mobile'), entry('mobile', { [field]: 0 })));
      await assertFails(setDoc(rankingRef(db, 'mobile'), entry('mobile', { [field]: 30 })));
      await assertFails(setDoc(rankingRef(db, 'mobile'), entry('mobile', { [field]: 99999 })));
    }
    for (const field of ['passedL1', 'passedL2'] as const) {
      await assertFails(setDoc(rankingRef(db, 'mobile'), entry('mobile', { [field]: true })));
      await assertFails(setDoc(rankingRef(db, 'mobile'), entry('mobile', { [field]: false })));
    }
    await assertSucceeds(setDoc(rankingRef(db, 'mobile'), entry('mobile')));
  });

  it('lets a client update its profile fields while leaving server-set scores untouched, but not change them', async () => {
    await environment.withSecurityRulesDisabled(async (context) => setDoc(rankingRef(context.firestore(), 'mobile'), entry('mobile', { scoreL1: 12, scoreL2: 3, passedL1: true })));
    const db = anonymous('mobile');
    await assertSucceeds(setDoc(rankingRef(db, 'mobile'), { nickname: '새이름' }, { merge: true }));
    await assertFails(setDoc(rankingRef(db, 'mobile'), { scoreL1: 30 }, { merge: true }));
    await assertFails(setDoc(rankingRef(db, 'mobile'), { passedL2: true }, { merge: true }));
    await assertFails(setDoc(rankingRef(db, 'mobile'), entry('mobile', { scoreL1: 12 })));
  });

  // The namespace used to be an {appId} wildcard, so a signed-in user could
  // create unlimited namespaces under their own uid.
  it('only allows the single namespace the client uses, not arbitrary appIds', async () => {
    const db = anonymous('mobile');
    const other = 'attacker-namespace';
    await assertFails(setDoc(doc(db, 'artifacts', other, 'users', 'mobile', 'profile', 'info'), { nickname: 'x', emoji: '🐧' }));
    await assertFails(setDoc(doc(db, 'artifacts', other, 'users', 'mobile', 'user_progress', 'gpass_data'), { progress: {} }));
    await assertFails(setDoc(doc(db, 'artifacts', other, 'public', 'data', 'rankings', 'mobile'), entry('mobile')));
    await assertSucceeds(setDoc(profileRef(db, 'mobile'), { nickname: 'x', emoji: '🐧' }));
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
