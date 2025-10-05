import type { Meeting, MeetingCreate } from "../../../domain/meetings/types";

export interface IZoomAPI {
  createMeeting(meeting: MeetingCreate): Promise<Meeting>;
  listMeetings(): Promise<Meeting[]>;
}
