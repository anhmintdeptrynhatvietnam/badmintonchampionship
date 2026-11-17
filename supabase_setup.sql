-- ========================================================
-- FILE SQL KHỞI TẠO HỆ THỐNG SUPABASE CHO CLB CẦU LÔNG
-- Bảng: athletes, tournament_pairs, admin_users, Storage Bucket
-- ========================================================

-- 1. Bật extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tạo bảng danh sách Admin
CREATE TABLE IF NOT EXISTS public.admin_users (
    email TEXT PRIMARY KEY,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Thêm email admin mặc định
INSERT INTO public.admin_users (email, role)
VALUES 
    ('admin@gmail.com', 'admin'),
    ('bandoantruong@gmail.com', 'admin'),
    ('mint@gmail.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 3. Tạo bảng Vận Động Viên (athletes)
CREATE TABLE IF NOT EXISTS public.athletes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Nam', 'Nữ')),
    dob DATE NOT NULL,
    height INT NOT NULL, -- cm
    weight INT NOT NULL, -- kg (bảo mật, chỉ BTC xem)
    exp_years INT NOT NULL DEFAULT 0,
    exp_months INT NOT NULL DEFAULT 0,
    self_rank TEXT NOT NULL, -- Lv1, Lv2, Lv3, Lv4
    official_rank TEXT, -- Do BTC chấm sau buổi test
    event_category TEXT NOT NULL CHECK (event_category IN ('doi_nam', 'doi_nam_nu', 'ca_hai')),
    fee_amount INT NOT NULL, -- Số tiền lệ phí (đã trừ 50% nếu chọn ca_hai)
    bill_image_url TEXT NOT NULL, -- Link ảnh bill trong Supabase Storage
    partner_name TEXT, -- Tên bạn đánh cặp sau khi ghép
    status TEXT NOT NULL DEFAULT 'pending_registration' 
        CHECK (status IN ('pending_registration', 'approved', 'rejected', 'pending_update', 'pending_withdraw', 'withdrawn')),
    reject_reason TEXT,
    withdraw_reason TEXT,
    notes TEXT
);

-- 4. Tạo bảng Cặp Đấu Ghép (tournament_pairs)
CREATE TABLE IF NOT EXISTS public.tournament_pairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('doi_nam', 'doi_nam_nu')),
    player1_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    player2_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    total_score INT, -- Điểm cân bằng
    is_published BOOLEAN DEFAULT false
);

-- 5. Bật Row Level Security (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_pairs ENABLE ROW LEVEL SECURITY;

-- Hàm kiểm tra xem user hiện tại có phải là admin không
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE email = auth.jwt() ->> 'email'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies cho bảng admin_users
CREATE POLICY "Mọi người có thể đọc admin_users để kiểm tra quyền"
ON public.admin_users FOR SELECT TO authenticated, anon USING (true);

-- Policies cho bảng athletes
-- a) Xem công khai (bảng VĐV cho toàn thể CLB xem)
CREATE POLICY "Công khai danh sách VĐV đã approved"
ON public.athletes FOR SELECT TO public
USING (status = 'approved');

-- b) Người dùng xem đơn của chính mình
CREATE POLICY "User xem đơn của chính mình"
ON public.athletes FOR SELECT TO authenticated
USING (email = (auth.jwt() ->> 'email') OR auth.uid() = user_id);

-- c) Người dùng nộp đơn mới
CREATE POLICY "User nộp đơn đăng ký"
ON public.athletes FOR INSERT TO authenticated
WITH CHECK (email = (auth.jwt() ->> 'email') OR auth.uid() = user_id);

-- d) Người dùng cập nhật đơn của chính mình (xin sửa, xin rút)
CREATE POLICY "User cập nhật đơn của mình"
ON public.athletes FOR UPDATE TO authenticated
USING (email = (auth.jwt() ->> 'email') OR auth.uid() = user_id)
WITH CHECK (email = (auth.jwt() ->> 'email') OR auth.uid() = user_id);

-- e) Admin có toàn quyền (Xem tất cả, Sửa, Xóa)
CREATE POLICY "Admin toàn quyền xem tất cả VĐV"
ON public.athletes FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Admin toàn quyền sửa VĐV"
ON public.athletes FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin toàn quyền xóa VĐV"
ON public.athletes FOR DELETE TO authenticated
USING (public.is_admin());

-- Policies cho bảng tournament_pairs
CREATE POLICY "Công khai danh sách cặp đấu khi đã xuất bản"
ON public.tournament_pairs FOR SELECT TO public
USING (is_published = true);

CREATE POLICY "Admin toàn quyền quản lý cặp đấu"
ON public.tournament_pairs FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. Kích hoạt Supabase Realtime
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.athletes, public.tournament_pairs;
COMMIT;
