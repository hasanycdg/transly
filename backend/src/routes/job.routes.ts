import type { FastifyPluginAsync, preHandlerHookHandler } from "fastify";

import type { buildJobController } from "../controllers/job.controller";

type JobRoutesOptions = {
  apiKeyPreHandler: preHandlerHookHandler;
  jobController: ReturnType<typeof buildJobController>;
};

export const jobRoutes: FastifyPluginAsync<JobRoutesOptions> = async (app, options) => {
  app.get(
    "/job/:id",
    {
      preHandler: options.apiKeyPreHandler
    },
    options.jobController.getJob
  );
};
