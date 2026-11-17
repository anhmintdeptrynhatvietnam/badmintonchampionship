# 🧠 TÀI LIỆU BÀN GIAO TOÀN BỘ NGỮ CẢNH DỰ ÁN (CONTEXT HANDOVER)
> **Mục đích:** Tài liệu này chụp lại 100% "trí nhớ", toàn bộ quyết định, phong cách làm việc và lịch sử trao đổi của cuộc trò chuyện hiện tại.  
> **Dành cho AI ở máy tính mới:** Hãy đọc kỹ tài liệu này trước tiên để tiếp tục công việc một cách liền mạch, không cần hỏi lại người dùng những điều đã chốt!

---

## 1. THÔNG TIN CHỦ DỰ ÁN & PHONG CÁCH LÀM VIỆC (USER PERSONA & PREFERENCES)
- **Chủ dự án (User):** Là người làm công nghệ, tổ chức giải cầu lông nội bộ cho CLB công nghệ của mình.
- **Tâm lý & Gu thiết kế (RẤT QUAN TRỌNG):**
  - ❌ **Cực kỳ ghét giao diện AI giả tạo:** Không được tự tiện thêm các từ tiếng Anh ngớ ngẩn (như `OFFICIAL ATHLETES LIST`, `Sort: Ai nộp trước...`), không dùng các badge màu mè lòe loẹt vô nghĩa.
  - ❌ **Không dùng Dark theme u ám:** Tránh màu nền đen/tối vì trông giống web linh tinh; phải dùng **Clean Athletic Sport Theme** (nền sáng `#f8fafc`, xanh lá cầu lông `#15803d`, card trắng sạch sẽ).
  - 📱 **Ưu tiên 100% Mobile-First:** Thành viên CLB mở link 100% từ ứng dụng **Zalo/Safari trên điện thoại di động**. Tuyệt đối không dùng Table dàn ngang 9 cột trên mobile (gây tràn ngang, vỡ giao diện). Thay vào đó, danh sách VĐV phải là **Card List** tinh tế, vừa khít màn hình.
  - 🏸 **Về Ghép cặp:** Ban Tổ Chức (BTC) phải là người **tự tay ghép 100% theo ý mình**, không để máy tự ép cứng kết quả. Hệ thống đóng vai trò **Trợ lý Thông minh** tính điểm, gợi ý đối tác lý tưởng chuẩn 5★, cho phép gỡ cặp và hoán đổi người dễ dàng.
  - 📄 **Nguyên tắc Tài liệu duy nhất:** Mọi phân tích nghiệp vụ chỉ được ghi vào duy nhất file `PHAN_TICH_NGHIEP_VU.md`.

---

## 2. TỔNG HỢP TOÀN BỘ QUYẾT ĐỊNH NGHIỆP VỤ ĐÃ CHỐT 100%
1. **Quy mô:** ~20 VĐV (cả nam và nữ). Không khóa cứng slot để các thành viên nộp đơn linh hoạt.
2. **Thể thức:**
   - **Đôi Nam:** Dành cho VĐV Nam.
   - **Đôi Nam Nữ:** 1 Nam + 1 Nữ.
   - VĐV Nam được quyền chọn: [Chỉ Đôi Nam], [Chỉ Đôi Nam Nữ], hoặc [Cả Hai Nội Dung].
   - VĐV Nữ: Tham gia [Đôi Nam Nữ].
3. **Chính sách Lệ phí:**
   - Đăng ký 1 nội dung: `200.000 đ`.
   - Đăng ký **CẢ HAI NỘI DUNG:** Giảm 50% nội dung thứ hai $\rightarrow$ Tổng cộng chỉ `300.000 đ`.
   - Sinh mã VietQR động theo đúng số tiền và cú pháp: `CLB [HọTên] [SĐT]`.
   - Bắt buộc đính kèm ảnh bill chuyển khoản (có preview phóng to Lightbox cho Admin soi).
4. **Vòng đời đơn đăng ký (State Machine):**
   - 100% hành động Nộp mới (`pending_registration`), Sửa (`pending_update`), Rút đơn (`pending_withdraw`) đều phải qua Admin duyệt.
   - Khi Admin duyệt cho rút đơn: Chuyển sang `withdrawn` và trên màn hình VĐV hiện thông báo:  
     > *"Đã rút đơn thành công vui lòng liên hệ Ban Tổ Chức để nhận lại phí đăng ký!"*
5. **Thang Rank linh hoạt:**
   - Số lượng rank linh hoạt cấu hình trong `CONFIG.TOURNAMENT.RANKS`. Hiện tại quy ước 4 mức: `Lv1` (4 điểm - Hạt giống), `Lv2` (3 điểm), `Lv3` (2 điểm), `Lv4` (1 điểm).
   - VĐV tự chấm (`self_rank`) khi đăng ký $\rightarrow$ Đánh thử ngoài sân $\rightarrow$ BTC vào Dashboard gán Trình Real (`official_rank`).
