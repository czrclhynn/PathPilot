import { supabase } from "@/lib/supabase/client";
import type { Profile, Milestone } from "@/types";
export async function requestGuidance(input: {
  mode: "roadmap" | "advisor" | "writing";
  profile: Profile;
  question?: string;
  items?: Milestone[];
  writingKind?: string;
}): Promise<{ items?: Milestone[]; text?: string; source: "ai" | "template" }> {
  const token = supabase
    ? (await supabase.auth.getSession()).data.session?.access_token
    : null;
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!response.ok)
    throw Error("The request could not be completed. Please try again.");
  return response.json();
}
