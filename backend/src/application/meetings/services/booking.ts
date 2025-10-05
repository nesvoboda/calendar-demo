import type { Result } from "neverthrow";
import type { Meeting, MeetingCreate } from "../../../domain/meetings/types";
import type { IZoomAPI, OverlapsError } from "../interfaces/zoom";

export class BookingService {
  constructor(private readonly zoomAPI: IZoomAPI) {}

  async createMeeting(
    meeting: MeetingCreate
  ): Promise<Result<Meeting, OverlapsError>> {
    return this.zoomAPI.createMeeting(meeting);
  }

  async listMeetings(): Promise<Meeting[]> {
    return this.zoomAPI.listMeetings();
  }
}
