import { careers } from "@/data/careers";
import type { Profile, Milestone, StudentState } from "@/types";
export function generateRoadmap(profile: Profile): Milestone[] {
  const career = careers.find((c) => c.name === profile.career) || careers[0];
  return [
    ...career.skills.map((title, i) => ({
      id: `skill-${i}`,
      title: `Learn ${title}`,
      description: `Practice ${title} through focused exercises and apply it in a small project.`,
      status: (profile.skills[title] && profile.skills[title] !== "Beginner"
        ? "completed"
        : profile.skills[title]
          ? "in_progress"
          : "not_started") as Milestone["status"],
      stage: i < 3 ? "Foundation" : i < 7 ? "Core skills" : "Specialization",
      minutes: 45,
    })),
    ...career.projects.map((title, i) => ({
      id: `project-${i}`,
      title,
      description:
        "Build, document, and publish a project that demonstrates your learning.",
      status: "not_started" as const,
      stage: "Portfolio",
      minutes: 60,
    })),
    ...[
      "Create your resume",
      "Refresh your LinkedIn profile",
      "Practice interview questions",
      "Apply for internships",
    ].map((title, i) => ({
      id: `career-${i}`,
      title,
      description:
        "Turn your learning into a clear story and take your next career step.",
      status: "not_started" as const,
      stage: "Career preparation",
      minutes: 30,
    })),
  ];
}
export const demoProfile: Profile = {
  name: "Alex Rivera",
  degree: "BS Information Technology",
  year: "3rd Year",
  school: "Northbridge University",
  graduation: "2027",
  career: "Data Analyst",
  skills: {
    HTML: "Intermediate",
    CSS: "Intermediate",
    JavaScript: "Intermediate",
    Python: "Intermediate",
    SQL: "Advanced",
    Excel: "Intermediate",
    Git: "Intermediate",
    GitHub: "Intermediate",
    Pandas: "Beginner",
  },
  certifications: [
    {
      name: "SQL Fundamentals",
      issuer: "DataCamp",
      date: "2026-07-10",
      url: "",
    },
    {
      name: "GitHub Foundations",
      issuer: "GitHub",
      date: "2026-08-22",
      url: "",
    },
  ],
  projects: [
    {
      name: "Task Distribution App",
      description: "A collaborative task management app for student teams.",
      technologies: "JavaScript, SQL",
      github: "",
      demo: "",
      category: "Web application",
    },
    {
      name: "Flight Trend Analysis",
      description: "Explored flight pricing patterns using Python.",
      technologies: "Python, Pandas",
      github: "",
      demo: "",
      category: "Data analysis",
    },
    {
      name: "Personal Recipe Tracker",
      description: "A searchable collection of recipes and ingredients.",
      technologies: "HTML, CSS, JavaScript",
      github: "",
      demo: "",
      category: "Web application",
    },
  ],
};
export function demoState(): StudentState {
  return {
    profile: demoProfile,
    items: generateRoadmap(demoProfile),
    activity: [],
    plan: null,
  };
}
export function progress(items: Milestone[]) {
  return items.length
    ? Math.round(
        (items.filter((i) => i.status === "completed").length / items.length) *
          100,
      )
    : 0;
}
