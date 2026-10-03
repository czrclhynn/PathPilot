export type Status = "not_started" | "in_progress" | "completed";
export type Milestone = {
  id: string;
  title: string;
  description: string;
  status: Status;
  stage: string;
  minutes: number;
};
export type Credential = {
  name: string;
  issuer: string;
  date: string;
  url: string;
};
export type Project = {
  name: string;
  description: string;
  technologies: string;
  github: string;
  demo: string;
  category: string;
};
export type Profile = {
  name: string;
  degree: string;
  year: string;
  school: string;
  graduation: string;
  career: string;
  skills: Record<string, string>;
  certifications: Credential[];
  projects: Project[];
};
export type Activity = { date: string; title: string };
export type StudentState = {
  profile: Profile;
  items: Milestone[];
  activity: Activity[];
  plan: { hours: number; days: string[]; focus: string; done: string[] } | null;
};
