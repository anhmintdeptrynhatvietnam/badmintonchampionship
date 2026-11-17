# 🏸 HỆ THỐNG TRANG WEB GIẢI ĐẤU CẦU LÔNG CLB (BADMINTON TOURNAMENT)

Hệ thống web hoàn chỉnh dành cho các Câu Lạc Bộ Cầu Lông tổ chức giải đấu phong trào và chuyên nghiệp:
- **Dành cho Vận Động Viên:** Xem thông tin giải đấu, điều lệ, cơ cấu giải thưởng, lịch trình, đăng nhập bằng tài khoản Google, nộp form đăng ký trực tuyến, quét mã VietQR đóng lệ phí, tra cứu trạng thái xét duyệt đơn của mình, xem danh sách VĐV đã được duyệt công khai.
- **Dành cho Ban Tổ Chức (Admin Dashboard):** Đăng nhập bảo mật bằng Google Admin, thống kê KPI (tổng đơn, đã duyệt, chờ duyệt, bị từ chối, tổng số VĐV, doanh thu lệ phí), bộ lọc thông minh, phê duyệt/từ chối đơn (kèm lý do), xác nhận đóng tiền, xuất dữ liệu ra file Excel/CSV tiếng Việt để bốc thăm, cập nhật Realtime tự động khi có VĐV nộp đơn.

---

## 🏗 KIẾN TRÚC KỸ THUẬT

- **Frontend:** Thuần **HTML5, Modern JavaScript (ES6+), Tailwind CSS CDN, Font Awesome, Google Fonts**.
- **Hosting:** Hoàn toàn tĩnh (Static site), tối ưu hóa để chạy miễn phí 100% trên **GitHub Pages** (hoặc Vercel, Netlify).
- **Backend-as-a-Service:** **Supabase** (PostgreSQL Database, Google OAuth 2.0 Authentication, Row Level Security RLS bảo mật tuyệt đối, Supabase Realtime).

---

## 📁 CẤU TRÚC THƯ MỤC

```
GiaiCauLong/
│
├── index.html            # Trang chủ giải đấu (VĐV xem thông tin, đăng nhập Google, nộp form)
├── admin.html            # Dashboard quản trị kiểm soát đơn đăng ký dành cho Ban Tổ Chức
├── supabase_setup.sql    # Script SQL tạo bảng, RLS Policies và Realtime trên Supabase
├── README.md             # Hướng dẫn chi tiết cài đặt và triển khai
│
├── css/
│   └── style.css         # CSS tùy biến hiệu ứng thể thao, kính mờ (glassmorphism), scrollbar
│
└── js/
    ├── config.js         # CẤU HÌNH TRUNG TÂM: Thông tin giải đấu, danh sách Admin, Supabase Key
    ├── auth.js           # Xử lý xác thực Google OAuth & kiểm tra quyền Admin
    ├── app.js            # Logic trang chủ (Countdown, Form đăng ký, QR chuyển khoản, Đơn của tôi)
    └── admin.js          # Logic Admin Dashboard (Thống kê KPI, Duyệt đơn, Xuất CSV, Realtime)
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT TỪNG BƯỚC

### BƯỚC 1: TẠO DỰ ÁN SUPABASE MIỄN PHÍ

1. Truy cập [https://supabase.com](https://supabase.com) và bấm **Start your project** (đăng nhập bằng GitHub hoặc Email).
2. Tạo Organization mới và bấm **New Project**:
   - **Name:** `Giai-Cau-Long-CLB`
   - **Database Password:** Đặt mật khẩu an toàn và lưu lại.
   - **Region:** Chọn `Southeast Asia (Singapore)` để có tốc độ nhanh nhất tại Việt Nam.
   - Bấm **Create new project**.

---

### BƯỚC 2: CHẠY SCRIPT TẠO DATABASE

1. Trên menu bên trái của trang Supabase, bấm vào biểu tượng **SQL Editor**.
2. Mở file [supabase_setup.sql](supabase_setup.sql) trong thư mục dự án, copy toàn bộ nội dung.
3. Dán vào khung SQL Editor trên Supabase và bấm **RUN** (hoặc tổ hợp phím `Ctrl + Enter`).
4. Hệ thống sẽ tự động tạo bảng `registrations`, bảng `admin_users`, cài đặt các chính sách phân quyền bảo mật RLS và bật chế độ Realtime.

> **Mẹo:** Trong file `supabase_setup.sql`, hãy thay đổi email `'admin@gmail.com'` thành chính email Google của bạn để có quyền Admin ngay khi đăng nhập!

---

### BƯỚC 3: KÍCH HOẠT ĐĂNG NHẬP GOOGLE (GOOGLE OAUTH)

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2. Tạo một Project mới hoặc chọn Project có sẵn.
3. Vào **APIs & Services** -> **OAuth consent screen**:
   - Chọn **External** -> Bấm **Create**.
   - Điền thông tin App Name (ví dụ: `Giải Cầu Lông CLB`), điền email hỗ trợ.
4. Vào **APIs & Services** -> **Credentials** -> Bấm **Create Credentials** -> Chọn **OAuth client ID**:
   - **Application type:** Chọn `Web application`.
   - **Authorized redirect URIs:** Thêm URL Redirect lấy từ Supabase:
     - Vào Supabase Dashboard -> **Authentication** -> **Providers** -> Chọn **Google**.
     - Copy đường dẫn `Callback URL (for OAuth)` (dạng `https://<project-id>.supabase.co/auth/v1/callback`) và dán vào ô Authorized redirect URIs trên Google Cloud.
