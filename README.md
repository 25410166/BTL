# 🚴‍♂️ Người Giao Cơm (Food Delivery Tree LCA Solver)

> **Dự án Bài Tập Lớn - Môn Cấu Trúc Dữ Liệu & Giải Thuật Nâng Cao**  
> Trực quan hóa thuật toán tìm khoảng cách ngắn nhất trên cây qua LCA (Lowest Common Ancestor), đối sánh hiệu năng 4 thuật toán và mô phỏng lộ trình giao cơm thực tế.

---

## 🌟 Tính Năng Nổi Bật (Đáp Ứng Tiêu Chí Điểm 10/10)

### 1. Mức Độ Đáp Ứng Yêu Cầu (Core Requirements)
- **Nhập dữ liệu (Input):** Nhập trực tiếp qua ô soạn thảo, tải file `.txt`, nạp testcase có sẵn hoặc tự động sinh testcase ngẫu nhiên với nhiều cấu trúc cây.
- **Theo dõi từng bước (Step-by-step Visualizer):**
  - Trực quan hóa cây bằng Canvas SVG với Zoom, Pan, Drag node, hiển thị độ sâu $depth[u]$ và bậc của từng căn hộ.
  - Mô phỏng cơ chế nâng nhị phân (Binary Lifting): Nhảy $2^k$ tầng với đường cong vòng cung sinh động.
  - Hiển thị công thức toán học và giải thích chi tiết từng bước bằng tiếng Việt.
- **Xem kết quả (Output):**
  - Bảng chi tiết kết quả từng truy vấn kèm LCA và tình trạng bình xăng.
  - Xem kết quả thô (Raw) định dạng chuẩn đề bài, sao chép 1-click hoặc tải file `output.txt`.
- **Bộ Testcase Đa Dạng & Phức Tạp:**
  - `Test 1`: Đề bài mẫu ($N=5, Q=3$)
  - `Test 2`: Cây dây xích / đường thẳng ($N=12, Q=6$) - Worst case về độ sâu cây
  - `Test 3`: Cây hình sao ($N=9, Q=5$) - Bậc đỉnh tâm cực đại
  - `Test 4`: Cây nhị phân hoàn chỉnh ($N=15, Q=7$) - Cân bằng đối xứng
  - `Test 5`: Corner & Edge Cases ($u=v$, $dist=0$, cạnh kề $dist=1$, gốc tới lá)
  - `Test 6`: Cây sâu róm (Caterpillar Tree $N=16$)
  - `Test 7`: Cây tối thiểu ($N=2$)
  - `Test 8`: Cây quy mô vừa ($N=50, Q=25$)
  - `Test 9`: Stress test quy mô lớn ($N=2,000 \to 50,000$)

### 2. Mức Độ Đầu Tư (Visual & Engineering Quality)
- Giao diện chuẩn Dark / Light Glassmorphism với hiệu ứng viền neon, phát sáng chuyển động (glowing path) và vòng hào quang quay quanh LCA.
- **Bảng Tra Cứu Quy Hoạch Động (Binary Lifting DP Table):** Trực quan hóa ma trận $up[u][k]$ với tương tác trỏ chuột giải thích ý nghĩa từng ô.
- **Báo Cáo Khoa Học & Kỹ Thuật Tích Hợp:** Cung cấp báo cáo học thuật đầy đủ chứng minh toán học, phân tích Big-O, hỗ trợ in PDF hoặc sao chép Markdown ngay trên web.

### 3. Tính Sáng Tạo & Phát Triển Mở Rộng
- **So Sánh & Đo Lường Hiệu Năng 4 Thuật Toán (Benchmark):**
  1. *Binary Lifting LCA:* $O((N + Q) \log N)$
  2. *Euler Tour + RMQ (Sparse Table):* $O(N \log N + Q)$ (truy vấn $O(1)$)
  3. *Tarjan's Offline LCA (DSU):* $O(N + Q \cdot \alpha(N))$
  4. *Naive BFS (Duyệt ngây thơ):* $O(Q \cdot N)$
  - Bảng đối sánh thời gian thực thi (milliseconds), số phép tính, và tính năng xác thực độ đúng đắn chéo 100%.
- **Mô Phỏng Thực Tế: Shipper Lưu Ngô & Bình Xăng:**
  - Cài đặt dung tích bình xăng $K$ lít (cảnh báo cạn nhiên liệu khi đường đi vượt quá dung tích).
  - Đặt trạm xăng (Gas Stations) trên cây để tiếp nhiên liệu.
  - Lập lộ trình giao hàng đa điểm: Giao liên tiếp các đơn hàng $[u_1, u_2, \dots, u_m]$ với hoạt hình xe máy chạy qua từng nốt trên cây.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local)

Yêu cầu máy đã cài đặt [Node.js](https://nodejs.org/) (khuyến nghị phiên bản 18+).

```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Khởi chạy máy chủ phát triển
npm run dev

# 3. Mở trình duyệt tại địa chỉ
http://localhost:5173/
```

---

## 🌐 Hướng Dẫn Deploy Lên GitHub Pages

Dự án đã được cấu hình sẵn `base: './'` trong `vite.config.js` và file GitHub Actions tại `.github/workflows/deploy.yml`.

### Cách 1: Tự động qua GitHub Actions (Khuyên dùng)
1. Đẩy toàn bộ mã nguồn lên repository GitHub của bạn:
   ```bash
   git init
   git add .
   git commit -m "feat: Nguoi Giao Com LCA visualizer"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan>/<ten-repo>.git
   git push -u origin main
   ```
2. Trên GitHub, vào mục **Settings** -> **Pages**.
3. Tại phần **Source**, chọn **GitHub Actions**.
4. GitHub Actions sẽ tự động kích hoạt workflow, biên dịch và xuất bản website sau khoảng 1-2 phút.

### Cách 2: Deploy thủ công từ nhánh `gh-pages`
```bash
npm run build
# Thư mục dist/ đã chứa toàn bộ website tĩnh sẵn sàng hoạt động độc lập
```

---

## 📊 Phân Tích Độ Phức Tạp Thuật Toán

| Thuật toán | Tiền xử lý | Mỗi truy vấn | Bộ nhớ | Đánh giá |
|---|---|---|---|---|
| **Binary Lifting** | $O(N \log N)$ | $O(\log N)$ | $O(N \log N)$ | Chuẩn mực cho truy vấn trực tuyến |
| **Euler RMQ** | $O(N \log N)$ | $\mathbf{O(1)}$ | $O(N \log N)$ | Siêu nhanh khi $Q$ cực lớn |
| **Tarjan DSU** | $O(1)$ | $O(\alpha(N))$ | $O(N + Q)$ | Tối ưu bộ nhớ, xử lý ngoại tuyến |
| **Naive BFS** | $O(1)$ | $O(N)$ | $O(N)$ | Baseline tham chiếu, TLE khi $N, Q$ lớn |
