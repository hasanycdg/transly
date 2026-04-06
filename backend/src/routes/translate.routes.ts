import type { FastifyPluginAsync, preHandlerHookHandler } from "fastify";

import type { buildTranslateController } from "../controllers/translate.controller";

type TranslateRoutesOptions = {
  apiKeyPreHandler: preHandlerHookHandler;
  translateController: ReturnType<typeof buildTranslateController>;
};

export const translateRoutes: FastifyPluginAsync<TranslateRoutesOptions> = async (app, options) => {
  app.post(
    "/translate",
    {
      preHandler: options.apiKeyPreHandler
    },
    options.translateController.translate
  );

  app.post(
    "/translate/bulk",
    {
      preHandler: options.apiKeyPreHandler
    },
    options.translateController.translateBulk
  );
};
