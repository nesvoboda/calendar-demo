import type { IZoomAPI } from "../../application/meetings/interfaces/zoom";
import type { Meeting, MeetingCreate } from "../../domain/meetings/types";

// ZoomApi is a CJS module unfortunately
const zoomApi = (await import("zoomapi")).default;

function createZoomClient() {
  if (
    !process.env.ZOOM_ACCOUNT_ID ||
    !process.env.ZOOM_CLIENT_ID ||
    !process.env.ZOOM_CLIENT_SECRET
  ) {
    throw new Error(
      "ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET must be set"
    );
  }
  const client = zoomApi({
    accountId: process.env.ZOOM_ACCOUNT_ID,
    oauthClientId: process.env.ZOOM_CLIENT_ID,
    oauthClientSecret: process.env.ZOOM_CLIENT_SECRET,
  });
  return client;
}

export class ZoomAPIImpl implements IZoomAPI {
  async createMeeting(meeting: MeetingCreate): Promise<Meeting> {
    const zoomAPI = createZoomClient();
    const response = await zoomAPI.meetings.CreateMeeting("me", {
      topic: meeting.topic,
      start_time: meeting.startDate.toISOString(),
      duration: meeting.duration,
      timezone: "UTC",
    });
    if (!response.uuid || !response.start_time || !response.duration) {
      throw new Error("Incorrect response from Zoom API");
    }
    return {
      id: response.uuid,
      startDate: new Date(response.start_time),
      duration: response.duration,
    };
  }

  async listMeetings(): Promise<Meeting[]> {
    const zoomAPI = createZoomClient();
    const response = await zoomAPI.meetings.ListMeetings("me");
    return response.meetings.map((meeting) => {
      if (!meeting.uuid || !meeting.start_time || !meeting.duration) {
        throw new Error("Incorrect response from Zoom API");
      }
      return {
        id: meeting.uuid,
        startDate: new Date(meeting.start_time),
        duration: meeting.duration,
      };
    });
  }
}
