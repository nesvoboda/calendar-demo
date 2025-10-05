import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import meetingsApi from "./presentation/meetings/api";

const app = new Elysia({ adapter: node() })
  .get("/", () => "Hello Elysia")
  .use(meetingsApi)
  .listen(3000, ({ hostname, port }) => {
    console.log(`🦊 Elysia is running at ${hostname}:${port}`);
  });
