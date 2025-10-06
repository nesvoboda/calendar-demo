import type { Result } from "neverthrow";
import type {
  CreatedMeeting,
  Meeting,
  MeetingCreate,
} from "../../../domain/meetings/types";

export class OverlapsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OverlapsError";
  }
}

export interface IZoomAPI {
  createMeeting(
    meeting: MeetingCreate
  ): Promise<Result<CreatedMeeting, OverlapsError>>;
  listMeetings(): Promise<Meeting[]>;
}
