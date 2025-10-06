export interface Meeting {
  id: string;
  startDate: Date;
  duration: number; // in minutes
}

export interface CreatedMeeting {
  id: string;
  startDate: Date;
  duration: number; // in minutes
  joinLink: string;
}

export interface MeetingCreate {
  topic: string;
  startDate: Date;
  duration: number; // in minutes
}
