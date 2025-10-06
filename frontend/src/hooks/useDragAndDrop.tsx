import { useState } from "react";

import { addMinutes, differenceInMinutes, format, isAfter } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCreateMeeting } from "./useMeetings";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export interface PendingMeeting {
  startY: number;
  endY: number;
}

export interface CandidateMeeting {
  date: Date;
  duration: number;
}

export function useDragAndDrop({ selectedDate }: { selectedDate: Date }) {
  const [pendingMeeting, setPendingMeeting] = useState<PendingMeeting | null>(
    null
  );

  const [dragging, setDragging] = useState(false);

  const [open, setOpen] = useState(false);
  const [candidateMeeting, setCandidateMeeting] = useState<{
    date: Date;
    duration: number;
  } | null>(null);

  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();

    const date = offsetToDate(
      selectedDate,
      snapToQuarterHour(e.clientY - rect.top, rect.height),
      rect.height
    );
    // We can only book meetings in the future
    if (!isAfter(date, new Date())) return;

    setPendingMeeting({
      startY: snapToQuarterHour(e.clientY - rect.top, rect.height),
      endY: snapToQuarterHour(e.clientY - rect.top, rect.height),
    });
  }

  function onMouseUp(e: React.MouseEvent<HTMLDivElement>) {
    if (!pendingMeeting) return;
    e.preventDefault();

    setDragging(false);

    const rect = e.currentTarget.getBoundingClientRect();
    setCandidateMeeting(
      getPendingDate(pendingMeeting, selectedDate, rect.height)
    );

    setOpen(true);
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

  function MakeWrapper({ children }: { children: React.ReactNode }) {
    return (
      <MeetingCreateDialog
        open={open}
        setOpen={setOpen}
        candidateMeeting={candidateMeeting}
        setPendingMeeting={setPendingMeeting}
        setCandidateMeeting={setCandidateMeeting}
      >
        {children}
      </MeetingCreateDialog>
    );
  }

  return {
    pendingMeeting,
    dragging,
    mouseHandlers: { onMouseDown, onMouseUp, onMouseMove },
    DnDWrapper: MakeWrapper,
  };
}

export function snapToQuarterHour(y: number, dayHeight: number): number {
  const yPerMiunte = dayHeight / (24 * 60);
  const minutes = y / yPerMiunte;
  const roundedMinutes = Math.round(minutes / 15) * 15;
  return roundedMinutes * yPerMiunte;
}

function getPendingDate(
  pendingMeeting: PendingMeeting,
  selectedDate: Date,
  dayHeight: number
): CandidateMeeting {
  const startOffset = Math.min(pendingMeeting.startY, pendingMeeting.endY);
  const endOffset = Math.max(pendingMeeting.startY, pendingMeeting.endY);
  const startDate = offsetToDate(selectedDate, startOffset, dayHeight);
  const endDate = offsetToDate(selectedDate, endOffset, dayHeight);
  const duration = differenceInMinutes(endDate, startDate);
  return {
    date: startDate,
    duration,
  };
}

function offsetToDate(
  currentDate: Date,
  offset: number,
  dayHeight: number
): Date {
  const yPerMiunte = dayHeight / (24 * 60);
  const minutes = offset / yPerMiunte;
  return addMinutes(currentDate, minutes);
}

export function MeetingCreateDialog({
  open,
  setOpen,
  candidateMeeting,
  setPendingMeeting,
  children,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  candidateMeeting: CandidateMeeting | null;
  setPendingMeeting: (pendingMeeting: PendingMeeting | null) => void;
  children: React.ReactNode;
}) {
  if (!candidateMeeting) return children;

  const [topic, setTopic] = useState("");

  const endDate = addMinutes(candidateMeeting.date, candidateMeeting.duration);
  const { mutate: createMeeting } = useCreateMeeting();
  const queryClient = useQueryClient();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {children}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Book a meeting</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <p>
              You are booking a meeting for the following time:
              {format(candidateMeeting?.date, "EEEE, MMMM d, yyyy")} from{" "}
              {format(candidateMeeting.date, "HH:mm")} to{" "}
              {format(endDate, "HH:mm")}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2">
          <Label>Topic</Label>
          <Input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setOpen(false);
              setPendingMeeting(null);
            }}
          >
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={(e) => {
              e.preventDefault();
              createMeeting(
                {
                  topic: topic,
                  startDate: candidateMeeting.date.toISOString(),
                  duration: candidateMeeting.duration,
                },
                {
                  onSettled: () => {
                    queryClient.invalidateQueries({ queryKey: ["meetings"] });
                    setPendingMeeting(null);
                    setOpen(false);
                  },
                }
              );
            }}
          >
            Book
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
