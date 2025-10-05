import { Elysia, t } from "elysia";
import type { BookingService } from "../../application/meetings/services/booking";
import {
  apiMeetingCreateToDomain,
  ApiMeetingSchema,
  domainMeetingToApiMeeting,
  ListMeetingsResponseSchema,
  MeetingCreateSchema,
} from "./types";
export class MeetingAPI {
  constructor(private readonly bookingService: BookingService) {}

  createAPI() {
    const meetingsApi = new Elysia({
      prefix: "/meetings",
    })
      // List all meetings
      .get(
        "/",
        async () => {
          const meetings = await this.bookingService.listMeetings();

          return {
            meetings: meetings.map((meeting) =>
              domainMeetingToApiMeeting(meeting)
            ),
          };
        },
        {
          response: ListMeetingsResponseSchema,
        }
      )

      // Create a meeting
      .post(
        "/",
        async ({ body }) => {
          const result = await this.bookingService.createMeeting(
            apiMeetingCreateToDomain(body)
          );
          if (result.isErr()) {
            return {
              message: result.error.message,
            };
          }
          return domainMeetingToApiMeeting(result.value);
        },
        {
          body: MeetingCreateSchema,
          response: {
            200: ApiMeetingSchema,
            400: t.Object({
              message: t.String(),
            }),
          },
        }
      );
    return meetingsApi;
  }
}
