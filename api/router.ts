import { createRouter, publicQuery } from "./middleware";
import { studentProfileRouter } from "./routers/studentProfile";
import { emailAnalysisRouter } from "./routers/emailAnalysis";
import { opportunityRouter } from "./routers/opportunity";
import { processRouter } from "./routers/process";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  profile: studentProfileRouter,
  emails: emailAnalysisRouter,
  opportunities: opportunityRouter,
  process: processRouter,
});

export type AppRouter = typeof appRouter;
