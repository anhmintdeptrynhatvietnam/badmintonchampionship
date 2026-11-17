/**
 * ========================================================
 * CẤU HÌNH HỆ THỐNG GIẢI CẦU LÔNG CLB (TECH EDITION)
 * ========================================================
 */

const CONFIG = {
    // 1. Kết nối Supabase đã tích hợp qua Supabase MCP
    SUPABASE_URL: "https://fqxuckmnwsvxrgtoavct.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHVja21ud3N2eHJndG9hdmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3MjQxMjUsImV4cCI6MjExMDMwMDEyNX0.CmJHQLLwFtVeolm9zSV5IA6-xOq8AowQ7iWgRl0ote8",

    // 2. Danh sách Email Admin Ban Tổ Chức
    // (Bác có thể thêm email Google của các thành viên BTC vào đây)
    ADMIN_EMAILS: [
        "admin@gmail.com",
        "bandoantruong@gmail.com",
        "mint@gmail.com"
    ],

    // 3. Thông tin Giải đấu & Quy định
    TOURNAMENT: {
        NAME: "TECH BADMINTON CHAMPIONSHIP 2026",
        TAGLINE: "Giải Cầu Lông Nội Bộ CLB Công Nghệ - Cân Bằng Trình Độ",
        ORGANIZER: "Ban Tổ Chức CLB Cầu Lông Công Nghệ",
        EVENT_DATE: "Dự kiến 25 - 26 Tháng 10, 2026",
        LOCATION: "Sân Cầu Lông Tiêu Chuẩn Quốc Tế",
        HOTLINE: "0901.234.567 (Zalo BTC)",
        
        // Thang Level xếp hạng (Linh hoạt cấu hình)
        RANKS: [
            { id: "Lv1", label: "Level 1", title: "Hạt giống / Cứng", desc: "Kỹ thuật toàn diện, tấn công & thủ uy lực, điều cầu biến hóa", badgeClass: "badge-rank-lv1" },
            { id: "Lv2", label: "Level 2", title: "Khá / Kinh nghiệm", desc: "Kỹ thuật cơ bản tốt, chơi lâu năm, phối hợp đôi linh hoạt", badgeClass: "badge-rank-lv2" },
            { id: "Lv3", label: "Level 3", title: "Trung bình / Phong trào", desc: "Đánh bền sức, đều tay, đôi khi còn lỗi bắt lưới/phông", badgeClass: "badge-rank-lv3" },
            { id: "Lv4", label: "Level 4", title: "Mới chơi / Tiềm năng", desc: "Tập chơi dưới 1 năm, bước chân chưa chuẩn, cần người kéo", badgeClass: "badge-rank-lv4" }
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

// Khởi tạo client Supabase
let supabaseClient = null;
if (typeof supabase !== 'undefined' && CONFIG.SUPABASE_URL) {
    try {
        supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    } catch (e) {
        console.warn("Lỗi khởi tạo Supabase Client:", e);
    }
}
