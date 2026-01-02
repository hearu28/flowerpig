-- 대기 목록 테이블 생성
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  people_count INTEGER NOT NULL CHECK (people_count > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- RLS 활성화
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 (모든 사용자가 대기 목록 조회 가능)
CREATE POLICY "Public can read waitlist"
  ON public.waitlist
  FOR SELECT
  USING (true);

-- 공개 INSERT (모든 사용자가 대기 등록 가능)
CREATE POLICY "Anyone can create waitlist entry"
  ON public.waitlist
  FOR INSERT
  WITH CHECK (true);

-- 인증된 사용자만 DELETE 가능 (관리자)
CREATE POLICY "Authenticated users can delete waitlist"
  ON public.waitlist
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- 인증된 사용자만 UPDATE 가능 (관리자)
CREATE POLICY "Authenticated users can update waitlist"
  ON public.waitlist
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at);
CREATE INDEX IF NOT EXISTS idx_waitlist_completed_at ON public.waitlist(completed_at);

