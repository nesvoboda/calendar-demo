import { useMemo, useState } from "react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  subWeeks,
  addWeeks,
  addHours,
  isAfter,
  isSameHour,
  getMinutes,
  subHours,
} from "date-fns";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { useDragAndDrop, type PendingMeeting } from "@/hooks/useDragAndDrop";

export function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  return (
    <div className="flex flex-col h-full flex-1 gap-4">
      <h1 className="text-2xl font-bold">Book your meeting</h1>
      <div className="flex flex-row gap-2">
        <Button
          variant="outline"
          onClick={() => setSelectedDate(subWeeks(selectedDate, 1))}
        >
          <ChevronLeft /> Previous week
        </Button>
        <Button
          variant="outline"
          onClick={() => setSelectedDate(addWeeks(selectedDate, 1))}
        >
          Next week <ChevronRight />
        </Button>
      </div>
      <div className="flex-1 flex flex-row gap-4 h-full">
        <Timeline />
        <Week selectedDate={selectedDate} />
      </div>
    </div>
  );
}

export function Timeline() {
  return (
    <div>
      <div className="flex flex-col h-full">
        <p className="text-sm h-12">Timeline</p>
        <div className="flex flex-col h-full">
          {Array.from({ length: 24 }).map((_, index) => (
            <div key={index} className="flex-1 h-24">
              {index}:00
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Week({ selectedDate }: { selectedDate: Date }) {
  const days = useMemo(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [selectedDate]);

  return (
    <div className="flex-1">
      <div className="flex flex-row h-full">
        {days.map((day) => (
          <Day key={day.toISOString()} date={day} />
        ))}
      </div>
    </div>
  );
}

export function Day({ date }: { date: Date }) {
  const { pendingMeeting, dragging, mouseHandlers } = useDragAndDrop();

  return (
    <div className="flex-1">
      <div className="flex flex-col h-full">
        <div className="flex flex-col h-12">
          <p className="text-sm">{format(date, "EEEE")}</p>
          <p className="text-xs">{format(date, "MMMM d")}</p>
        </div>

        <div className="flex flex-col h-full relative" {...mouseHandlers}>
          {Array.from({ length: 24 }).map((_, index) => (
            <Hour key={index} startOfHour={addHours(date, index)} />
          ))}

          {pendingMeeting && <PendingMeeting pendingMeeting={pendingMeeting} />}
        </div>
      </div>
    </div>
  );
}

function PendingMeeting({
  pendingMeeting,
}: {
  pendingMeeting: PendingMeeting;
}) {
  return (
    <div
      className="absolute bg-green-200"
      style={{
        height: `${Math.abs(pendingMeeting.endY - pendingMeeting.startY)}px`,
        top: `${Math.min(pendingMeeting.startY, pendingMeeting.endY)}px`,
        width: "100%",
      }}
    ></div>
  );
}

export function Hour({ startOfHour }: { startOfHour: Date }) {
  const bookable = isAfter(startOfHour, subHours(new Date(), 1));
  return (
    <div
      className={clsx(
        "flex-1 bg-gray-100 border-b border-r relative border-gray-200",
        bookable && "bg-green-50"
      )}
    >
      {isSameHour(startOfHour, new Date()) && <Cursor />}
    </div>
  );
}

function Cursor() {
  const minutes = getMinutes(new Date());

  return (
    <div
      className="absolute top-0 left-0 w-full h-full border-b-2 bg-gray-100 border-red-400"
      style={{ height: `${(100 / 60) * minutes}%` }}
    ></div>
  );
}
