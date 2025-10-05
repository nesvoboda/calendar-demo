import type { Meeting, MeetingCreate } from "../../../domain/meetings/types";
import type { IZoomAPI } from "../interfaces/zoom";

export class BookingService {
  constructor(private readonly zoomAPI: IZoomAPI) {}

  async createMeeting(meeting: MeetingCreate): Promise<Meeting> {
    return this.zoomAPI.createMeeting(meeting);
  }

  async listMeetings(): Promise<Meeting[]> {
    return this.zoomAPI.listMeetings();
  }
}
