import { Elysia, t } from "elysia";
import { node } from "@elysiajs/node";
import "typebox";
import { openapi } from "@elysiajs/openapi";
import { cors } from "@elysiajs/cors";
import { err, ok } from "neverthrow";
import { v5 } from "uuid";
import zoomApi from "zoomapi";
import { addMinutes, areIntervalsOverlapping, interval } from "date-fns";
import { Mutex } from "async-mutex";
import "dotenv/config";

//#region src/presentation/meetings/types.ts
const ApiMeetingSchema = t.Object({
	id: t.String(),
	startDate: t.String({ format: "date-time" }),
	duration: t.Number()
});
const CreatedMeetingSchema = t.Object({
	id: t.String(),
	startDate: t.String({ format: "date-time" }),
	duration: t.Number(),
	joinLink: t.String()
});
const ListMeetingsResponseSchema = t.Object({ meetings: t.Array(ApiMeetingSchema) });
function domainMeetingToCreatedMeeting(meeting) {
	return {
		id: meeting.id,
		startDate: meeting.startDate.toISOString(),
		duration: meeting.duration,
		joinLink: meeting.joinLink
	};
}
function domainMeetingToApiMeeting(meeting) {
	return {
		id: meeting.id,
		startDate: meeting.startDate.toISOString(),
		duration: meeting.duration
	};
}
const MeetingCreateSchema = t.Object({
	topic: t.String({
		minLength: 1,
		maxLength: 200
	}),
	startDate: t.String({ format: "date-time" }),
	duration: t.Number()
});
function apiMeetingCreateToDomain(meeting) {
	return {
		topic: meeting.topic,
		startDate: new Date(meeting.startDate),
		duration: meeting.duration
	};
}

//#endregion
//#region src/presentation/meetings/api.ts
var MeetingAPI = class {
	constructor(bookingService$1) {
		this.bookingService = bookingService$1;
	}
	createAPI() {
		return new Elysia({ prefix: "/meetings" }).get("/", async () => {
			return { meetings: (await this.bookingService.listMeetings()).map((meeting) => domainMeetingToApiMeeting(meeting)) };
		}, { response: ListMeetingsResponseSchema }).post("/", async ({ body, status }) => {
			const result = await this.bookingService.createMeeting(apiMeetingCreateToDomain(body));
			if (result.isErr()) return status(400, { message: result.error.message });
			return domainMeetingToCreatedMeeting(result.value);
		}, {
			body: MeetingCreateSchema,
			response: {
				200: CreatedMeetingSchema,
				400: t.Object({ message: t.String() })
			}
		});
	}
};

//#endregion
//#region src/infrastructure/zoom/api.ts
function createZoomClient() {
	if (!process.env.ZOOM_ACCOUNT_ID || !process.env.ZOOM_CLIENT_ID || !process.env.ZOOM_CLIENT_SECRET) throw new Error("ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET must be set");
	return zoomApi({
		accountId: process.env.ZOOM_ACCOUNT_ID,
		oauthClientId: process.env.ZOOM_CLIENT_ID,
		oauthClientSecret: process.env.ZOOM_CLIENT_SECRET
	});
}
const namespace = crypto.randomUUID();
var ZoomAPIImpl = class {
	async createMeeting(meeting) {
		const response = await createZoomClient().meetings.CreateMeeting("me", {
			topic: meeting.topic,
			start_time: meeting.startDate.toISOString(),
			duration: meeting.duration,
			timezone: "UTC"
		});
		if (!response.uuid || !response.start_time || !response.duration || !response.join_url) throw new Error("Incorrect response from Zoom API");
		return ok({
			id: v5(response.uuid, namespace),
			startDate: new Date(response.start_time),
			duration: response.duration,
			joinLink: response.join_url
		});
	}
	async listMeetings() {
		return (await createZoomClient().meetings.ListMeetings("me")).meetings.map((meeting) => {
			if (!meeting.uuid || !meeting.start_time || !meeting.duration) throw new Error("Incorrect response from Zoom API");
			return {
				id: v5(meeting.uuid, namespace),
				startDate: new Date(meeting.start_time),
				duration: meeting.duration
			};
		});
	}
};

//#endregion
//#region src/application/meetings/interfaces/zoom.ts
var OverlapsError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "OverlapsError";
	}
};

//#endregion
//#region src/application/meetings/services/booking.ts
var BookingService = class {
	constructor(zoomAPI) {
		this.zoomAPI = zoomAPI;
	}
	mutex = new Mutex();
	async createMeeting(meeting) {
		return await this.mutex.runExclusive(async () => {
			const intervals = (await this.listMeetings()).map((m) => interval(m.startDate, addMinutes(m.startDate, m.duration)));
			const candidateInterval = interval(meeting.startDate, addMinutes(meeting.startDate, meeting.duration));
			if (intervals.some((interval$1) => areIntervalsOverlapping(candidateInterval, interval$1))) return err(new OverlapsError("Meeting overlaps with existing meetings"));
			return await this.zoomAPI.createMeeting(meeting);
		});
	}
	async listMeetings() {
		return this.zoomAPI.listMeetings();
	}
};

//#endregion
//#region src/index.ts
const bookingService = new BookingService(new ZoomAPIImpl());
const meetingAPI = new MeetingAPI(bookingService).createAPI();
const app = new Elysia({ adapter: node() }).use(openapi()).use(cors({ origin: "*" })).use(meetingAPI).listen(3e3, ({ hostname, port }) => {
	console.log(`🦊 Elysia is running at ${hostname}:${port}`);
});
var src_default = app;

//#endregion
export { src_default as default };