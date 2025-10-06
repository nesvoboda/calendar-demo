import { Type } from "typebox";
import { t } from "elysia";
import type {
  Meeting as DomainMeeting,
  CreatedMeeting as DomainCreatedMeeting,
  MeetingCreate as DomainMeetingCreate,
} from "../../domain/meetings/types";

export const ApiMeetingSchema = t.Object({
  id: t.String(),
  startDate: t.String({ format: "date-time" }),
  duration: t.Number(),
});

export const CreatedMeetingSchema = t.Object({
  id: t.String(),
  startDate: t.String({ format: "date-time" }),
  duration: t.Number(),
  joinLink: t.String(),
});
export type CreatedMeeting = Type.Static<typeof CreatedMeetingSchema>;

export type ApiMeeting = Type.Static<typeof ApiMeetingSchema>;

export const ListMeetingsResponseSchema = t.Object({
  meetings: t.Array(ApiMeetingSchema),
});

export type ListMeetingsResponse = Type.Static<
  typeof ListMeetingsResponseSchema
>;

export function domainMeetingToCreatedMeeting(
  meeting: DomainCreatedMeeting
): Required<CreatedMeeting> {
  return {
    id: meeting.id,
    startDate: meeting.startDate.toISOString(),
    duration: meeting.duration,
    joinLink: meeting.joinLink,
  };
}

export function domainMeetingToApiMeeting(
  meeting: DomainMeeting
): Required<ApiMeeting> {
  return {
    id: meeting.id,
    startDate: meeting.startDate.toISOString(),
    duration: meeting.duration,
  };
}

export const MeetingCreateSchema = t.Object({
  topic: t.String({ minLength: 1, maxLength: 200 }),
  startDate: t.String({ format: "date-time" }),
  duration: t.Number(),
});

export type MeetingCreate = Type.Static<typeof MeetingCreateSchema>;

export function apiMeetingCreateToDomain(
  meeting: Required<MeetingCreate>
): Required<DomainMeetingCreate> {
  return {
    topic: meeting.topic,
    startDate: new Date(meeting.startDate),
    duration: meeting.duration,
  };
}
