import type { Result } from "neverthrow";
import type { Meeting, MeetingCreate } from "../../../domain/meetings/types";

export class OverlapsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OverlapsError";
  }
}

export interface IZoomAPI {
  createMeeting(
    meeting: MeetingCreate
  ): Promise<Result<Meeting, OverlapsError>>;
  listMeetings(): Promise<Meeting[]>;
}
