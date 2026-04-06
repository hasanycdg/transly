import type { FastifyPluginAsync } from "fastify";

import type { buildHealthController } from "../controllers/health.controller";

type HealthRoutesOptions = {
  healthController: ReturnType<typeof buildHealthController>;
};

export const healthRoutes: FastifyPluginAsync<HealthRoutesOptions> = async (app, options) => {
  app.get(
    "/health",
    {
      config: {
        rateLimit: false
      }
    },
    options.healthController.getHealth
  );
};
