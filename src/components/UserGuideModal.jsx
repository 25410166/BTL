// Modal hướng dẫn sử dụng website trực quan và dễ hiểu
import React from 'react';
import {
  HelpCircleIcon,
  PlayIcon,
  ZapIcon,
  StepForwardIcon,
  CheckCircleIcon,
} from './Icons.jsx';

export function UserGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="icon-badge bg-primary">
              <HelpCircleIcon className="w-5 h-5 text-accent" size={20} />
            </div>
            <div>
              <h2 className="modal-title">Hướng Dẫn Sử Dụng Website</h2>
              <p className="modal-subtitle">4 bước đơn giản để mô phỏng và giải bài toán Sudoku 9×9</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="modal-body space-y-4">
          {/* Bước 1 */}
          <div className="spec-card">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="badge-status badge-ready font-mono font-bold text-xs px-2 py-0.5">BƯỚC 1</span>
              <h3 className="section-title text-primary m-0">Chọn hoặc nhập đề bài Sudoku</h3>
            </div>
            <p className="text-secondary text-xs leading-relaxed m-0">
              • Chọn nhanh trong danh mục <strong>12 Testcase</strong> (1 đến 5 ô X chuẩn đề thi, đề bẫy, vô nghiệm, hoặc câu đố 58 ô AI Escargot).<br />
              • Hoặc dùng <strong>Bảng Nhập Liệu</strong> phía dưới để dán ma trận text chứa chữ <code>'X'</code>, tải file <code>.txt</code> hoặc bấm <strong>Sinh Ngẫu Nhiên</strong>.
            </p>
          </div>

          {/* Bước 2 */}
          <div className="spec-card">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="badge-status badge-ready font-mono font-bold text-xs px-2 py-0.5">BƯỚC 2</span>
              <h3 className="section-title text-accent m-0">Chọn Thuật toán (Cách Giải)</h3>
            </div>
            <p className="text-secondary text-xs leading-relaxed m-0">
              Tại mục <strong>Cách Giải:</strong> trên thanh điều khiển, bạn có thể lựa chọn 1 trong 5 phương pháp:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-[11px] text-secondary">
              <div className="p-2 rounded bg-surface-2 border border-subtle">
                <strong className="text-primary">1. Quay lui tuần tự:</strong> Chuẩn yêu cầu đề bài, duyệt từ trái sang phải.
              </div>
              <div className="p-2 rounded bg-surface-2 border border-subtle">
                <strong className="text-warning">2. Quay lui + MRV:</strong> Ưu tiên ô ít ứng viên nhất (giảm số lần quay lui).
              </div>
              <div className="p-2 rounded bg-surface-2 border border-subtle">
                <strong className="text-purple">3. Dancing Links (DLX):</strong> Thuật toán X của Knuth trên ma trận Exact Cover.
              </div>
              <div className="p-2 rounded bg-surface-2 border border-subtle">
                <strong className="text-emerald">4. Bitwise Backtracking:</strong> Xử lý cực nhanh trên thanh ghi CPU.
              </div>
            </div>
          </div>

          {/* Bước 3 */}
          <div className="spec-card">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="badge-status badge-ready font-mono font-bold text-xs px-2 py-0.5">BƯỚC 3</span>
              <h3 className="section-title text-warning m-0">Điều khiển mô phỏng trực quan</h3>
            </div>
            <div className="space-y-1.5 text-xs text-secondary">
              <div className="flex items-start gap-2">
                <PlayIcon size={13} className="text-accent mt-0.5" />
                <span><strong>Bắt Đầu / Tạm Dừng:</strong> Chạy hoạt ảnh đệ quy tự động theo tốc độ cài đặt.</span>
              </div>
              <div className="flex items-start gap-2">
                <StepForwardIcon size={13} className="text-primary mt-0.5" />
                <span><strong>Tiến / Lùi 1 bước:</strong> Soi chi tiết từng ô đang xét, số đang thử và các ô xung đột.</span>
              </div>
              <div className="flex items-start gap-2">
                <ZapIcon size={13} className="text-warning mt-0.5" />
                <span><strong>Giải Tức Thì:</strong> Nhận ngay kết quả giải hoàn chỉnh trong &lt; 1 mili-giây.</span>
              </div>
              <div className="p-2 rounded bg-surface-2 border border-subtle text-[11px] text-secondary mt-1">
                💡 <em>Mẹo: Có thể gõ trực tiếp số mili-giây vào ô nhập tốc độ (ví dụ <code>5</code> hoặc <code>50</code>) để chạy mượt mà.</em>
              </div>
            </div>
          </div>

          {/* Bước 4 */}
          <div className="spec-card">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="badge-status badge-ready font-mono font-bold text-xs px-2 py-0.5">BƯỚC 4</span>
              <h3 className="section-title text-emerald m-0">Xem và xuất kết quả</h3>
            </div>
            <p className="text-secondary text-xs leading-relaxed m-0">
              • Các ô trống ban đầu được <strong>tô màu xanh nổi bật</strong> khi điền xong số hợp lệ.<br />
              • Cột bên phải thống kê chi tiết: <strong>Thời gian (ms)</strong>, <strong>Số phép gán</strong>, <strong>Số lần quay lui</strong>.<br />
              • Bấm <strong>Sao Chép Ma Trận</strong> hoặc <strong>Tải File TXT</strong> để lấy kết quả nộp bài.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-primary w-full" onClick={onClose}>
            <CheckCircleIcon size={14} />
            <span>Đã Hiểu, Bắt Đầu Sử Dụng</span>
          </button>
        </div>
      </div>
    </div>
  );
}
