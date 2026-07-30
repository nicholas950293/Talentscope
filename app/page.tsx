import type { Metadata } from "next";
import TalentScopeApp from "./TalentScopeApp";

export const metadata: Metadata = {
  title: "Talentscope｜面試協作平台",
  description: "串起招募、出題、作答與技術審核的三角色面試協作平台。",
};

export default function Home() {
  return <TalentScopeApp />;
}
