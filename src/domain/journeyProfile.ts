export type PrivateLearnerProfile = {
  legalName: string;
  accountEmail: string;
};

export type PublicLearnerProfile = {
  displayName: string;
  avatarId: string;
  title: string;
};

const adjectives = ['반짝이는', '용감한', '호기심 많은', '다정한', '씩씩한', '지혜로운', '재빠른', '꾸준한'];
const nouns = ['여우', '구름', '별', '토끼', '펭귄', '나무', '고양이', '부엉이', '탐험가', '구글러'];
const avatars = ['🦊', '🐰', '🐧', '🐱', '🐶', '🦉', '🐻', '🐯', '🐸', '🐼', '🌟', '☁️'];

export function suggestedDisplayName(seed = Math.random()) {
  return `${adjectives[Math.floor(seed * adjectives.length) % adjectives.length]} ${nouns[Math.floor(seed * 97) % nouns.length]}`;
}

export function suggestedAvatar(name: string) {
  const value = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return avatars[value % avatars.length];
}
