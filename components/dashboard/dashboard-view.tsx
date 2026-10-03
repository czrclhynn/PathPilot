"use client";
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
import { Button } from "@/components/ui/button";
import { progress } from "@/lib/roadmap";
import type { Profile, StudentState, Milestone, Status } from "@/types";
type Props = {
  p: Profile;
  state: StudentState;
  pct: number;
  complete: Milestone[];
  known: string[];
  improve: string[];
  missing: string[];
  career: { skills: string[] };
  go: (page: string) => void;
  itemList: (items: Milestone[], compact?: boolean) => React.ReactNode;
  next: Milestone | undefined;
  changeStatus: (id: string, status: Status) => void;
  userId: string | null;
  activitySummary: { totalThisWeek: number; streak: number };
};
export function DashboardView({
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
}: Props) {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR CAREER, IN MOTION</span>
          <h1>
            Good afternoon, {p.name.split(" ")[0]}{" "}
            <span className="wave">👋</span>
          </h1>
          <p>Small steps today. Big possibilities tomorrow.</p>
        </div>
        <Button variant="outline" onClick={() => go("My Roadmap")}>
          View my roadmap <ArrowUpRight size={16} />
        </Button>
      </div>
      <section className="journey-banner">
        <div>
          <span className="banner-tag">
            <span /> YOUR CAREER GOAL
          </span>
          <h2>Your path to {p.career}</h2>
          <p>You’ve built your foundation. Let’s keep the momentum going.</p>
          <div className="banner-progress">
            <div className="progress-track">
              <span style={{ width: `${pct}%` }} />
            </div>
            <strong>{pct}%</strong>
          </div>
          <small>
            {complete.length} of {state.items.length} milestones completed
          </small>
        </div>
        <div className="journey-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="art-node node-a">
            <Check size={20} />
          </div>
          <div className="art-node node-b">
            <Flag size={23} />
          </div>
          <div className="art-node node-c">
            <GraduationCap size={25} />
          </div>
          <div className="art-label">
            ONE STEP CLOSER <ArrowUpRight size={13} />
          </div>
          <svg viewBox="0 0 330 200">
            <path
              d="M 28 165 Q 100 165 100 105 T 240 65 L 285 35"
              fill="none"
              stroke="#8daeff"
              strokeWidth="2"
              strokeDasharray="5 7"
            />
          </svg>
        </div>
      </section>
      <div className="stats-grid">
        {[
          {
            icon: Target,
            label: "Roadmap progress",
            value: `${pct}%`,
            note: `${complete.length} milestones completed`,
            color: "blue",
          },
          {
            icon: BookOpen,
            label: "Skills completed",
            value: `${known.length}`,
            suffix: `/ ${career.skills.length}`,
            note: "Building a strong foundation",
            color: "green",
          },
          {
            icon: FolderKanban,
            label: "Portfolio projects",
            value: p.projects.length,
            note: "Ideas turned into experience",
            color: "purple",
          },
          {
            icon: ShieldCheck,
            label: "Certifications",
            value: p.certifications.length,
            note: "Your learning, recognized",
            color: "orange",
          },
        ].map((s) => (
          <div className="card stat" key={s.label}>
            <div>
              <span>{s.label}</span>
              <span className={`stat-icon ${s.color}`}>
                <s.icon size={17} />
              </span>
            </div>
            <h2>
              {s.value} <small>{s.suffix}</small>
            </h2>
            <p>{s.note}</p>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="card roadmap-card">
          <div className="section-heading">
            <div>
              <h2>Your learning roadmap</h2>
              <p>A clear path. One milestone at a time.</p>
            </div>
            <button className="text-button" onClick={() => go("My Roadmap")}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="stage-heading">
            <span className="stage-number">01</span>
            <strong>Foundation</strong>
            <span className="badge green">
              {
                state.items.slice(0, 3).filter((i) => i.status === "completed")
                  .length
              }{" "}
              / 3 completed
            </span>
          </div>
          {itemList(state.items.slice(0, 3), true)}
          <div className="stage-heading">
            <span className="stage-number blue">02</span>
            <strong>Core skills</strong>
            <span className="badge blue">Up next</span>
          </div>
          {itemList(state.items.slice(3, 5), true)}
          <div className="roadmap-footer">
            <span>
              <Flag size={15} /> Every milestone brings you closer.
            </span>
            <button className="text-button" onClick={() => go("My Roadmap")}>
              Keep going <ArrowRight size={14} />
            </button>
          </div>
        </section>
        <section className="card skill-card">
          <div className="section-heading">
            <div>
              <h2>Your skill coverage</h2>
              <p>See where you stand, and where to grow.</p>
            </div>
            <TrendingUp size={18} className="muted" />
          </div>
          <div className="coverage-ring">
            <svg viewBox="0 0 150 150">
              <circle
                cx="75"
                cy="75"
                r="62"
                fill="none"
                stroke="var(--line)"
                strokeWidth="13"
              />
              <circle
                cx="75"
                cy="75"
                r="62"
                fill="none"
                stroke="#4779ed"
                strokeWidth="13"
                strokeDasharray={`${(known.length / career.skills.length) * 390} 390`}
                strokeLinecap="round"
                transform="rotate(-90 75 75)"
              />
            </svg>
            <div>
              <strong>
                {Math.round((known.length / career.skills.length) * 100)}
                <small>%</small>
              </strong>
              <span>skill coverage</span>
            </div>
          </div>
          <div className="coverage-legend">
            <span>
              <i className="dot green-dot" />
              {known.length} established
            </span>
            <span>
              <i className="dot blue-dot" />
              {improve.length} developing
            </span>
            <span>
              <i className="dot gray-dot" />
              {missing.length} to explore
            </span>
          </div>
          {["Foundation", "Core skills", "Specialization"].map((stage) => {
            const all = state.items.filter((i) => i.stage === stage);
            const value = progress(all);
            return (
              <div className="category-progress" key={stage}>
                <div>
                  <span>{stage}</span>
                  <strong>{value}%</strong>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${value}%` }} />
                </div>
              </div>
            );
          })}
          <button className="full-link" onClick={() => go("Skill Analysis")}>
            Explore your skill gaps <ArrowUpRight size={15} />
          </button>
        </section>
        <section className="card next-card">
          <div className="section-heading">
            <div>
              <h2>Make your next move</h2>
              <p>A little focus goes a long way.</p>
            </div>
            <span className="badge">RECOMMENDED</span>
          </div>
          <div className="next-content">
            <span className="next-icon">
              <BookOpen size={23} />
            </span>
            <div>
              <h3>{next?.title || "Celebrate your completed roadmap"}</h3>
              <p>
                {next?.description ||
                  "Explore another career and keep learning."}
              </p>
              <span className="mini-meta">
                <Clock size={13} /> {next?.minutes || 30} min ·{" "}
                {next?.stage || "Next chapter"}
              </span>
            </div>
            <Button
              onClick={() => {
                if (next) changeStatus(next.id, "in_progress");
                go("My Roadmap");
              }}
            >
              Continue learning <ArrowRight size={15} />
            </Button>
          </div>
        </section>
        <section className="advisor-card">
          <span className="advisor-symbol">
            <Sparkles size={21} />
          </span>
          <div>
            <h3>A little guidance for your journey</h3>
            <p>
              Not sure what to learn next? Your AI advisor can help you find
              your focus.
            </p>
          </div>
          <button onClick={() => go("AI Advisor")}>
            Let’s talk <ArrowRight size={15} />
          </button>
        </section>
      </div>
      <div className="bottom-note">
        <span>
          <span className="dot green-dot" /> Your journey is saved{" "}
          {userId ? "to your account" : "on this device"}
        </span>
        <span>
          {activitySummary.totalThisWeek} milestones this week ·{" "}
          {activitySummary.streak} day learning streak
        </span>
      </div>
    </>
  );
}
