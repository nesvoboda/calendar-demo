import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { MeetingAPI } from "./presentation/meetings/api";
import { openapi } from "@elysiajs/openapi";
import { cors } from "@elysiajs/cors";
import { ZoomAPIImpl } from "./infrastructure/zoom/api";
import { BookingService } from "./application/meetings/services/booking";

// Setup dotenv
import "dotenv/config";

const frontendUrl =
  process.env.NODE_ENV === "production"
    ? "https://ash-calendar-demo.netlify.app/"
    : "http://localhost:5173";

const bookingService = new BookingService(new ZoomAPIImpl());
const meetingAPI = new MeetingAPI(bookingService).createAPI();

const app = new Elysia({ adapter: node() })
  .use(openapi())
  .use(
    cors({
      origin: frontendUrl,
    })
  )
  .use(meetingAPI)
  .listen(3000, ({ hostname, port }) => {
    console.log(`🦊 Elysia is running at ${hostname}:${port}`);
  });

export default app;
