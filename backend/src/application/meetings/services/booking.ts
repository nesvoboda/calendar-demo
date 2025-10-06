import { err, type Result } from "neverthrow";
import type {
  CreatedMeeting,
  Meeting,
  MeetingCreate,
} from "../../../domain/meetings/types";
import { OverlapsError, type IZoomAPI } from "../interfaces/zoom";
import { addMinutes, areIntervalsOverlapping, interval } from "date-fns";

import { Mutex } from "async-mutex";

export class BookingService {
  constructor(private readonly zoomAPI: IZoomAPI) {}
  private readonly mutex = new Mutex();

  async createMeeting(
    meeting: MeetingCreate
  ): Promise<Result<CreatedMeeting, OverlapsError>> {
    return await this.mutex.runExclusive(async () => {
      const meetings = await this.listMeetings();
      const intervals = meetings.map((m) =>
        interval(m.startDate, addMinutes(m.startDate, m.duration))
      );
      const candidateInterval = interval(
        meeting.startDate,
        addMinutes(meeting.startDate, meeting.duration)
      );
      if (
        intervals.some((interval) =>
          areIntervalsOverlapping(candidateInterval, interval)
        )
      ) {
        return err(
          new OverlapsError("Meeting overlaps with existing meetings")
        );
      }
      return await this.zoomAPI.createMeeting(meeting);
    });
  }

  async listMeetings(): Promise<Meeting[]> {
    return this.zoomAPI.listMeetings();
  }
}
