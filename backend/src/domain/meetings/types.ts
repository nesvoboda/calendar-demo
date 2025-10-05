export interface Meeting {
  id: string;
  startDate: Date;
  duration: number; // in minutes
}

export interface MeetingCreate {
  topic: string;
  startDate: Date;
  duration: number; // in minutes
}
