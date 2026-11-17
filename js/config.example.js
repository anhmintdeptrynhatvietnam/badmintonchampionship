/**
 * ========================================================
 * CẤU HÌNH HỆ THỐNG MẪU (CONFIG TEMPLATE)
 * Hướng dẫn: Đổi tên file này thành `config.js` và điền thông tin của bạn.
 * File `config.js` đã được thêm vào `.gitignore` để tránh lộ key lên GitHub.
 * ========================================================
 */

const CONFIG = {
    // 1. Kết nối Supabase (Lấy từ Supabase Dashboard -> Project Settings -> API)
    // Lưu ý: Anon Key là Publishable Key công khai cho Client, được bảo vệ bằng RLS.
    // TUYỆT ĐỐI KHÔNG dùng service_role key ở đây!
    SUPABASE_URL: "https://YOUR_PROJECT_ID.supabase.co",
    SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY_HERE",

    // 2. Danh sách Email Google của Ban Tổ Chức (được phép duyệt đơn và chấm rank)
    ADMIN_EMAILS: [
        "admin@gmail.com",
        "btc.caulong@gmail.com"
    ],

    // 3. Thông tin Giải đấu & Quy định
    TOURNAMENT: {
        NAME: "GIẢI CẦU LÔNG CLB CÔNG NGHỆ 2026",
        TAGLINE: "Giải Cầu Lông Nội Bộ CLB - Cân Bằng Trình Độ",
        ORGANIZER: "Ban Tổ Chức CLB Cầu Lông",
        EVENT_DATE: "Dự kiến 25 - 26 Tháng 10, 2026",
        LOCATION: "Sân Cầu Lông CLB",
        HOTLINE: "0901.234.567 (Zalo BTC)",
        
        // Thang Level xếp hạng
        RANKS: [
            { id: "Lv1", label: "Level 1", title: "Hạt giống / Cứng", desc: "Kỹ thuật toàn diện, tấn công & thủ uy lực", badgeClass: "badge-rank-lv1" },
            { id: "Lv2", label: "Level 2", title: "Khá / Kinh nghiệm", desc: "Kỹ thuật cơ bản tốt, chơi lâu năm", badgeClass: "badge-rank-lv2" },
            { id: "Lv3", label: "Level 3", title: "Trung bình / Phong trào", desc: "Đánh bền sức, đều tay, phong trào", badgeClass: "badge-rank-lv3" },
            { id: "Lv4", label: "Level 4", title: "Mới chơi / Tiềm năng", desc: "Tập chơi dưới 1 năm, cần người kéo", badgeClass: "badge-rank-lv4" }
        ],

        // Chính sách lệ phí & Giảm 50% cho nội dung thứ hai
        PRICING: {
            SINGLE_EVENT_FEE: 200000, // 200.000 đ cho 1 nội dung
            BOTH_EVENTS_FEE: 300000,  // 200k + (200k x 50%) = 300.000 đ khi đánh CẢ HAI
            DISCOUNT_PERCENT: 50
        },

        // Cấu hình tài khoản ngân hàng sinh mã VietQR
        PAYMENT: {
            BANK_NAME: "MB Bank (Ngân Hàng Quân Đội)",
            BANK_CODE: "MB",
            ACCOUNT_NUMBER: "090123456789",
            ACCOUNT_NAME: "BAN TO CHUC CAU LONG",
            SYNTAX_PREFIX: "CLB"
        }
    }
};
