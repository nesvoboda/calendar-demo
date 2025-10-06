import { useState } from "react";

import { addMinutes, format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import type { PendingMeeting } from "@/hooks/useDragAndDrop";
import { useCreateMeeting } from "@/hooks/useMeetings";

export interface CandidateMeeting {
  date: Date;
  duration: number;
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

  const [loading, setLoading] = useState(false);

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
              if (!isTitleValid(topic)) {
                return;
              }
              setLoading(true);
              createMeeting(
                {
                  topic: topic,
                  startDate: candidateMeeting.date.toISOString(),
                  duration: candidateMeeting.duration,
                },
                {
                  onError: (err) => {
                    if (
                      err.message === "Meeting overlaps with existing meetings"
                    ) {
                      toast.error("Meeting overlaps with existing meetings", {
                        description: "Please select a different time",
                      });
                    } else {
                      toast.error("Error booking meeting", {
                        description: err.message,
                      });
                    }
                    setPendingMeeting(null);
                    setLoading(false);
                    setOpen(false);
                  },
                  onSuccess: (response) => {
                    queryClient.invalidateQueries({ queryKey: ["meetings"] });
                    setPendingMeeting(null);
                    toast.success("Meeting booked successfully", {
                      description:
                        "Meeting at " +
                        format(candidateMeeting.date, "EEEE, MMMM d, yyyy") +
                        " from " +
                        format(candidateMeeting.date, "HH:mm") +
                        " to " +
                        format(endDate, "HH:mm"),

                      action: {
                        label: "Copy meeting link",
                        onClick: () => {
                          navigator.clipboard.writeText(response.joinLink);
                          toast.success("Meeting link copied to clipboard");
                        },
                      },
                    });
                    setLoading(false);
                    setOpen(false);
                  },
                }
              );
            }}
          >
            {loading ? <Spinner /> : "Book"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function isTitleValid(title: string) {
  if (title.length === 0) {
    toast.error("Title has to be at least 1 character");
    return false;
  }
  if (title.length > 200) {
    toast.error("Title has to be less than 200 characters");
    return false;
  }
  return true;
}
