# 📋 BẢNG PHÂN TÍCH TOÀN BỘ NGHIỆP VỤ GIẢI CẦU LÔNG CLB
> **TÀI LIỆU DUY NHẤT (SINGLE SOURCE OF TRUTH)**  
> Mọi yêu cầu nghiệp vụ, luồng xử lý, quy tắc ghép cặp, bảng biểu và thiết kế kỹ thuật đều được tập trung duy nhất tại file này.  
> Cập nhật lần cuối: 15/11/2026.

---

## 🎯 BẢNG TIẾN ĐỘ & TRẠNG THÁI PHÂN TÍCH

| Mã | Hạng mục phân tích | Trạng thái | Ghi chú tóm tắt sau khi đã thống nhất |
|:---:|:---|:---:|:---|
| **HM-01** | Quy mô, Đối tượng & Thể thức thi đấu | <span style="color:green">✔ ĐÃ XONG</span> | CLB ~20 VĐV, Đôi Nam & Đôi Nam Nữ, đăng ký cá nhân |
| **HM-02** | Hồ sơ VĐV & Form đăng ký chi tiết | <span style="color:green">✔ ĐÃ XONG</span> | Ngày sinh, chiều cao, số tháng chơi, trình tự chấm, ảnh bill |
| **HM-03** | Vòng đời đơn (Nộp - Sửa - Rút qua Admin duyệt) | <span style="color:green">✔ ĐÃ XONG</span> | 100% hành động qua Admin duyệt, thông báo hoàn tiền khi rút |
| **HM-04** | Lệ phí & Quản lý ảnh Bill chuyển khoản | <span style="color:green">✔ ĐÃ XONG</span> | Đánh 2 nội dung giảm 50% nội dung thứ 2, sinh VietQR động |
| **HM-05** | Quy trình Chấm Rank linh hoạt | <span style="color:green">✔ ĐÃ XONG</span> | Đánh test ngoài sân, gán Rank thực tế (số lượng Lv linh hoạt theo cấu hình) |
| **HM-06** | Thuật toán & Cơ chế Ghép cặp cân bằng | <span style="color:green">✔ ĐÃ XONG</span> | Cặp mạnh nhất + yếu nhất vs các cặp giữa, hỗ trợ kéo thả |
| **HM-07** | Cấu trúc Trang VĐV Tinh Gọn (3 Khối) | <span style="color:green">✔ ĐÃ XONG</span> | 1. Giới thiệu giải - 2. Bảng VĐV - 3. Khối Đơn/Vé VĐV thích ứng |
| **HM-08** | Màn hình Admin Dashboard | <span style="color:green">✔ ĐÃ XONG</span> | Duyệt đơn/sửa/rút, soi bill, chấm rank, ghép cặp, xuất Excel |
| **HM-09** | Thiết kế Cơ sở Dữ liệu & Storage | <span style="color:green">✔ ĐÃ XONG</span> | Schema Supabase PostgreSQL, Storage bucket, RLS Policies |
| **HM-10** | Kế hoạch Lập trình & Kiểm thử | <span style="color:green">✔ ĐÃ XONG</span> | Hệ thống đã dựng hoàn tất, sẵn sàng triển khai chính thức |

---

## 📖 CHI TIẾT TỪNG HẠNG MỤC NGHIỆP VỤ

---

### [HM-01] QUY MÔ, ĐỐI TƯỢNG & THỂ THỨC THI ĐẤU
- **Quy mô:** Nội bộ Câu Lạc Bộ Cầu Lông.
- **Số lượng VĐV:** Khoảng 20 Vận Động Viên (Nam & Nữ). Hệ thống **không khóa cứng số lượng slot**, tạo điều kiện cho các thành viên đăng ký linh hoạt.
- **Hình thức đăng ký:** Đăng ký theo tư cách **CÁ NHÂN** (mỗi người tự đăng ký, hệ thống và BTC sẽ ghép cặp sau).
- **Các nội dung thi đấu:**
  1. **Đôi Nam:** Dành cho các VĐV Nam.
  2. **Đôi Nam Nữ:** Gồm 1 VĐV Nam + 1 VĐV Nữ.
