import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { MeetingAPI } from "./presentation/meetings/api";
import { openapi } from "@elysiajs/openapi";
import { cors } from "@elysiajs/cors";
import { ZoomAPIImpl } from "./infrastructure/zoom/api";
import { BookingService } from "./application/meetings/services/booking";

// Setup dotenv
import "dotenv/config";

const bookingService = new BookingService(new ZoomAPIImpl());
const meetingAPI = new MeetingAPI(bookingService).createAPI();

const app = new Elysia({ adapter: node() })
  .use(openapi())
  .use(
    cors({
      origin: "*", // TODO: Change to the actual origin
    })
  )
  .use(meetingAPI)
  .listen(3000, ({ hostname, port }) => {
    console.log(`🦊 Elysia is running at ${hostname}:${port}`);
  });
