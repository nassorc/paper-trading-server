import { buildServer } from "./utils/build_server";
import "dotenv/config";

const PORT = parseInt(process.env.PORT || "3001");

async function main() {
  const app = await buildServer({ logger: true });

  app.listen({ port: PORT }, (err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  });
}

main();
