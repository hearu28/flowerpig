"use client";

import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface WaitlistButtonProps {
  onClick: () => void;
  isAdmin?: boolean;
}

export function WaitlistButton({
  onClick,
  isAdmin = false,
}: WaitlistButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="default"
      size="sm"
      className="bg-red-600 hover:bg-red-700 text-white font-semibold min-h-[44px]"
    >
      <Clock className="h-4 w-4 mr-1" />
      {isAdmin ? "대기 관리" : "대기하기"}
    </Button>
  );
}
