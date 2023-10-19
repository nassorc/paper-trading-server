import { buildServer } from "./build_server";
import "dotenv/config";

const PORT = parseInt(process.env.PORT || "3001");

async function main() {
  const app = await buildServer();

  app.listen({ port: PORT }, (err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }

    ["SIGINT", "SIGTERM"].forEach((signal) => {
      process.on(signal, async () => {
        await app.close();
      });
    });
  });
}

main();
