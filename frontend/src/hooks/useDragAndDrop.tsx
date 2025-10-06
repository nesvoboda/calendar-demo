import { useState } from "react";

export interface PendingMeeting {
  startY: number;
  endY: number;
}

export function useDragAndDrop() {
  const [pendingMeeting, setPendingMeeting] = useState<PendingMeeting | null>(
    null
  );

  const [dragging, setDragging] = useState(false);

  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setPendingMeeting({
      startY: snapToQuarterHour(e.clientY - rect.top, rect.height),
      endY: snapToQuarterHour(e.clientY - rect.top, rect.height),
    });
  }

  function onMouseUp(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    setPendingMeeting(null);
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    if (dragging) {
      const rect = e.currentTarget.getBoundingClientRect();
      setPendingMeeting((prev) =>
        prev
          ? {
              startY: prev.startY,
              endY: snapToQuarterHour(e.clientY - rect.top, rect.height),
            }
          : null
      );
    }
  }
  return {
    pendingMeeting,
    dragging,
    mouseHandlers: { onMouseDown, onMouseUp, onMouseMove },
  };
}

export function snapToQuarterHour(y: number, dayHeight: number): number {
  const yPerMiunte = dayHeight / (24 * 60);
  const minutes = y / yPerMiunte;
  const roundedMinutes = Math.round(minutes / 15) * 15;
  return roundedMinutes * yPerMiunte;
}
