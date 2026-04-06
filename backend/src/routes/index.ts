import type { FastifyPluginAsync, preHandlerHookHandler } from "fastify";

import type { buildHealthController } from "../controllers/health.controller";
import type { buildJobController } from "../controllers/job.controller";
import type { buildTranslateController } from "../controllers/translate.controller";
import { healthRoutes } from "./health.routes";
import { jobRoutes } from "./job.routes";
import { translateRoutes } from "./translate.routes";

type ApiRoutesOptions = {
  apiKeyPreHandler: preHandlerHookHandler;
  controllers: {
    healthController: ReturnType<typeof buildHealthController>;
    translateController: ReturnType<typeof buildTranslateController>;
    jobController: ReturnType<typeof buildJobController>;
  };
};

export const apiRoutes: FastifyPluginAsync<ApiRoutesOptions> = async (app, options) => {
  await app.register(healthRoutes, {
    healthController: options.controllers.healthController
  });

  await app.register(translateRoutes, {
    apiKeyPreHandler: options.apiKeyPreHandler,
    translateController: options.controllers.translateController
  });

  await app.register(jobRoutes, {
    apiKeyPreHandler: options.apiKeyPreHandler,
    jobController: options.controllers.jobController
  });
};