- **Quy tắc lựa chọn nội dung:**
  - **VĐV Nam:** Được chọn 1 trong 3 phương án:
    - Chỉ tham gia *Đôi Nam*.
    - Chỉ tham gia *Đôi Nam Nữ*.
    - Tham gia **CẢ HAI NỘI DUNG** (*Đôi Nam* + *Đôi Nam Nữ*).
  - **VĐV Nữ:** Tham gia nội dung *Đôi Nam Nữ*.
- **Phạm vi hệ thống (Scope):** Dừng ở mức **Đăng ký $\rightarrow$ Duyệt bill $\rightarrow$ Chấm rank $\rightarrow$ Ghép cặp $\rightarrow$ Công bố danh sách cặp đấu $\rightarrow$ Xuất file Excel**. Đến ngày thi đấu, tổ trọng tài in danh sách ra điều hành trực tiếp trên sân (không làm tính năng nhập điểm online để giữ hệ thống gọn gàng, hiệu quả).

---

### [HM-02] HỒ SƠ VẬN ĐỘNG VIÊN & FORM ĐĂNG KÝ
VĐV đăng nhập bằng Google OAuth để xác thực danh tính duy nhất. Sau đó điền form gồm các trường sau:

| STT | Trường dữ liệu | Định dạng / Ràng buộc | Mục đích sử dụng thực tế |
|:---:|:---|:---|:---|
| 1 | **Tài khoản Google** | Email, Tên Google, Avatar (Readonly) | Định danh duy nhất, chống spam đơn ảo. |
| 2 | **Họ và Tên thi đấu** | Text, viết hoa chữ cái đầu | Tên hiển thị trên bảng đấu và danh sách thi đấu. |
| 3 | **Số điện thoại (Zalo)** | Chuỗi 10 chữ số | Để BTC liên hệ, gọi tên vào sân, thêm vào nhóm Zalo. |
| 4 | **Giới tính** | Nam / Nữ | Quyết định nội dung được chọn và phục vụ ghép Đôi Nam Nữ. |
| 5 | **Ngày tháng năm sinh** | Date picker (YYYY-MM-DD) | Dùng để tính **Tuổi** hiển thị trên bảng danh sách. |
| 6 | **Chiều cao** | Số nguyên dương (cm), VD: 172 | Đánh giá thể hình, hiển thị công khai trên bảng VĐV. |
| 7 | **Cân nặng** | Số nguyên dương (kg), VD: 68 | Phục vụ BTC đánh giá thể lực (không hiển thị công khai). |
| 8 | **Kinh nghiệm chơi** | Tách 2 ô: **Số Năm** + **Số Tháng** | Chi tiết tới mức tháng (VD: 2 năm 4 tháng = 28 tháng). |
| 9 | **Trình độ tự chấm** | `Lv1`, `Lv2`, `Lv3`, `Lv4` (hoặc theo cấu hình) | VĐV tự đánh giá để BTC tham khảo sơ bộ. |
| 10 | **Nội dung tham gia** | [Đôi Nam] hoặc [Đôi Nam Nữ] hoặc [Cả Hai] | Đăng ký nội dung thi đấu theo giới tính. |
| 11 | **Ảnh Bill chuyển khoản** | File ảnh (JPG/PNG, tối đa 5MB) | Bằng chứng đóng lệ phí tham gia giải. |
| 12 | **Ghi chú thêm** | Textarea (Không bắt buộc) | Nguyện vọng, tay thuận, tiền sử chấn thương... |

---

### [HM-03] VÒNG ĐỜI ĐƠN ĐĂNG KÝ (STATE MACHINE - 100% QUA ADMIN DUYỆT)
Tất cả các hành động nộp mới, sửa đổi hoặc xin rút của VĐV đều phải qua sự phê duyệt của Admin:

