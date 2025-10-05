import { err, type Result } from "neverthrow";
import type { Meeting, MeetingCreate } from "../../../domain/meetings/types";
import { OverlapsError, type IZoomAPI } from "../interfaces/zoom";
import { addMinutes, interval, isWithinInterval } from "date-fns";
export class BookingService {
  constructor(private readonly zoomAPI: IZoomAPI) {}

  async createMeeting(
    meeting: MeetingCreate
  ): Promise<Result<Meeting, OverlapsError>> {
    const meetings = await this.listMeetings();
    const intervals = meetings.map((m) =>
      interval(m.startDate, addMinutes(m.startDate, m.duration))
    );
    if (
      intervals.some((interval) =>
        isWithinInterval(meeting.startDate, interval)
      )
    ) {
      return err(new OverlapsError("Meeting overlaps with existing meetings"));
    }
    return this.zoomAPI.createMeeting(meeting);
  }

  async listMeetings(): Promise<Meeting[]> {
    return this.zoomAPI.listMeetings();
  }
}
