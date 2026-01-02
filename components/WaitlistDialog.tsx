"use client";

import { useState } from "react";
import { WaitlistFormData } from "@/types/waitlist";
import { supabase } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function WaitlistDialog({
  open,
  onOpenChange,
  onSuccess,
}: WaitlistDialogProps) {
  const [formData, setFormData] = useState<WaitlistFormData>({
    customer_name: "",
    people_count: 2,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.customer_name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }

    if (formData.people_count < 1 || formData.people_count > 20) {
      setError("인원수는 1명 이상 20명 이하여야 합니다.");
      return;
    }

    setIsLoading(true);

    try {
      const { error: insertError } = await supabase
        .from("waitlist")
        .insert([formData]);

      if (insertError) throw insertError;

      // 성공
      onOpenChange(false);
      setFormData({
        customer_name: "",
        people_count: 2,
      });
      if (onSuccess) onSuccess();
      alert("대기 등록이 완료되었습니다!");
    } catch (err: any) {
      setError("대기 등록 실패: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">대기 등록</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customer_name">대표자 이름</Label>
            <Input
              id="customer_name"
              value={formData.customer_name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  customer_name: e.target.value,
                }))
              }
              placeholder="이름을 입력하세요"
              required
            />
          </div>

          <div>
            <Label htmlFor="people_count">인원수</Label>
            <Input
              id="people_count"
              type="number"
              min="1"
              max="20"
              value={formData.people_count}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  people_count: parseInt(e.target.value) || 1,
                }))
              }
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              대기 등록
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
