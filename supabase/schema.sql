-- menus 테이블 생성
CREATE TABLE IF NOT EXISTS public.menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('대표', '세트', '단품', '주류', '추가')),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  tags TEXT[] DEFAULT '{}',
  allergens TEXT[] DEFAULT '{}',
  origin TEXT DEFAULT '',
  media_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_soldout BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거
CREATE TRIGGER update_menus_updated_at
  BEFORE UPDATE ON public.menus
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS 활성화
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (모든 사용자가 SELECT 가능)
CREATE POLICY "Public can read menus"
  ON public.menus
  FOR SELECT
  USING (true);

-- 인증된 사용자만 INSERT 가능 (특정 이메일만 허용하려면 조건 추가)
CREATE POLICY "Authenticated users can insert menus"
  ON public.menus
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 인증된 사용자만 UPDATE 가능
CREATE POLICY "Authenticated users can update menus"
  ON public.menus
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 인증된 사용자만 DELETE 가능
CREATE POLICY "Authenticated users can delete menus"
  ON public.menus
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_menus_category ON public.menus(category);
CREATE INDEX IF NOT EXISTS idx_menus_sort_order ON public.menus(sort_order);

-- 샘플 데이터 삽입
INSERT INTO public.menus (category, name, description, price, tags, allergens, origin, media_url, sort_order, is_soldout) VALUES
('대표', '삼겹살 세트', '신선한 국내산 삼겹살과 함께 나오는 특제 양념과 쌈야채', 25000, ARRAY['추천']::text[], ARRAY[]::text[], '국내산', NULL, 0, false),
('대표', '목살 세트', '부드러운 목살과 함께하는 꽃돼지 특제 소스', 28000, ARRAY['추천']::text[], ARRAY[]::text[], '국내산', NULL, 1, false),
('세트', '2인 세트 A', '삼겹살 300g + 목살 200g + 밑반찬 + 쌈야채', 45000, ARRAY['추천']::text[], ARRAY[]::text[], '국내산', NULL, 0, false),
('세트', '3인 세트 B', '삼겹살 400g + 목살 300g + 갈비살 200g + 밑반찬 + 쌈야채', 65000, ARRAY['추천']::text[], ARRAY[]::text[], '국내산', NULL, 1, false),
('단품', '갈비살', '프리미엄 갈비살 200g', 18000, ARRAY[]::text[], ARRAY[]::text[], '국내산', NULL, 0, false),
('단품', '항정살', '부드러운 항정살 150g', 20000, ARRAY['추천']::text[], ARRAY[]::text[], '국내산', NULL, 1, false),
('단품', '돼지껍데기', '바삭한 돼지껍데기 150g', 12000, ARRAY['맵기']::text[], ARRAY[]::text[], '국내산', NULL, 2, false),
('주류', '소주', '참이슬, 처음처럼 등', 4000, ARRAY[]::text[], ARRAY[]::text[], '', NULL, 0, false),
('주류', '맥주', '카스, 하이트 등', 5000, ARRAY[]::text[], ARRAY[]::text[], '', NULL, 1, false),
('추가', '공기밥', '흰 쌀밥', 1000, ARRAY[]::text[], ARRAY[]::text[], '', NULL, 0, false),
('추가', '된장찌개', '얼큰한 된장찌개', 8000, ARRAY[]::text[], ARRAY['대두']::text[], '국내산', NULL, 1, false),
('추가', '김치찌개', '얼큰한 김치찌개', 8000, ARRAY['맵기']::text[], ARRAY[]::text[], '국내산', NULL, 2, false);

