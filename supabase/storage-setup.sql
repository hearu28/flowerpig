-- Storage bucket 생성 (Supabase Dashboard에서도 가능)
-- 참고: 이 SQL은 Supabase Dashboard의 Storage 섹션에서도 설정 가능합니다.

-- menu-media bucket 생성 (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-media', 'menu-media', true)
ON CONFLICT (id) DO NOTHING;

-- 공개 읽기 정책
CREATE POLICY "Public can view menu images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'menu-media');

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload menu images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'menu-media' AND
    auth.role() = 'authenticated'
  );

-- 인증된 사용자만 업데이트 가능
CREATE POLICY "Authenticated users can update menu images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'menu-media' AND
    auth.role() = 'authenticated'
  )
  WITH CHECK (
    bucket_id = 'menu-media' AND
    auth.role() = 'authenticated'
  );

-- 인증된 사용자만 삭제 가능
CREATE POLICY "Authenticated users can delete menu images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'menu-media' AND
    auth.role() = 'authenticated'
  );

