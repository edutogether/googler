export type CourseLevel = 'L1' | 'L2';

export type ResourceLink = { label: string; url: string };

export type Mission = { id: string; progressKey: string; text: string };

export type LearningDay = {
  id: string;
  progressKey: string;
  day: string;
  theme: string;
  title: string;
  description: string;
  resources: { help: ResourceLink; youtube: ResourceLink; education: ResourceLink };
  missions: Mission[];
};

export type Course = {
  id: string;
  level: CourseLevel;
  title: string;
  description: string;
  days: LearningDay[];
};
