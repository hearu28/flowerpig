"use client";

import { useState, useEffect } from "react";
import { Waitlist } from "@/types/waitlist";
import { supabase } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface WaitlistManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WaitlistManagement({
  open,
  onOpenChange,
}: WaitlistManagementProps) {
  const [waitlist, setWaitlist] = useState<Waitlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      fetchWaitlist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fetchWaitlist = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("waitlist")
        .select("*")
        .is("completed_at", null)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setWaitlist(data || []);
    } catch (err: any) {
      setError("대기 목록 로드 실패: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (id: string) => {
    if (!confirm("이 대기를 완료 처리하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from("waitlist")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      fetchWaitlist();
    } catch (err: any) {
      setError("완료 처리 실패: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 대기를 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase.from("waitlist").delete().eq("id", id);

      if (error) throw error;
      fetchWaitlist();
    } catch (err: any) {
      setError("삭제 실패: " + err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">대기 목록 관리</DialogTitle>
        </DialogHeader>

        {error && <p className="text-sm text-destructive mb-4">{error}</p>}

        {isLoading ? (
          <p className="text-center py-8">로딩 중...</p>
        ) : waitlist.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            대기 중인 손님이 없습니다.
          </p>
        ) : (
          <div className="space-y-3">
            {waitlist.map((item, index) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {item.customer_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.people_count}명
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleComplete(item.id)}
                    className="text-xs"
                  >
                    완료
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(item.id)}
                    className="text-xs"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
