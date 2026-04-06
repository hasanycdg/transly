import { buildApp } from "./app";
import { loadEnvironmentFiles } from "./config/load-env";
import { prisma } from "./db/prisma";

async function start() {
  const { loadedPaths } = loadEnvironmentFiles();
  if (loadedPaths.length > 0) {
    console.info(`[env] Loaded environment files:\n${loadedPaths.map((item) => ` - ${item}`).join("\n")}`);
  } else {
    console.info("[env] No .env file discovered. Using process environment only.");
  }

  const { app, env } = await buildApp();

  const closeServer = async (signal: string) => {
    app.log.info({ signal }, "Shutting down translation API...");

    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGTERM", () => {
    void closeServer("SIGTERM");
  });

  process.on("SIGINT", () => {
    void closeServer("SIGINT");
  });

  try {
    await app.listen({
      host: env.API_HOST,
      port: env.API_PORT
    });

    app.log.info(
      {
        host: env.API_HOST,
        port: env.API_PORT,
        provider: env.TRANSLATION_PROVIDER,
        queueMode: env.ASYNC_MODE
      },
      "AI Translation Platform API started."
    );
  } catch (error) {
    app.log.fatal({ error }, "Failed to start AI Translation Platform API.");
    await prisma.$disconnect();
    process.exit(1);
  }
}

void start();
