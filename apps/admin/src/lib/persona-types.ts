import type { FunctionReturnType } from "convex/server";

import { api } from "@/lib/convex";

export type PersonaRow = FunctionReturnType<typeof api.forum.personas.queries.listPersonas>[number];
export type SkillRow = FunctionReturnType<typeof api.forum.personas.queries.listSkills>[number];
export type TopicRow = FunctionReturnType<typeof api.forum.personas.queries.listTopicBriefs>[number];
export type DraftRow = FunctionReturnType<typeof api.forum.personas.queries.listDrafts>[number];
export type RunRow = FunctionReturnType<typeof api.forum.personas.queries.listAutomationRuns>[number];
