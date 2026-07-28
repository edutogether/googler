export type CourseLevel = 'L1' | 'L2'
export interface ResourceLink { label: string; href: string }
export interface Mission { id: string; label: string }
export interface LearningDay { id: string; title: string; description: string; resources: ResourceLink[]; missions: Mission[] }
export interface Course { id: CourseLevel; title: string; days: LearningDay[] }