6. **Thuật toán Ghép Cặp Cân Bằng Chuẩn 5★:**
   - Điểm chuẩn lý tưởng: $\text{Tổng điểm cặp} = 5★$.
   - Ghép Đầu - Đuôi: $Lv1 (4đ) + Lv4 (1đ) = 5★$ so tài cùng $Lv2 (3đ) + Lv3 (2đ) = 5★$ để mọi trận đấu đều sòng phẳng.
   - Dashboard có 2 khu vực: **Kho VĐV Chờ Ghép** và **Các Cặp Đấu Đã Ghép**.
   - Bấm vào 1 VĐV $\rightarrow$ Hệ thống lọc và đưa những đối tác tạo thành cặp 5★ lên đầu kèm nhãn xanh để BTC chọn 1 chạm.
   - Hỗ trợ nút: `Gợi Ý Xếp Mẫu` (tạo khung nháp), `Tách Hết` (trả về kho chờ), `Gỡ Cặp`, `Đổi Người (Hoán đổi 2 VĐV giữa 2 cặp)`.
   - Bấm `Công Bố Ra Web` $\rightarrow$ Tên bạn đánh cặp (`🤝 Cặp: Tên (Rank)`) hiện trực tiếp ra danh sách và vé VĐV ngoài trang chủ.

---

## 3. HIỆN TRẠNG KỸ THUẬT & KIẾN TRÚC MÃ NGUỒN

### A. Công nghệ (Zero-Bundler Architecture)
- **Frontend:** Pure HTML5, Modern Vanilla JS (ES6+), Tailwind CSS CDN, Font Awesome. Không dùng bundler (Webpack/Vite) để có thể host trực tiếp trên **GitHub Pages** hoàn toàn miễn phí.
- **Backend Cloud:** **Supabase** (Postgres Database, Google OAuth, Storage, RLS).
  - Project ID: `fqxuckmnwsvxrgtoavct`
  - URL: `https://fqxuckmnwsvxrgtoavct.supabase.co`
  - Đã khởi tạo các bảng: `public.athletes`, `public.tournament_pairs`, `public.admin_users`.
- **Chế độ Demo song song (Offline/Preview Mode):**
  - Hệ thống tự động fallback sang `localStorage` với bộ dữ liệu mẫu **16 VĐV chân thực** nếu chưa có kết nối mạng hoặc chưa đăng nhập tài khoản Google Admin thật. Bất kỳ ai mở `admin.html` đều trải nghiệm được ngay 100% tính năng.

### B. Cấu trúc các file chính
```
GiaiCauLong/
├── index.html              # Trang dành cho VĐV (3 khối: Giới thiệu, Danh sách VĐV Mobile Card List, Vé VĐV/Form nộp đơn)
├── admin.html              # Dashboard Ban Tổ Chức (4 tab: Duyệt đơn & Soi bill, Chấm trình, Ghép cặp thông minh, Xuất CSV)
├── css/
│   └── style.css           # Design system Clean Athletic, touch-friendly, rank-pill, balance-tag
├── js/
│   ├── config.js           # Cấu hình trung tâm: Supabase URL, Anon Key, Admin Emails, Thang Rank, Pricing, VietQR
│   ├── auth.js             # Quản lý xác thực Google OAuth & chế độ Demo User / Demo Admin
│   ├── app.js              # Logic trang VĐV: tính tuổi, sinh VietQR động, nộp đơn + bill, tra cứu thẻ VĐV
│   └── admin.js            # Logic Admin: duyệt đơn, soi bill, chấm rank real, trợ lý ghép cặp 5★, xuất CSV tiếng Việt
├── PHAN_TICH_NGHIEP_VU.md  # TÀI LIỆU DUY NHẤT (Single Source of Truth)
├── CONTEXT_HANDOVER.md     # Tài liệu bàn giao ngữ cảnh này
├── serve.js                # Server Node.js tĩnh chạy local (cổng 3000)
└── supabase_setup.sql      # Script DDL khởi tạo database trên Supabase
```

---

## 4. HƯỚNG DẪN DÀNH CHO AI Ở MÁY TÍNH MỚI
Khi người dùng mở dự án ở máy tính mới, AI cần:
1. Đọc file `PHAN_TICH_NGHIEP_VU.md` và `CONTEXT_HANDOVER.md`.
2. Luôn giữ phong cách giao tiếp súc tích, chuyên nghiệp, tự nhiên, không dùng văn phong robot AI.
3. Luôn tuân thủ chuẩn **Mobile-First**: mọi giao diện mới phải hiển thị đẹp và tiện bấm ngón tay trên màn hình điện thoại trước.
4. Kiểm tra các bước tiếp theo cần triển khai cùng người dùng (Xem mục 5).

---

## 5. CÁC HẠNG MỤC CẦN TRIỂN KHAI TIẾP THEO (NEXT STEPS)
1. **Google OAuth thực tế:**
   - Khi chuẩn bị chạy thật cho CLB, hướng dẫn người dùng điền Client ID & Secret từ Google Cloud Console vào Supabase Authentication Provider (để đăng nhập tài khoản Google thật).
2. **Triển khai lên GitHub Pages:**
   - Commit toàn bộ code lên GitHub Repo và bật GitHub Pages trong `Settings -> Pages -> Deploy from branch main`. Trang web sẽ có link online công khai (VD: `https://ten-user.github.io/GiaiCauLong`) gửi vào nhóm Zalo CLB.
