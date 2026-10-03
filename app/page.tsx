"use client";
import { useState, useEffect } from "react";
import { requestGuidance } from "@/lib/ai/client";
import { learningActivity } from "@/lib/activity";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { Onboarding } from "@/components/onboarding";
import { AuthModal } from "@/components/auth-modal";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Compass,
  Flag,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  X,
  FolderKanban,
  CalendarDays,
  User,
  Sun,
  Moon,
  Map,
  Clock,
  Copy,
  ChevronLeft,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useStudent } from "@/hooks/use-student";
import { careers, skillGroups } from "@/data/careers";
import { generateRoadmap, progress } from "@/lib/roadmap";
import { supabase } from "@/lib/supabase/client";
import type { Profile, Status, Milestone } from "@/types";
const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "My Roadmap", icon: Map },
  { name: "Skill Analysis", icon: TrendingUp },
  { name: "Explore Careers", icon: Compass },
  { name: "Project Ideas", icon: FolderKanban },
  { name: "Weekly Plan", icon: CalendarDays },
  { name: "AI Advisor", icon: Sparkles },
  { name: "Portfolio", icon: GraduationCap },
  { name: "Profile", icon: User },
];
const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
export default function App() {
  const { state, update, ready, userId, error, setError } = useStudent();
  const [page, setPage] = useState("Home");
  const [menu, setMenu] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<string | null>(null);
  const [onboarding, setOnboarding] = useState(false);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Profile>(state.profile);
  const [auth, setAuth] = useState<"login" | "signup" | null>(null);
  const [busy, setBusy] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [],
  );
  const [hours, setHours] = useState(5);
  const [selectedDays, setSelectedDays] = useState([
    "Monday",
    "Wednesday",
    "Friday",
  ]);
  const [focus, setFocus] = useState("");
  const [generated, setGenerated] = useState("");
  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 4000);
  };
  useEffect(() => {
    const value = localStorage.getItem("pathpilot-theme") === "dark";
    setDark(value);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  useEffect(() => {
    const p = new URLSearchParams(location.search).get("page");
    if (p && [...navigation.map((n) => n.name), "Home", "Settings"].includes(p))
      setPage(p);
  }, []);
  const go = (name: string) => {
    setPage(name);
    setMenu(false);
    setDetail(null);
    setSearch("");
    history.replaceState(null, "", `?page=${encodeURIComponent(name)}`);
  };
  const p = state.profile;
  const pct = progress(state.items);
  const complete = state.items.filter((i) => i.status === "completed");
  const next = state.items.find((i) => i.status !== "completed");
  const career = careers.find((c) => c.name === p.career) || careers[0];
  const known = career.skills.filter(
    (s) => p.skills[s] && p.skills[s] !== "Beginner",
  );
  const improve = career.skills.filter((s) => p.skills[s] === "Beginner");
  const missing = career.skills.filter((s) => !p.skills[s]);
  const changeStatus = (id: string, status: Status) => {
    update((s) => ({
      ...s,
      items: s.items.map((i) => (i.id === id ? { ...i, status } : i)),
      activity:
        status === "completed"
          ? [
              ...s.activity,
              {
                date: new Date().toISOString(),
                title: s.items.find((i) => i.id === id)?.title || "Milestone",
              },
            ]
          : s.activity,
    }));
    notify(
      status === "completed"
        ? "Milestone completed. A step closer to your goal!"
        : "Roadmap updated",
    );
  };
  const startProfile = () => {
    setDraft(
      page === "Home"
        ? {
            name: "",
            degree: "",
            year: "1st Year",
            school: "",
            graduation: "2027",
            career: "Data Analyst",
            skills: {},
            certifications: [],
            projects: [],
          }
        : p,
    );
    setStep(0);
    setOnboarding(true);
  };
  async function generate() {
    setBusy(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(supabase && userId
            ? {
                Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              }
            : {}),
        },
        body: JSON.stringify({ mode: "roadmap", profile: p }),
      });
      if (!response.ok) throw Error("Unable to generate roadmap");
      const result = await response.json();
      update((s) => ({ ...s, items: result.items }));
      notify(
        result.source === "ai"
          ? "Your AI roadmap is ready"
          : "Your personalized template roadmap is ready",
      );
    } catch {
      notify("Could not generate your roadmap. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function ask(text: string) {
    if (!text.trim() || busy) return;
    setQuestion("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setBusy(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(supabase && userId
            ? {
                Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              }
            : {}),
        },
        body: JSON.stringify({
          mode: "advisor",
          profile: p,
          question: text,
          items: state.items,
        }),
      });
      if (!response.ok) throw Error();
      const data = await response.json();
      setMessages((m) => [...m, { role: "assistant", content: data.text }]);
    } catch {
      notify("The advisor could not respond. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  const activitySummary = learningActivity(state.activity);
  async function write(kind: string) {
    setBusy(true);
    try {
      const result = await requestGuidance({
        mode: "writing",
        profile: p,
        writingKind: kind,
      });
      setGenerated(result.text || "");
      notify(
        result.source === "ai"
          ? "Your AI draft is ready"
          : "Your profile-based draft is ready",
      );
    } catch {
      notify("Could not generate a draft. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  const itemList = (items: Milestone[], compact = false) => (
    <div className="milestones">
      {items.map((item) => (
        <div className="milestone" key={item.id}>
          <button
            aria-label={`Mark ${item.title} ${item.status === "completed" ? "not started" : "completed"}`}
            className={`status-check ${item.status}`}
            onClick={() =>
              changeStatus(
                item.id,
                item.status === "completed" ? "not_started" : "completed",
              )
            }
          >
            {item.status === "completed" ? (
              <Check size={14} />
            ) : item.status === "in_progress" ? (
              <span />
            ) : null}
          </button>
          <div>
            <strong>{item.title}</strong>
            <p>{compact ? item.stage : item.description}</p>
          </div>
          {!compact ? (
            <select
              aria-label={`Status for ${item.title}`}
              value={item.status}
              onChange={(e) => changeStatus(item.id, e.target.value as Status)}
            >
              <option value="not_started">Not started</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          ) : (
            <span
              className={`badge ${item.status === "completed" ? "green" : item.status === "in_progress" ? "blue" : ""}`}
            >
              {item.status === "completed"
                ? "Completed"
                : item.status === "in_progress"
                  ? "In progress"
                  : `${item.minutes} min`}
            </span>
          )}
        </div>
      ))}
    </div>
  );
  if (!ready)
    return (
      <div className="loading">
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    );
  return (
    <div className={`app ${collapsed ? "collapsed" : ""}`}>
      {page !== "Home" && (
        <>
          <aside className={`sidebar ${menu ? "mobile-open" : ""}`}>
            <button className="brand" onClick={() => go("Home")}>
              <span className="logo">
                <Compass size={25} />
              </span>
              {!collapsed && (
                <>
                  PathPilot<span className="brand-dot">.</span>
                </>
              )}
            </button>
            <div className="workspace-label">YOUR WORKSPACE</div>
            <nav>
              {navigation.map((n) => (
                <button
                  title={n.name}
                  key={n.name}
                  onClick={() => go(n.name)}
                  className={page === n.name ? "active" : ""}
                >
                  <n.icon size={19} />
                  {!collapsed && n.name}
                  {n.name === "AI Advisor" && !collapsed && (
                    <span className="new-tag">NEW</span>
                  )}
                </button>
              ))}
            </nav>
            {!collapsed && (
              <div className="sidebar-tip">
                <span className="tip-icon">
                  <Sparkles size={19} />
                </span>
                <strong>A little progress, every day.</strong>
                <p>Your next chapter starts with your next small step.</p>
                <button onClick={() => go("AI Advisor")}>
                  Talk to your AI advisor <ArrowUpRight size={15} />
                </button>
              </div>
            )}
            <div className="sidebar-bottom">
              <button onClick={() => go("Settings")}>
                <Settings size={19} />
                {!collapsed && "Settings"}
              </button>
              <button
                onClick={async () => {
                  if (supabase) await supabase.auth.signOut();
                  notify("You are now browsing in guest mode");
                  go("Home");
                }}
              >
                <LogOut size={19} />
                {!collapsed && "Log out"}
              </button>
              <button className="sidebar-user" onClick={() => go("Profile")}>
                <span className="avatar">
                  {p.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                {!collapsed && (
                  <>
                    <span>
                      <strong>{p.name}</strong>
                      <small>
                        {userId ? "Student account" : "Demo student"}
                      </small>
                    </span>
                    <MoreHorizontal size={18} />
                  </>
                )}
              </button>
            </div>
          </aside>
          <div
            className="scrim"
            onClick={() => setMenu(false)}
            hidden={!menu}
          />
        </>
      )}
      <main className={page === "Home" ? "landing-main" : ""}>
        {page !== "Home" && (
          <header className="topbar">
            <div>
              <button
                className="mobile-toggle"
                aria-label="Open navigation"
                onClick={() => setMenu(!menu)}
              >
                <Menu size={21} />
              </button>
              <button
                className="collapse-toggle"
                aria-label="Collapse sidebar"
                onClick={() => setCollapsed(!collapsed)}
              >
                <Menu size={18} />
              </button>
              <span>Workspace</span>
              <ChevronRight size={14} />
              <strong>{page}</strong>
            </div>
            <div>
              <span className="demo-label">
                <span /> {userId ? "Connected account" : "Demo workspace"}
              </span>
              <button
                className="icon-button"
                aria-label="Toggle color theme"
                onClick={() => {
                  localStorage.setItem(
                    "pathpilot-theme",
                    dark ? "light" : "dark",
                  );
                  setDark(!dark);
                }}
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button className="avatar small" onClick={() => go("Profile")}>
                {p.name[0]}
              </button>
            </div>
          </header>
        )}
        <div className="content">
          {error && (
            <div className="error-banner">
              {error}
              <button onClick={() => setError("")} aria-label="Dismiss error">
                <X size={16} />
              </button>
            </div>
          )}
          {page === "Home" ? (
            <>
              <div className="landing-nav">
                <button className="brand" onClick={() => go("Home")}>
                  <span className="logo">
                    <Compass />
                  </span>
                  PathPilot.
                </button>
                <div>
                  <Button variant="ghost" onClick={() => setAuth("login")}>
                    Log in
                  </Button>
                  <Button onClick={startProfile}>
                    Get started <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
              <section className="hero">
                <span className="eyebrow">
                  <Sparkles size={15} /> A clearer direction for your future
                </span>
                <h1>
                  Build your path.
                  <br />
                  Track your progress.
                  <br />
                  <span>Reach your career.</span>
                </h1>
                <p>
                  Turn where you are today into a plan for where you want to be.
                  Your skills, your goals, your personalized career roadmap.
                </p>
                <div className="hero-actions">
                  <Button onClick={startProfile}>
                    Create My Roadmap <ArrowRight size={17} />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => go("Explore Careers")}
                  >
                    Explore Careers
                  </Button>
                </div>
                <button className="text-button" onClick={() => go("Dashboard")}>
                  Take a look around with our demo <ArrowUpRight size={14} />
                </button>
                <div className="hero-preview">
                  <div className="section-heading">
                    <span>
                      <span className="eyebrow">YOUR NEXT CHAPTER</span>
                      <h2>From curious to career-ready.</h2>
                    </span>
                    <span className="badge blue">Personalized for you</span>
                  </div>
                  {itemList(state.items.slice(0, 4), true)}
                </div>
              </section>
              <div className="feature-grid">
                {[
                  {
                    icon: User,
                    title: "Start with your story",
                    text: "Share your education, skills, and the projects you have built.",
                  },
                  {
                    icon: Map,
                    title: "Find your direction",
                    text: "See recommended learning areas and a practical roadmap for your career.",
                  },
                  {
                    icon: TrendingUp,
                    title: "Make progress visible",
                    text: "Build projects, plan your week, and celebrate every milestone.",
                  },
                ].map((f) => (
                  <div className="card" key={f.title}>
                    <f.icon className="blue-text" />
                    <h3>{f.title}</h3>
                    <p>{f.text}</p>
                  </div>
                ))}
              </div>
              <footer>PathPilot · Your future, one step at a time.</footer>
            </>
          ) : page === "Dashboard" ? (
            <DashboardView
              {...{
                p,
                state,
                pct,
                complete,
                known,
                improve,
                missing,
                career,
                go,
                itemList,
                next,
                changeStatus,
                userId,
                activitySummary,
              }}
            />
          ) : page === "My Roadmap" ? (
            <>
              <PageTitle
                eyebrow="YOUR PERSONALIZED PATH"
                title={`Your ${p.career} roadmap`}
                subtitle={`${complete.length} completed · ${state.items.length - complete.length} remaining · ${pct}% of the way there`}
              />
              <div className="toolbar">
                <Button disabled={busy} onClick={generate}>
                  <Sparkles size={16} />
                  {busy ? "Generating…" : "Generate new roadmap"}
                </Button>
                <p>Recommended learning areas, tailored to your profile.</p>
              </div>
              {[...new Set(state.items.map((i) => i.stage))].map(
                (stage, index) => (
                  <section className="card roadmap-stage" key={stage}>
                    <div className="section-heading">
                      <h2>
                        <span className="stage-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {stage}
                      </h2>
                      <span className="badge">
                        {progress(state.items.filter((i) => i.stage === stage))}
                        % completed
                      </span>
                    </div>
                    {itemList(state.items.filter((i) => i.stage === stage))}
                  </section>
                ),
              )}
            </>
          ) : page === "Skill Analysis" ? (
            <>
              <PageTitle
                eyebrow="KNOW YOUR STARTING POINT"
                title="A clearer picture of your skills"
                subtitle={`Recommended learning areas for ${p.career}. A guide to growth, rather than a hiring checklist.`}
              />
              <div className="analysis-chart card">
                <h2>Skill coverage by learning stage</h2>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart
                    data={[
                      "Foundation",
                      "Core skills",
                      "Specialization",
                      "Portfolio",
                      "Career preparation",
                    ].map((name) => ({
                      name,
                      coverage: progress(
                        state.items.filter((i) => i.stage === name),
                      ),
                    }))}
                    layout="vertical"
                    margin={{ left: 30, right: 25 }}
                  >
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={115}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="coverage"
                      fill="#4779ed"
                      radius={[0, 5, 5, 0]}
                      barSize={17}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="feature-grid">
                {[
                  {
                    title: "Skills you already have",
                    values: known,
                    color: "green",
                    icon: CheckCircle2,
                  },
                  {
                    title: "Skills to strengthen",
                    values: improve,
                    color: "blue",
                    icon: TrendingUp,
                  },
                  {
                    title: "New areas to explore",
                    values: missing,
                    color: "",
                    icon: Plus,
                  },
                ].map((group) => (
                  <section className="card" key={group.title}>
                    <group.icon className="blue-text" />
                    <h3>{group.title}</h3>
                    <div className="chip-list">
                      {group.values.length ? (
                        group.values.map((s) => (
                          <span className={`badge ${group.color}`} key={s}>
                            {s}
                          </span>
                        ))
                      ) : (
                        <p>No skills in this group yet.</p>
                      )}
                    </div>
                  </section>
                ))}
              </div>
              <Button variant="outline" onClick={startProfile}>
                Update my skills <ArrowRight size={15} />
              </Button>
            </>
          ) : page === "Explore Careers" ? (
            <>
              <PageTitle
                eyebrow="POSSIBILITIES START HERE"
                title={detail || "Find a direction that feels like you"}
                subtitle="Explore career paths, discover useful skills, and imagine your next chapter."
              />
              {detail ? (
                (() => {
                  const c = careers.find((c) => c.name === detail)!;
                  return (
                    <>
                      <button
                        className="text-button"
                        onClick={() => setDetail(null)}
                      >
                        <ChevronLeft size={16} /> All careers
                      </button>
                      <section className="card career-detail">
                        <Compass size={40} className="blue-text" />
                        <h2>{c.name}</h2>
                        <p>{c.description}</p>
                        <h3>Common responsibilities</h3>
                        <p>
                          Collaborate with a team, solve problems, document your
                          work, and apply your technical skills to real-world
                          projects.
                        </p>
                        <h3>Recommended technical skills</h3>
                        <div className="chip-list">
                          {c.skills.map((s) => (
                            <span className="badge" key={s}>
                              {s}
                            </span>
                          ))}
                        </div>
                        <h3>Recommended soft skills</h3>
                        <p>
                          Communication · Problem solving · Collaboration ·
                          Curiosity
                        </p>
                        <h3>Suggested projects</h3>
                        {c.projects.map((t) => (
                          <p key={t}>↗ {t}</p>
                        ))}
                        <h3>Certification to explore</h3>
                        <p>{c.certification}</p>
                        <h3>Example learning path</h3>
                        <p>
                          Foundation → Core skills → Specialization → Portfolio
                          → Career preparation
                        </p>
                        <Button
                          onClick={() => {
                            const profile = { ...p, career: c.name };
                            update((s) => ({
                              ...s,
                              profile,
                              items: generateRoadmap(profile),
                            }));
                            go("My Roadmap");
                            notify("Career goal and roadmap updated");
                          }}
                        >
                          Set as my career goal <ArrowRight size={16} />
                        </Button>
                      </section>
                    </>
                  );
                })()
              ) : (
                <>
                  <div className="search-field">
                    <Search size={18} />
                    <input
                      aria-label="Search careers"
                      placeholder="Search for a career…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <span>
                      {
                        careers.filter((c) =>
                          c.name.toLowerCase().includes(search.toLowerCase()),
                        ).length
                      }{" "}
                      paths
                    </span>
                  </div>
                  <div className="career-grid">
                    {careers
                      .filter((c) =>
                        c.name.toLowerCase().includes(search.toLowerCase()),
                      )
                      .map((c, i) => (
                        <article className="card career-card" key={c.name}>
                          <Compass size={23} className="blue-text" />
                          <span className="eyebrow">
                            {i < 3 ? "POPULAR PATH" : "EXPLORE A POSSIBILITY"}
                          </span>
                          <h2>{c.name}</h2>
                          <p>{c.description}</p>
                          <div className="chip-list">
                            {c.skills.slice(0, 4).map((s) => (
                              <span className="badge" key={s}>
                                {s}
                              </span>
                            ))}
                          </div>
                          <button
                            className="full-link"
                            onClick={() => setDetail(c.name)}
                          >
                            View roadmap <ArrowUpRight size={16} />
                          </button>
                        </article>
                      ))}
                  </div>
                </>
              )}
            </>
          ) : page === "Project Ideas" ? (
            <>
              <PageTitle
                eyebrow="LEARN BY BUILDING"
                title="Your next portfolio piece"
                subtitle={`Practical project ideas for your ${p.career} journey, from first steps to bigger challenges.`}
              />
              <div className="career-grid">
                {career.projects.map((title, i) => (
                  <article className="card project-card" key={title}>
                    <div className="project-visual">
                      <FolderKanban size={44} />
                      <span>0{i + 1}</span>
                    </div>
                    <div className="project-body">
                      <span className={`badge ${i === 0 ? "green" : "blue"}`}>
                        {["Beginner", "Intermediate", "Advanced"][i]}
                      </span>
                      <h2>{title}</h2>
                      <p>
                        Apply your skills to a real-world problem. Explore a
                        public dataset or create a small prototype with clear,
                        measurable outcomes.
                      </p>
                      <h4>Skills & technologies</h4>
                      <div className="chip-list">
                        {career.skills.slice(i * 2, i * 2 + 4).map((s) => (
                          <span className="badge" key={s}>
                            {s}
                          </span>
                        ))}
                      </div>
                      <h4>Suggested features</h4>
                      <p>
                        Clean inputs, a useful interface, clear documentation,
                        and a reproducible demo.
                      </p>
                      <h4>Portfolio value</h4>
                      <p>
                        Show your process, explain your decisions, and share
                        what you learned.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (state.items.some((m) => m.title === title))
                            return notify(
                              "This project is already on your roadmap",
                            );
                          update((s) => ({
                            ...s,
                            items: [
                              ...s.items,
                              {
                                id: crypto.randomUUID(),
                                title,
                                description:
                                  "Build and publish a documented portfolio project.",
                                status: "not_started",
                                stage: "Portfolio",
                                minutes: 60,
                              },
                            ],
                          }));
                          notify("Project added to your roadmap");
                        }}
                      >
                        <Plus size={15} /> Add to my roadmap
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : page === "Weekly Plan" ? (
            <>
              <PageTitle
                eyebrow="MAKE ROOM FOR YOUR FUTURE"
                title="A little structure. A lot of progress."
                subtitle="Build a realistic weekly learning plan around your life."
              />
              <section className="card plan-settings">
                <label>
                  Hours per week
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                  />
                </label>
                <label>
                  Current focus
                  <select
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                  >
                    <option value="">Next roadmap milestones</option>
                    {[...new Set(state.items.map((i) => i.stage))].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <div>
                  <label>Learning days</label>
                  <div className="day-picker">
                    {days.map((d) => (
                      <button
                        className={selectedDays.includes(d) ? "selected" : ""}
                        key={d}
                        onClick={() =>
                          setSelectedDays((a) =>
                            a.includes(d)
                              ? a.filter((x) => x !== d)
                              : [...a, d],
                          )
                        }
                      >
                        {d.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (!selectedDays.length || hours < 1 || hours > 40)
                      return notify(
                        "Choose at least one day and between 1 and 40 hours.",
                      );
                    update((s) => ({
                      ...s,
                      plan: { hours, days: selectedDays, focus, done: [] },
                    }));
                    notify("Your weekly plan is ready");
                  }}
                >
                  <CalendarDays size={16} /> Generate plan
                </Button>
              </section>
              {state.plan ? (
                <div className="weekly-grid">
                  {state.plan.days.map((d, i) => {
                    const tasks = state.items.filter(
                      (m) =>
                        m.status !== "completed" &&
                        (!state.plan?.focus || m.stage === state.plan.focus),
                    );
                    const task = tasks[i % Math.max(tasks.length, 1)];
                    return (
                      <section className="card" key={d}>
                        <span className="eyebrow">{d}</span>
                        <h2>
                          {Math.round(
                            (state.plan!.hours * 60) / state.plan!.days.length,
                          )}{" "}
                          min
                        </h2>
                        <h3>
                          {task?.title || "Review and reflect on your learning"}
                        </h3>
                        <p>
                          {task?.description ||
                            "Document your progress and choose a new goal."}
                        </p>
                        <Button
                          variant="outline"
                          onClick={() =>
                            update((s) => ({
                              ...s,
                              plan: s.plan
                                ? {
                                    ...s.plan,
                                    done: s.plan.done.includes(d)
                                      ? s.plan.done.filter((x) => x !== d)
                                      : [...s.plan.done, d],
                                  }
                                : null,
                            }))
                          }
                        >
                          {state.plan!.done.includes(d) ? (
                            <Check size={16} />
                          ) : (
                            <Plus size={16} />
                          )}{" "}
                          {state.plan!.done.includes(d)
                            ? "Session completed"
                            : "Complete session"}
                        </Button>
                      </section>
                    );
                  })}
                </div>
              ) : (
                <Empty
                  icon={CalendarDays}
                  title="Your week, with a little more direction"
                  text="Choose your available time and learning days to make a plan you can stick to."
                />
              )}
            </>
          ) : page === "AI Advisor" ? (
            <>
              <PageTitle
                eyebrow="A THINKING PARTNER FOR YOUR JOURNEY"
                title="Let’s figure out your next step"
                subtitle="Practical guidance informed by your profile, your skills, and your goals."
              />
              <section className="card chat">
                <div className="chat-intro">
                  <span className="advisor-symbol">
                    <Sparkles size={26} />
                  </span>
                  <h2>Hi {p.name.split(" ")[0]}, what’s on your mind?</h2>
                  <p>
                    We can talk about learning, projects, or preparing for your
                    next opportunity.
                  </p>
                  <div className="prompt-grid">
                    {[
                      "What should I learn next?",
                      "What project should I build?",
                      "How can I improve my portfolio?",
                      "Am I ready for an internship?",
                    ].map((q) => (
                      <button key={q} onClick={() => ask(q)}>
                        {q}
                        <ArrowUpRight size={14} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="messages">
                  {messages.map((m, i) => (
                    <div className={`message ${m.role}`} key={i}>
                      <strong>
                        {m.role === "user" ? "You" : "PathPilot advisor"}
                      </strong>
                      <p>{m.content}</p>
                    </div>
                  ))}
                  {busy && <div className="skeleton chat-skeleton" />}
                </div>
                <form
                  className="chat-input"
                  onSubmit={(e) => {
                    e.preventDefault();
                    ask(question);
                  }}
                >
                  <input
                    aria-label="Message your career advisor"
                    placeholder="Ask anything about your career journey…"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    maxLength={2000}
                  />
                  <Button disabled={busy || !question.trim()} type="submit">
                    <ArrowRight size={18} />
                  </Button>
                </form>
                <small>
                  Guidance is a starting point. Opportunities depend on your
                  experience and the role.
                </small>
              </section>
            </>
          ) : page === "Portfolio" ? (
            <>
              <PageTitle
                eyebrow="TELL YOUR STORY"
                title="Your experience, brought together"
                subtitle="A clear snapshot of what you know, what you’ve built, and where you’re going."
              />
              <div className="portfolio-grid">
                <section className="card">
                  <span className="avatar large">{p.name[0]}</span>
                  <h2>{p.name}</h2>
                  <p>
                    {p.degree} · {p.year}
                  </p>
                  <span className="badge blue">Aspiring {p.career}</span>
                  <h3>Skills</h3>
                  <div className="chip-list">
                    {Object.keys(p.skills).map((s) => (
                      <span className="badge" key={s}>
                        {s}
                      </span>
                    ))}
                  </div>
                  <h3>Certifications</h3>
                  {p.certifications.map((c, i) => (
                    <p key={i}>
                      <ShieldCheck size={15} /> {c.name} · {c.issuer}
                    </p>
                  ))}
                  <h3>Projects</h3>
                  {p.projects.map((project, i) => (
                    <div className="portfolio-project" key={i}>
                      <strong>{project.name}</strong>
                      <p>{project.description}</p>
                      <small>{project.technologies}</small>
                    </div>
                  ))}
                  <h3>Learning progress</h3>
                  <p>
                    {pct}% roadmap completed · {complete.length} milestones
                  </p>
                  <h3>Achievements</h3>
                  <div className="chip-list">
                    {[
                      ...(complete.length ? ["First milestone completed"] : []),
                      ...(complete.length >= 5
                        ? ["5 milestones completed"]
                        : []),
                      ...(p.projects.length ? ["First project added"] : []),
                      ...(p.certifications.length
                        ? ["First certification added"]
                        : []),
                      ...(pct >= 50 ? ["Halfway there"] : []),
                    ].map((t) => (
                      <span className="badge green" key={t}>
                        <Check size={12} /> {t}
                      </span>
                    ))}
                  </div>
                </section>
                <section className="card">
                  <Sparkles className="blue-text" />
                  <h2>Find the words for your work</h2>
                  <p>
                    Generate a starting draft, then edit it to reflect your own
                    voice.
                  </p>
                  {[
                    "Professional About Me",
                    "LinkedIn About Section",
                    "Resume Project Description",
                    "GitHub Project Description",
                  ].map((t) => (
                    <button
                      className="writing-option"
                      key={t}
                      disabled={busy}
                      onClick={() => write(t)}
                    >
                      {t}
                      <ArrowUpRight size={16} />
                    </button>
                  ))}
                  {generated && (
                    <>
                      <textarea
                        className="generated-text"
                        aria-label="Generated professional text"
                        value={generated}
                        onChange={(e) => setGenerated(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(generated);
                            notify("Copied to clipboard");
                          } catch {
                            notify("Select the text and copy it manually");
                          }
                        }}
                      >
                        <Copy size={16} /> Copy text
                      </Button>
                      <small className="muted">
                        Review your draft before sharing
                      </small>
                    </>
                  )}
                </section>
              </div>
            </>
          ) : page === "Profile" ? (
            <>
              <PageTitle
                eyebrow="YOUR STORY SO FAR"
                title="A profile that grows with you"
                subtitle="Keep your skills, education, and experience up to date."
              />
              <section className="card profile-overview">
                <div className="section-heading">
                  <div>
                    <span className="avatar large">{p.name[0]}</span>
                    <h2>{p.name}</h2>
                    <p>
                      {p.degree} · {p.year}
                    </p>
                  </div>
                  <Button onClick={startProfile}>
                    Edit profile <ArrowUpRight size={16} />
                  </Button>
                </div>
                <div className="profile-facts">
                  <div>
                    <small>CAREER GOAL</small>
                    <strong>{p.career}</strong>
                  </div>
                  <div>
                    <small>SCHOOL</small>
                    <strong>{p.school || "Not specified"}</strong>
                  </div>
                  <div>
                    <small>GRADUATION</small>
                    <strong>{p.graduation}</strong>
                  </div>
                </div>
                <h3>Current skills</h3>
                <div className="chip-list">
                  {Object.entries(p.skills).map(([s, level]) => (
                    <span className="badge" key={s}>
                      {s} · {level}
                    </span>
                  ))}
                </div>
                <h3>Certifications</h3>
                {p.certifications.length ? (
                  p.certifications.map((c, i) => (
                    <div className="profile-row" key={i}>
                      <ShieldCheck size={20} />
                      <div>
                        <strong>{c.name}</strong>
                        <p>
                          {c.issuer} · {c.date}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>
                    No certifications added yet. Add your first certification in
                    your profile.
                  </p>
                )}
                <h3>Projects</h3>
                {p.projects.length ? (
                  p.projects.map((project, i) => (
                    <div className="profile-row" key={i}>
                      <FolderKanban size={20} />
                      <div>
                        <strong>{project.name}</strong>
                        <p>{project.description}</p>
                        <small>{project.technologies}</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <Empty
                    icon={FolderKanban}
                    title="No projects added yet"
                    text="Projects help PathPilot understand what you’ve already built."
                  />
                )}
              </section>
            </>
          ) : (
            <>
              <PageTitle
                eyebrow="MAKE YOURSELF AT HOME"
                title="Workspace settings"
                subtitle="A few preferences to make PathPilot feel like you."
              />
              <section className="card settings-card">
                <h3>Appearance</h3>
                <p>Choose your preferred color theme.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.setItem(
                      "pathpilot-theme",
                      dark ? "light" : "dark",
                    );
                    setDark(!dark);
                  }}
                >
                  {dark ? <Sun size={16} /> : <Moon size={16} />} Switch to{" "}
                  {dark ? "light" : "dark"} mode
                </Button>
                <h3>Your account</h3>
                <p>
                  {userId
                    ? "Your changes are synced to your Supabase account."
                    : "You’re using a demo workspace. Your changes are saved in this browser."}
                </p>
                {!userId && (
                  <Button onClick={() => setAuth("signup")}>
                    Create an account
                  </Button>
                )}
                <h3>Learning activity</h3>
                <p>
                  {state.activity.length} milestone completion events recorded.
                </p>
                {state.activity.length > 0 && (
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={activitySummary.week}>
                      <XAxis dataKey="day" />
                      <Tooltip />
                      <Area
                        dataKey="completed"
                        stroke="#4779ed"
                        fill="#e6edff"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </section>
            </>
          )}
        </div>
      </main>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
      {onboarding && (
        <Onboarding
          createNew={page === "Home"}
          {...{
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
          }}
        />
      )}
      {auth && <AuthModal {...{ auth, setAuth, busy, setBusy, notify, go }} />}
    </div>
  );
}
function PageTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}
function Empty({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof CalendarDays;
  title: string;
  text: string;
}) {
  return (
    <div className="card empty">
      <Icon size={36} />
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}
