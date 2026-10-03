"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { demoState } from "@/lib/roadmap";
import { supabase } from "@/lib/supabase/client";
import type { StudentState } from "@/types";
export function useStudent() {
  const [state, setState] = useState<StudentState>(demoState);
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const latest = useRef(state);
  const owner = useRef<string | null>(null);
  const loading = useRef(false);
  latest.current = state;
  useEffect(() => {
    let active = true;
    let revision = 0;
    const load = async (id: string | null) => {
      const current = ++revision;
      loading.current = true;
      if (active) setReady(false);
      let next: StudentState = demoState();
      try {
        if (id && supabase) {
          const { data, error } = await supabase
            .from("student_states")
            .select("state")
            .eq("user_id", id)
            .maybeSingle();
          if (error) throw error;
          if (data) next = data.state as StudentState;
        } else {
          const saved = localStorage.getItem("pathpilot-guest");
          if (saved) {
            const parsed = JSON.parse(saved) as StudentState;
            if (
              !parsed.profile?.name ||
              !Array.isArray(parsed.items) ||
              !Array.isArray(parsed.activity)
            )
              throw Error("Invalid saved state");
            next = parsed;
          }
        }
        if (active && current === revision) {
          owner.current = id;
          latest.current = next;
          setUserId(id);
          setState(next);
          setError("");
        }
      } catch {
        if (active && current === revision) {
          owner.current = id;
          latest.current = next;
          setUserId(id);
          setState(next);
          setError(
            id
              ? "Cloud data could not be loaded. Sign in again before editing."
              : "Your saved demo could not be loaded. A fresh demo is ready.",
          );
        }
      } finally {
        if (active && current === revision) {
          loading.current = false;
          setReady(true);
        }
      }
    };
    if (!supabase) {
      void load(null);
      return () => {
        active = false;
      };
    }
    supabase.auth.getSession().then(({ data }) => {
      if (active) void load(data.session?.user.id || null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void load(session?.user.id || null);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  const update = useCallback((fn: (s: StudentState) => StudentState) => {
    if (loading.current) return;
    const next = fn(latest.current);
    latest.current = next;
    setState(next);
    if (!owner.current) {
      try {
        localStorage.setItem("pathpilot-guest", JSON.stringify(next));
      } catch {
        setError(
          "This browser could not save changes. Check your storage settings.",
        );
      }
    } else if (supabase)
      void supabase
        .from("student_states")
        .upsert({ user_id: owner.current, state: next })
        .then(({ error }) => {
          if (error) setError("Changes could not be synced. Please try again.");
        });
  }, []);
  return { state, update, ready, userId, error, setError };
}
