import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import meetingsApi from "./presentation/meetings/api";
import { openapi } from "@elysiajs/openapi";
import { cors } from "@elysiajs/cors";

// Setup dotenv
import "dotenv/config";

const app = new Elysia({ adapter: node() })
  .use(openapi())
  .use(
    cors({
      origin: "*", // TODO: Change to the actual origin
    })
  )
  .use(meetingsApi)
  .listen(3000, ({ hostname, port }) => {
    console.log(`🦊 Elysia is running at ${hostname}:${port}`);
  });
