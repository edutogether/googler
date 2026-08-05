import type { PublicLearnerProfile } from './journeyProfile';

export const journeyStateKey = 'be-a-googler:journey-entry:v1';
export const journeyStateSchemaVersion = 1;

export type JourneyStep = 'entry' | 'return' | 'identity' | 'diagnostic' | 'level' | 'tone' | 'loading' | 'planner' | 'legacy';
export type JourneyLevelId = 'start' | 'foundation' | 'practice' | 'advanced';
export type JourneyToneId = 'calm' | 'mate' | 'trainer';

export type JourneyState = {
  schemaVersion: typeof journeyStateSchemaVersion;
  currentStep: JourneyStep;
  history: JourneyStep[];
  legalName: string;
  publicProfile: PublicLearnerProfile | null;
  diagnosticAnswers: number[];
  levelId: JourneyLevelId;
  toneId: JourneyToneId;
  plannerStarted: boolean;
  calendarPublished: boolean;
  completed: boolean;
};

export const createInitialJourneyState = (): JourneyState => ({
  schemaVersion: journeyStateSchemaVersion,
  currentStep: 'entry',
  history: [],
  legalName: '',
  publicProfile: null,
  diagnosticAnswers: [],
  levelId: 'start',
  toneId: 'mate',
  plannerStarted: false,
  calendarPublished: false,
  completed: false,
});

const steps: readonly JourneyStep[] = ['entry', 'return', 'identity', 'diagnostic', 'level', 'tone', 'loading', 'planner', 'legacy'];
const levelIds = ['start', 'foundation', 'practice', 'advanced'] as const;
const toneIds = ['calm', 'mate', 'trainer'] as const;
const isStep = (value: unknown): value is JourneyStep => typeof value === 'string' && steps.includes(value as JourneyStep);
const isPublicProfile = (value: unknown): value is PublicLearnerProfile => {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Partial<PublicLearnerProfile>;
  return typeof profile.displayName === 'string' && typeof profile.avatarId === 'string' && typeof profile.title === 'string';
};

export function isValidJourneyState(value: unknown): value is JourneyState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Partial<JourneyState>;
  if (state.schemaVersion !== journeyStateSchemaVersion || !isStep(state.currentStep) || !Array.isArray(state.history) || !state.history.every(isStep)) return false;
  if (typeof state.legalName !== 'string' || !Array.isArray(state.diagnosticAnswers) || !state.diagnosticAnswers.every((answer) => Number.isInteger(answer) && answer >= 0 && answer <= 2)) return false;
  if (state.publicProfile !== null && !isPublicProfile(state.publicProfile)) return false;
  if (typeof state.levelId !== 'string' || typeof state.toneId !== 'string' || typeof state.plannerStarted !== 'boolean' || typeof state.calendarPublished !== 'boolean' || typeof state.completed !== 'boolean') return false;
  const hasProfile = Boolean(state.publicProfile && state.publicProfile.displayName.trim().length >= 2);
  if (['diagnostic', 'level', 'tone', 'loading', 'planner', 'legacy'].includes(state.currentStep) && !hasProfile) return false;
  if (['level', 'tone', 'loading', 'planner', 'legacy'].includes(state.currentStep) && state.diagnosticAnswers.length !== 7) return false;
  if (['tone', 'loading', 'planner', 'legacy'].includes(state.currentStep) && !levelIds.includes(state.levelId as (typeof levelIds)[number])) return false;
  if (['loading', 'planner', 'legacy'].includes(state.currentStep) && !toneIds.includes(state.toneId as (typeof toneIds)[number])) return false;
  if (state.currentStep === 'legacy' && !state.completed) return false;
  return true;
}

export function loadJourneyState(storage: Storage | undefined = typeof sessionStorage === 'undefined' ? undefined : sessionStorage) {
  try {
    const raw = storage?.getItem(journeyStateKey);
    if (!raw) return createInitialJourneyState();
    const parsed: unknown = JSON.parse(raw);
    if (isValidJourneyState(parsed)) return parsed;
    storage?.removeItem(journeyStateKey);
    return createInitialJourneyState();
  } catch {
    storage?.removeItem(journeyStateKey);
    return createInitialJourneyState();
  }
}

export function saveJourneyState(state: JourneyState, storage: Storage | undefined = typeof sessionStorage === 'undefined' ? undefined : sessionStorage) {
  storage?.setItem(journeyStateKey, JSON.stringify(state));
}

export function clearJourneyState(storage: Storage | undefined = typeof sessionStorage === 'undefined' ? undefined : sessionStorage) {
  storage?.removeItem(journeyStateKey);
}

export function moveJourneyStep(state: JourneyState, next: JourneyStep): JourneyState {
  if (state.currentStep === next) return state;
  return { ...state, currentStep: next, history: [...state.history, state.currentStep] };
}

export function moveJourneyBack(state: JourneyState): JourneyState {
  const previous = state.history.at(-1);
  if (!previous) return state;
  return { ...state, currentStep: previous, history: state.history.slice(0, -1) };
}