5. Sao chép **Client ID** và **Client Secret** từ Google Cloud, dán vào mục Google Provider trên Supabase -> Bật công tắc **Enable Google Provider** -> Bấm **Save**.

---

### BƯỚC 4: CẤU HÌNH FILE `js/config.js`

Mở file [js/config.js](js/config.js) và cập nhật các thông tin sau:

```javascript
const CONFIG = {
    // 1. Lấy từ Supabase: Project Settings -> API
    SUPABASE_URL: "https://your-id.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOi...",

    // 2. Điền email Google của Ban Tổ Chức (được phép vào admin.html)
    ADMIN_EMAILS: [
        "email_cua_ban@gmail.com",
        "btc.caulong@gmail.com"
    ],

    // 3. Thông tin giải đấu của bạn
    TOURNAMENT: {
        NAME: "GIẢI CẦU LÔNG CLB MỞ RỘNG 2026",
        EVENT_DATE: "25 - 26 Tháng 10, 2026",
        EVENT_LOCATION: "Nhà Thi Đấu Thể Thao Đa Năng",
        REGISTRATION_DEADLINE: "2026-10-20T23:59:59", // Hạn chót để đếm ngược
        HOTLINE: "0901.234.567",
        
        // Cấu hình tài khoản ngân hàng để tự sinh mã VietQR
        PAYMENT: {
            BANK_NAME: "MB Bank (Ngân hàng Quân Đội)",
            BANK_CODE: "MB",
            ACCOUNT_NUMBER: "090123456789",
            ACCOUNT_NAME: "NGUYEN VAN BTC",
            TRANSFER_SYNTAX: "CLB [HọTên] [SĐT]"
        }
    }
};
```

---

### BƯỚC 5: TRIỂN KHAI LÊN GITHUB PAGES (HOSTING MIỄN PHÍ)

1. Tạo một repository mới trên GitHub (ví dụ: `giai-cau-long`).
2. Mở terminal tại thư mục này và đẩy code lên:
   ```bash
   git init
   git add .
   git commit -m "Khoi tao web giai cau long CLB"
   git branch -M main
   git remote add origin https://github.com/Tên_Tài_Khoản/giai-cau-long.git
   git push -u origin main
   ```
3. Trên GitHub, vào mục **Settings** của repository -> Chọn **Pages** ở menu bên trái.
4. Tại mục **Branch**, chọn `main` và thư mục `/ (root)` -> Bấm **Save**.
5. Sau 1 - 2 phút, website của bạn sẽ hoạt động tại địa chỉ:
   `https://Tên_Tài_Khoản.github.io/giai-cau-long/`
6. **Lưu ý quan trọng cho Google Auth khi chạy trên GitHub Pages:**
   - Vào Supabase Dashboard -> **Authentication** -> **URL Configuration**.
   - Tại mục **Site URL**, nhập địa chỉ GitHub Pages của bạn:
     `https://Tên_Tài_Khoản.github.io/giai-cau-long/`
   - Tại mục **Redirect URLs**, thêm cả:
     `https://Tên_Tài_Khoản.github.io/giai-cau-long/**`

---

## 🎯 CHẾ ĐỘ XEM THỬ OFFLINE (DEMO MODE)

Nếu bạn chưa kịp đăng ký tài khoản Supabase:
- Bạn chỉ cần nhấp đúp mở file `index.html` hoặc `admin.html` trực tiếp trên trình duyệt Chrome/Edge/Firefox.
- Hệ thống có tích hợp sẵn **Mock/Demo Mode**:
  - Tại trang chủ: Có thể bấm đăng nhập giả lập, gửi form thử nghiệm và xem danh sách VĐV.
  - Tại trang Admin: Bấm nút **"Đăng Nhập Với Tài Khoản Demo Admin"** để trải nghiệm đầy đủ các tính năng kiểm duyệt, duyệt đơn, hủy đơn, lọc và xuất file Excel/CSV!

---

## 🏆 CÁC TÍNH NĂNG NỔI BẬT

1. **Giao diện hiện đại (Modern Sport UI):** Tông màu Dark Mode thể thao kết hợp xanh ngọc (Emerald), responsive hoàn hảo trên mọi kích thước màn hình từ điện thoại di động đến máy tính.
2. **VietQR tự động sinh theo nội dung thi đấu:** VĐV chọn nội dung nào (Đơn/Đôi), mã QR chuyển khoản sẽ tự động thay đổi số tiền tương ứng kèm cú pháp chuyển khoản chính xác.
3. **Phân quyền bảo mật cao với Supabase RLS:** VĐV chỉ có thể xem và quản lý đơn của chính mình. Chỉ có email nằm trong danh sách Ban Tổ Chức mới được phép xem tất cả và thao tác duyệt/xóa đơn.
4. **Realtime Dashboard:** Khi VĐV nộp đơn từ điện thoại, màn hình Admin trên máy tính của Ban Tổ Chức sẽ lập tức hiển thị đơn mới mà không cần bấm F5 tải lại trang.
5. **Xuất Excel / CSV tiếng Việt chuẩn UTF-8:** Hỗ trợ Ban Tổ Chức in danh sách và bốc thăm sơ đồ thi đấu một cách nhanh chóng.
#   b a d m i n t o n c h a m p i o n s h i p  
 