import { useEffect, useState } from 'react';
import type { PrivateLearnerProfile, PublicLearnerProfile } from '../../domain/journeyProfile';
import { journeyAvatars, nextSuggestedAvatar, suggestedAvatar, suggestedDisplayName } from '../../domain/journeyProfile';

type IdentityStepProps = {
  onContinue: () => void;
};

const initialPublicProfile = (): PublicLearnerProfile => ({
  displayName: suggestedDisplayName(),
  avatarId: journeyAvatars[0],
  title: '새내기 구글러',
});

export function IdentityStep({ onContinue }: IdentityStepProps) {
  const [privateProfile, setPrivateProfile] = useState<PrivateLearnerProfile>({ legalName: '', accountEmail: '' });
  const [publicProfile, setPublicProfile] = useState<PublicLearnerProfile>(initialPublicProfile);
  const [hasTypedName, setHasTypedName] = useState(false);
  const [manualAvatar, setManualAvatar] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (hasTypedName || manualAvatar) return undefined;

    const timer = window.setInterval(() => {
      setPublicProfile((profile) => {
        const index = journeyAvatars.indexOf(profile.avatarId as (typeof journeyAvatars)[number]);
        return { ...profile, avatarId: journeyAvatars[(index + 1) % journeyAvatars.length] };
      });
    }, 320);

    return () => window.clearInterval(timer);
  }, [hasTypedName, manualAvatar]);

  useEffect(() => {
    const displayName = publicProfile.displayName.trim();
    if (!hasTypedName || manualAvatar || displayName.length < 2 || displayName.length > 16) return undefined;

    setSettled(false);
    const timer = window.setTimeout(() => {
      setPublicProfile((profile) => ({ ...profile, avatarId: suggestedAvatar(displayName) }));
      setSettled(true);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [hasTypedName, manualAvatar, publicProfile.displayName]);

  const displayName = publicProfile.displayName.trim();
  const validDisplayName = displayName.length >= 2 && displayName.length <= 16;

  const chooseSuggestedName = () => {
    setPublicProfile((profile) => ({ ...profile, displayName: suggestedDisplayName() }));
    setHasTypedName(true);
  };

  const recommendAnotherAvatar = () => {
    setManualAvatar(false);
    setPublicProfile((profile) => ({
      ...profile,
      avatarId: nextSuggestedAvatar(profile.displayName.trim(), profile.avatarId),
    }));
    setHasTypedName(true);
  };

  return (
    <section className="journey-card mx-auto max-w-3xl rounded-[2rem] p-6 text-[#202124] md:p-8">
      <p className="text-sm font-bold text-[#1a73e8]">여정 준비 3 / 8</p>
      <h1 className="mt-1 text-3xl font-black">이름과 캐릭터</h1>
      <div className="mt-7 grid gap-6 md:grid-cols-2">
        <div className="space-y-5">
          <div>
            <h2 className="font-black">용사님의 이름</h2>
            <p className="mt-1 text-sm text-[#5f6368]">이 이름은 본인과 운영자만 확인해요. 수료 확인과 운영 안내에만 사용돼요.</p>
            <input
              value={privateProfile.legalName}
              onChange={(event) => setPrivateProfile((profile) => ({ ...profile, legalName: event.target.value }))}
              className="mt-3 w-full rounded-xl border border-[#dadce0] px-4 py-3"
              placeholder="실명 또는 운영 확인 이름"
            />
          </div>
          <div>
            <h2 className="font-black">모험 닉네임</h2>
            <p className="mt-1 text-sm text-[#5f6368]">캘린더, 랭킹과 함께 배우는 공간에서는 이 이름으로 보여요.</p>
            <div className="mt-3 flex gap-2">
              <input
                value={publicProfile.displayName}
                onChange={(event) => {
                  setPublicProfile((profile) => ({ ...profile, displayName: event.target.value }));
                  setHasTypedName(true);
                }}
                className="min-w-0 flex-1 rounded-xl border border-[#dadce0] px-4 py-3"
                aria-label="공개 여정 이름"
              />
              <button onClick={chooseSuggestedName} className="rounded-xl bg-[#e8f0fe] px-3 text-sm font-bold text-[#1967d2]">
                새로운 모험 이름
              </button>
            </div>
            {!validDisplayName && <p className="mt-2 text-xs text-[#d93025]">공개 이름은 공백만 아닌 2~16자로 입력해 주세요.</p>}
          </div>
        </div>
        <aside className="relative rounded-2xl bg-[#f8f9fa] p-6 text-center">
          <p className="text-sm font-bold text-[#5f6368]">모험 프로필 미리보기 · 다른 구글러에게는 이렇게 보여요</p>
          <button onClick={() => setPickerOpen(true)} className="mt-4 text-7xl" aria-label="캐릭터 선택">
            {publicProfile.avatarId}
          </button>
          <h2 className="mt-3 text-xl font-black">{displayName || '여정 이름을 기다리는 중'}</h2>
          <p className="text-sm text-[#5f6368]">{publicProfile.title}{settled && ' · 추천 완료'}</p>
          <button onClick={recommendAnotherAvatar} className="mt-4 rounded-xl border border-[#dadce0] px-4 py-2 text-sm font-bold">
            새로운 동료 찾기
          </button>
          {pickerOpen && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/80 p-4" role="dialog" aria-label="캐릭터 선택기" onClick={() => setPickerOpen(false)}>
              <div className="w-full rounded-2xl border border-[#dadce0] bg-white p-4 shadow-xl" onClick={(event) => event.stopPropagation()}>
                <button onClick={() => setPickerOpen(false)} className="float-right text-sm">닫기</button>
                <div className="clear-both grid grid-cols-5 gap-2 pt-3">
                  {journeyAvatars.map((item) => (
                    <button
                      key={item}
                      aria-label={`${item} 선택`}
                      onClick={() => {
                        setPublicProfile((profile) => ({ ...profile, avatarId: item }));
                        setManualAvatar(true);
                        setPickerOpen(false);
                      }}
                      className="rounded-xl p-2 text-2xl hover:bg-[#e8f0fe]"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
      <button disabled={!validDisplayName} onClick={onContinue} className="mt-8 rounded-xl bg-[#1a73e8] px-6 py-3 font-bold text-white disabled:bg-[#dadce0]">
        이 모습으로 모험 시작하기
      </button>
    </section>
  );
}
