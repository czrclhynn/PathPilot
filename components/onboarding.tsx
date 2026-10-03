"use client";
import {
  Check,
  ChevronLeft,
  ArrowRight,
  Compass,
  Search,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { careers, skillGroups } from "@/data/careers";
import { generateRoadmap } from "@/lib/roadmap";
import type { Profile, StudentState } from "@/types";
type Props = {
  createNew: boolean;
  draft: Profile;
  setDraft: React.Dispatch<React.SetStateAction<Profile>>;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  setOnboarding: React.Dispatch<React.SetStateAction<boolean>>;
  p: Profile;
  update: (fn: (s: StudentState) => StudentState) => void;
  go: (page: string) => void;
  notify: (text: string) => void;
};
export function Onboarding({
  createNew,
  draft,
  setDraft,
  step,
  setStep,
  search,
  setSearch,
  setOnboarding,
  p,
  update,
  go,
  notify,
}: Props) {
  return (
    <div className="modal-backdrop">
      <section className="modal onboarding">
        <button
          className="modal-close"
          aria-label="Close profile editor"
          onClick={() => setOnboarding(false)}
        >
          <X size={20} />
        </button>
        <span className="eyebrow">
          LET’S BUILD YOUR PATH · STEP {step + 1} OF 5
        </span>
        <h2>
          {
            [
              "Start with the basics",
              "Where do you want to go?",
              "What do you already know?",
              "Recognize your learning",
              "Show what you’ve built",
            ][step]
          }
        </h2>
        <div className="step-track">
          {[0, 1, 2, 3, 4].map((s) => (
            <span className={s <= step ? "filled" : ""} key={s} />
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 4) return setStep(step + 1);
            update((s) => ({
              ...s,
              profile: draft,
              items:
                createNew || draft.career !== p.career
                  ? generateRoadmap(draft)
                  : s.items,
            }));
            setOnboarding(false);
            go("Dashboard");
            notify("Profile saved. Your next chapter is ready.");
          }}
        >
          {step === 0 ? (
            <div className="form-grid">
              {[
                { label: "Full name", key: "name", required: true },
                { label: "Course / degree", key: "degree", required: true },
                { label: "School (optional)", key: "school", required: false },
                {
                  label: "Expected graduation year",
                  key: "graduation",
                  required: true,
                },
              ].map((f) => (
                <label key={f.key}>
                  {f.label}
                  <input
                    required={f.required}
                    value={draft[f.key as "name"]}
                    onChange={(e) =>
                      setDraft({ ...draft, [f.key]: e.target.value })
                    }
                    maxLength={120}
                    pattern={f.key === "graduation" ? "20[0-9]{2}" : undefined}
                  />
                </label>
              ))}
              <label>
                Year level
                <select
                  value={draft.year}
                  onChange={(e) => setDraft({ ...draft, year: e.target.value })}
                >
                  {[
                    "1st Year",
                    "2nd Year",
                    "3rd Year",
                    "4th Year",
                    "5th Year",
                    "Graduate",
                  ].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
            </div>
          ) : step === 1 ? (
            <div className="goal-options">
              {careers.map((c) => (
                <button
                  type="button"
                  className={draft.career === c.name ? "selected" : ""}
                  key={c.name}
                  onClick={() => setDraft({ ...draft, career: c.name })}
                >
                  <Compass size={17} />
                  {c.name}
                  {draft.career === c.name && <Check size={15} />}
                </button>
              ))}
            </div>
          ) : step === 2 ? (
            <>
              <div className="search-field">
                <Search size={16} />
                <input
                  placeholder="Search skills…"
                  aria-label="Search skills"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="skills-picker">
                {Object.entries(skillGroups).map(([category, skills]) => (
                  <div key={category}>
                    <h4>{category}</h4>
                    {skills
                      .filter((s) =>
                        s.toLowerCase().includes(search.toLowerCase()),
                      )
                      .map((s) => (
                        <div className="skill-option" key={s}>
                          <label>
                            <input
                              type="checkbox"
                              checked={!!draft.skills[s]}
                              onChange={(e) => {
                                const skills = { ...draft.skills };
                                if (e.target.checked) skills[s] = "Beginner";
                                else delete skills[s];
                                setDraft({ ...draft, skills });
                              }}
                            />
                            {s}
                          </label>
                          {draft.skills[s] && (
                            <select
                              aria-label={`${s} proficiency`}
                              value={draft.skills[s]}
                              onChange={(e) =>
                                setDraft({
                                  ...draft,
                                  skills: {
                                    ...draft.skills,
                                    [s]: e.target.value,
                                  },
                                })
                              }
                            >
                              {["Beginner", "Intermediate", "Advanced"].map(
                                (v) => (
                                  <option key={v}>{v}</option>
                                ),
                              )}
                            </select>
                          )}
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </>
          ) : step === 3 ? (
            <>
              <p>
                Certifications are optional. Add the learning you’d like to
                highlight.
              </p>
              {draft.certifications.map((c, i) => (
                <div className="form-repeat" key={i}>
                  <button
                    type="button"
                    className="remove-button"
                    aria-label="Remove certification"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        certifications: draft.certifications.filter(
                          (_, j) => j !== i,
                        ),
                      })
                    }
                  >
                    <X size={16} />
                  </button>
                  {[
                    { key: "name", label: "Certification name", type: "text" },
                    { key: "issuer", label: "Issuer", type: "text" },
                    { key: "date", label: "Date earned", type: "date" },
                    {
                      key: "url",
                      label: "Credential URL (optional)",
                      type: "url",
                    },
                  ].map((f) => (
                    <label key={f.key}>
                      {f.label}
                      <input
                        type={f.type}
                        required={f.key !== "url"}
                        value={c[f.key as keyof typeof c]}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            certifications: draft.certifications.map((a, j) =>
                              j === i ? { ...a, [f.key]: e.target.value } : a,
                            ),
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
              ))}
              <Button
                variant="outline"
                type="button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    certifications: [
                      ...draft.certifications,
                      { name: "", issuer: "", date: "", url: "" },
                    ],
                  })
                }
              >
                <Plus size={16} /> Add certification
              </Button>
            </>
          ) : (
            <>
              <p>
                Your projects help tell your story. You can also come back to
                this later.
              </p>
              {draft.projects.map((project, i) => (
                <div className="form-repeat" key={i}>
                  <button
                    type="button"
                    className="remove-button"
                    aria-label="Remove project"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        projects: draft.projects.filter((_, j) => j !== i),
                      })
                    }
                  >
                    <X size={16} />
                  </button>
                  {[
                    { key: "name", label: "Project name" },
                    { key: "description", label: "Description" },
                    { key: "technologies", label: "Technologies used" },
                    { key: "github", label: "GitHub URL (optional)" },
                    { key: "demo", label: "Live demo URL (optional)" },
                    { key: "category", label: "Project category" },
                  ].map((f) => (
                    <label key={f.key}>
                      {f.label}
                      <input
                        required={[
                          "name",
                          "description",
                          "technologies",
                        ].includes(f.key)}
                        type={
                          ["github", "demo"].includes(f.key) ? "url" : "text"
                        }
                        value={project[f.key as keyof typeof project]}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            projects: draft.projects.map((a, j) =>
                              j === i ? { ...a, [f.key]: e.target.value } : a,
                            ),
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDraft({
                    ...draft,
                    projects: [
                      ...draft.projects,
                      {
                        name: "",
                        description: "",
                        technologies: "",
                        github: "",
                        demo: "",
                        category: "",
                      },
                    ],
                  })
                }
              >
                <Plus size={16} /> Add project
              </Button>
              <p className="muted">
                Changing your career goal creates a fresh roadmap. Existing
                profile edits preserve progress.
              </p>
            </>
          )}
          <div className="modal-actions">
            <Button
              type="button"
              variant="ghost"
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
            >
              <ChevronLeft size={16} /> Back
            </Button>
            <Button type="submit">
              {step === 4 ? "Save my profile" : "Continue"}
              <ArrowRight size={16} />
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