```
[VĐV Nộp Đơn + Ảnh Bill] 
         │
         ▼
[PENDING_REGISTRATION] (Chờ duyệt mới)
         │
         ├──────────────────────────────┐
         ▼ (Admin Duyệt)                ▼ (Admin Từ Chối)
    [APPROVED]                    [REJECTED] (Kèm lý do)
         │                              │
         │                              └─► VĐV sửa lại & nộp lại
         │
         ├─────────────────────────────────────────────┐
         ▼ (VĐV bấm Sửa Thông Tin)                     ▼ (VĐV bấm Xin Rút Đơn)
   [PENDING_UPDATE]                              [PENDING_WITHDRAW]
         │                                             │
   ┌─────┴────────────────┐                      ┌─────┴────────────────┐
   ▼ (Duyệt sửa)          ▼ (Từ chối sửa)        ▼ (Duyệt rút)          ▼ (Từ chối rút)
[APPROVED]             [APPROVED]             [WITHDRAWN]            [APPROVED]
(Áp dụng thông tin mới)(Giữ thông tin cũ)     (Loại khỏi giải)       (Vẫn phải thi đấu)
```

#### Quy tắc xử lý chi tiết:
1. **Nộp đơn mới (`pending_registration`):**
   - VĐV nộp xong thấy thông báo: *"Đơn đăng ký đang chờ Ban Tổ Chức đối soát lệ phí và duyệt hồ sơ"*.
   - Admin kiểm tra bill và thông tin $\rightarrow$ Bấm **Duyệt** hoặc **Từ chối** (kèm lý do).
2. **Sửa đơn (`pending_update`):**
   - VĐV được phép sửa thông tin (đổi nội dung thi đấu, kinh nghiệm, chiều cao...).
   - Lưu vào bảng tạm `pending_changes`. Admin thấy bản so sánh *Cũ* vs *Mới* $\rightarrow$ Duyệt thì mới cập nhật.
3. **Rút đơn (`pending_withdraw`):**
   - VĐV bấm "Xin rút lui khỏi giải" + điền lý do.
   - Khi Admin duyệt rút đơn $\rightarrow$ Chuyển sang `withdrawn` (loại khỏi danh sách ghép cặp) và trên màn hình VĐV sẽ hiển thị thông báo:
     > **"Đã rút đơn thành công. Vui lòng liên hệ Ban Tổ Chức để nhận lại phí đăng ký!"**

---

### [HM-04] CHÍNH SÁCH LỆ PHÍ & MÃ QR THANH TOÁN
- **Công thức tính lệ phí:**
  - Tham gia **1 nội dung** (Đôi Nam hoặc Đôi Nam Nữ): $100\%$ mức phí cơ bản (ví dụ: $200.000$ đ).
  - Tham gia **CẢ HAI NỘI DUNG:** Nội dung thứ hai được **giảm 50%**!
    $$\text{Tổng lệ phí} = \text{Phí cơ bản} + (\text{Phí cơ bản} \times 50\%) = 1.5 \times \text{Phí cơ bản}$$
    *(Ví dụ: 1 nội dung 200k $\rightarrow$ 2 nội dung là $200k + 100k = 300.000$ đ).*
- **Tự động sinh mã VietQR:**
  - VĐV chọn nội dung nào, hệ thống tự động tính toán tổng số tiền và sinh mã VietQR động với đúng số tiền và cú pháp chuyển khoản: `CLB [HọTên] [SĐT]`.
- **Upload và Soi Bill:**
  - VĐV tải ảnh bill chuyển khoản (hỗ trợ chụp trực tiếp từ điện thoại hoặc chọn ảnh từ thư viện).
  - Admin bấm vào ảnh thumbnail trên Dashboard để xem ảnh phóng to kích thước đầy đủ (lightbox), đối soát số tiền và mã giao dịch.

---

### [HM-05] QUY TRÌNH CHẤM RANK LINH HOẠT
- **Tính linh hoạt của Rank:** Số lượng Rank (Level) không bị fix cứng 4 mức, mà được cấu hình trong `CONFIG.RANKS` (ví dụ: có thể là 3 mức, 4 mức hoặc 5 mức tùy quyết định của BTC sau này). Mặc định cấu hình 4 mức: `Lv1`, `Lv2`, `Lv3`, `Lv4`.
- **Quy trình vận hành:**
  1. VĐV tự chấm rank khi đăng ký: gọi là **Trình tự chấm (`self_rank`)**.
  2. BTC tổ chức buổi đánh thử ngoài sân để chấm trình thực tế.
  3. Sau buổi test, Admin vào trang quản trị để gán **Trình real (`official_rank`)**. Nếu chưa chấm thì trường này để trống.

