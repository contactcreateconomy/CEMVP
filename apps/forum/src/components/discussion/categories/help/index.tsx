import { HelpBody } from "./HelpBody";
import { HelpComposeForm } from "./HelpComposeForm";
import { HelpInsights } from "./HelpInsights";
import type { CategoryTemplate } from "../types";

export const helpTemplate: CategoryTemplate = {
  key: "help",
  Body: HelpBody as CategoryTemplate["Body"],
  Insights: HelpInsights,
  ComposeForm: HelpComposeForm,
  nudge: "Include your error message and what you've already tried — it cuts reply time in half.",
};
