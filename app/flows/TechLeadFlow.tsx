import type { ReactNode } from "react";
import type { View } from "../demo/types";

export function TechLeadFlow({ view, dashboard, questions, builder, invite, review }: { view: View; dashboard: ReactNode; questions: ReactNode; builder: ReactNode; invite: ReactNode; review: ReactNode }) {
  if (view === "dashboard") return dashboard;
  if (view === "questions") return questions;
  if (view === "builder") return builder;
  if (view === "invite") return invite;
  return review;
}