---

### [HM-06] THUẬT TOÁN & CƠ CHẾ GHÉP CẶP CÂN BẰNG (TRỢ LÝ THÔNG MINH CHO BTC)
- **Quyền quyết định tối cao thuộc về BTC:** BTC là người trực tiếp ghép cặp (không bị máy ép cứng kết quả). Hệ thống đóng vai trò **Trợ lý Thông Minh** tính toán điểm và gợi ý đối tác lý tưởng để BTC ghép nhanh và chuẩn xác.
- **Quy ước điểm Rank:**
  - $Lv1 = 4$ điểm (Mạnh nhất / Hạt giống)
  - $Lv2 = 3$ điểm (Khá)
  - $Lv3 = 2$ điểm (Trung bình)
  - $Lv4 = 1$ điểm (Mới chơi / Cơ bản)
- **Chuẩn Vàng Cân Bằng (Target = 5★):**
  $$\text{Tổng điểm cặp đấu} = \text{Điểm VĐV 1} + \text{Điểm VĐV 2}$$
  - $\text{Tổng} = 5★$ ($Lv1 + Lv4$ hoặc $Lv2 + Lv3$): 🟢 **Rất Cân Bằng (Chuẩn giải)**.
  - $\text{Tổng} = 4★$ hoặc $6★$: 🟡 **Chấp nhận được (Lệch nhẹ 1 điểm)**.
  - $\text{Tổng} \le 3★$ hoặc $\ge 7★$: 🔴 **Lệch trình độ (Cảnh báo quá mạnh hoặc quá yếu)**.
- **Cơ chế vận hành trên Dashboard:**
  1. **Kho VĐV Chờ Ghép (Unpaired Pool):** Hiển thị danh sách VĐV đã duyệt & đã chấm rank nhưng chưa có cặp, có bộ lọc theo Rank.
  2. **Gợi ý Đối tác Lý tưởng (Smart Suggestion):** Khi BTC chọn VĐV A, hệ thống tự động lọc và xếp các đối tác có khả năng tạo thành cặp 5★ lên hàng đầu kèm giải thích lý do để BTC bấm 1 chạm là ghép xong.
  3. **Đôi Nam Nữ:** Tự động lọc chéo giới tính (chọn Nam $\rightarrow$ chỉ gợi ý Nữ; chọn Nữ $\rightarrow$ chỉ gợi ý Nam) và sắp xếp theo độ cân bằng điểm.
  4. **Gợi Ý Xếp Mẫu Nháp (Draft):** Nút xếp nhanh một phương án mẫu cân bằng nhất cho toàn giải để BTC tham khảo, sau đó BTC có thể tự do gỡ hoặc đổi người.
  5. **Tách Cặp & Hoán Đổi (Swap):** Bấm "Gỡ" để đưa 2 VĐV về lại kho chờ; hoặc bấm "Đổi người" để tráo đổi vị trí giữa 2 cặp đấu kèm xem trước điểm số.
  6. **Công Bố Ra Web:** Cập nhật trường `partner_name` vào database và hiển thị tên bạn đánh cặp ra ngoài trang VĐV.

---

### [HM-07] CẤU TRÚC TRANG VẬN ĐỘNG VIÊN TINH GỌN (CHỈ 3 KHỐI TRỌNG TÂM)
Trang `index.html` được thiết kế tối giản, tập trung 100% vào nhu cầu của VĐV, **loại bỏ các phần giải thích lý thuyết rườm rà**:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. GIỚI THIỆU GIẢI ĐẤU (Ngày, Giờ, Địa Điểm, Thể Thức, Phí) │
├─────────────────────────────────────────────────────────────┤
│ 2. DANH SÁCH VẬN ĐỘNG VIÊN ĐÃ ĐĂNG KÝ (Table sort nộp trước)│
├─────────────────────────────────────────────────────────────┤
│ 3. ĐƠN ĐĂNG KÝ / VÉ THI ĐẤU CỦA VĐV (Thích ứng thông minh) │
│    - Nếu chưa login: Nút đăng nhập Google                   │
│    - Nếu đã login & chưa nộp: Form đăng ký + Upload bill    │
│    - Nếu đã có đơn: Thẻ VĐV + Trạng thái + Bạn đánh cặp     │
└─────────────────────────────────────────────────────────────┘
```

1. **Khối 1: Giới thiệu giải đấu:**
   - Tên giải, ngày thi đấu, giờ bắt đầu, địa điểm.
   - Thể thức thi đấu Đôi Nam & Đôi Nam Nữ.
   - Bảng lệ phí (200k/nội dung, giảm 50% nội dung thứ hai).
2. **Khối 2: Danh sách Vận Động Viên Đã Đăng Ký:**
   - Dạng bảng (Table) sạch sẽ, sort theo **ai nộp trước thì lên trên**.
   - Cột: STT, VĐV, Tuổi, Chiều cao, Kinh nghiệm, Trình tự chấm, Trình real (BTC), Nội dung, Bạn đánh cặp. (Ẩn cân nặng).
3. **Khối 3: Đơn Đăng Ký Thi Đấu Của Bạn:**
   - **Khi chưa đăng ký:** Hiển thị Form điền thông tin cá nhân + chọn nội dung + mã VietQR + upload ảnh bill.
   - **Khi đã nộp đơn:** Hiển thị Thẻ VĐV chính thức (Trạng thái đơn, Trình real, Bạn đánh cặp khi BTC đã ghép, nút Sửa thông tin, nút Xin rút đơn kèm thông báo hoàn tiền).

---

### [HM-08] ĐẶC TẢ MÀN HÌNH ADMIN DASHBOARD (`admin.html`)
Giao diện quản trị phong cách SaaS hiện đại:
1. **Phân quyền truy cập:** Danh sách email Google BTC trong `CONFIG.ADMIN_EMAILS`.
2. **Tab 1: Trung Tâm Duyệt Đơn (Approval Center):**
   - Lọc theo loại: *Đơn mới*, *Yêu cầu sửa*, *Yêu cầu rút*, *Đã duyệt*.
   - Soi ảnh bill chuyển khoản (lightbox phóng to).
   - Duyệt đơn / Từ chối (kèm lý do) / Duyệt rút đơn (hiển thị thông báo nhận lại phí).
3. **Tab 2: Chấm Trình Real (Rank Rating):**
   - Danh sách VĐV đã approved, hiển thị đầy đủ Chiều cao, Cân nặng, Kinh nghiệm.
   - Dropdown chọn Trình real nhanh (`Lv1`, `Lv2`, `Lv3`, `Lv4`...). Lưu ngay tức thì.
4. **Tab 3: Ghép Cặp Thông Minh (Smart Pairing):**
   - Bảng Đôi Nam và Đôi Nam Nữ.
   - Nút *"Tự Động Ghép Cặp Cân Bằng"*.
   - Nút *"Công Bố Danh Sách Cặp Đấu"* (khi bấm thì VĐV mới thấy bạn đánh cặp).
5. **Tab 4: Xuất Báo Cáo:**
   - Xuất file CSV/Excel chuẩn tiếng Việt UTF-8 BOM cho tổ trọng tài điều hành.

---

### [HM-09] THIẾT KẾ CƠ SỞ DỮ LIỆU & STORAGE (SUPABASE)
- **Bảng `athletes`:** id, user_id, email, full_name, phone, gender, dob, height, weight, exp_years, exp_months, self_rank, official_rank, event_category, fee_amount, bill_image_url, partner_name, status, reject_reason, withdraw_reason, notes, created_at.
- **Bảng `tournament_pairs`:** id, event_type, player1_id, player2_id, total_score, is_published, created_at.
- **Bảng `admin_users`:** email, role, created_at.
- **Storage Bucket:** `payment-bills`.
- **Row Level Security (RLS):** VĐV chỉ thấy/sửa đơn của chính mình; Admin toàn quyền xem/sửa/xóa.
