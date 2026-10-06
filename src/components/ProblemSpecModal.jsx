// Component hiển thị chính xác Đề bài, Yêu cầu, Input/Output và Ví dụ từ giáo viên
import React from 'react';
import { BookOpenIcon, CheckCircleIcon, SparklesIcon } from './Icons';

export function ProblemSpecModal({ isOpen, onClose, onLoadSample }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="icon-badge bg-primary">
              <BookOpenIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="modal-title">Đề Bài & Yêu Cầu Kỹ Thuật</h2>
              <p className="modal-subtitle">Bài toán giải Sudoku 9×9 bằng kỹ thuật Quay lui (Backtracking)</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="modal-body space-y-6">
          {/* Mục 1: Mô tả bài toán */}
          <section className="spec-card">
            <h3 className="section-title text-primary">1. MÔ TẢ BÀI TOÁN</h3>
            <p className="text-secondary leading-relaxed">
              Sudoku là một trò chơi phổ biến rộng rãi dùng để giết thời gian và rèn luyện trí tuệ.
              Trong bài này, ta sẽ xét đến trường hợp <strong>Sudoku 9 × 9</strong>.
            </p>
            <div className="p-4 rounded-lg bg-surface-2 border border-subtle my-3">
              <p className="text-secondary text-sm">
                Một Sudoku kích thước 9 × 9 được chia làm <strong>9 hình vuông cơ sở (khối 3 × 3)</strong>, thu được bằng cách cắt mỗi chiều thành ba phần bằng nhau.
                Một Sudoku được xem là hợp lệ nếu mỗi khi ta xét một hàng, một cột, hoặc một hình vuông cơ sở, ta sẽ thu được <strong>một hoán vị của 9 số tự nhiên đầu tiên (1..9)</strong>.
                Cho một Sudoku trong đó một vài ô còn trống chưa được điền. Hãy điền các số vào các ô trống đó sao cho tạo được một Sudoku hợp lệ.
              </p>
            </div>
          </section>

          {/* Mục 2: Input & Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="spec-card border-blue">
              <h3 className="section-title text-blue">2. QUY ĐỊNH INPUT</h3>
              <ul className="spec-list text-sm text-secondary space-y-2">
                <li>• Gồm một ma trận có kích thước <strong>9 × 9</strong>.</li>
                <li>• Các ô được điền sẵn sẽ mang số tương ứng (<strong>1 đến 9</strong>).</li>
                <li>• Các ô chưa điền sẽ mang <strong>ký tự 'X'</strong> (hoặc số 0).</li>
                <li>
                  • <strong className="text-warning">Đặc tả quan trọng:</strong> Input đảm bảo <strong>không quá 5 ô trống</strong> chưa được điền.
                </li>
              </ul>
            </div>

            <div className="spec-card border-emerald">
              <h3 className="section-title text-emerald">3. QUY ĐỊNH OUTPUT</h3>
              <ul className="spec-list text-sm text-secondary space-y-2">
                <li>• Gồm một ma trận có kích thước <strong>9 × 9</strong>.</li>
                <li>• Thể hiện một Sudoku hợp lệ với dữ liệu mà đề bài cho.</li>
                <li>• Nếu có nhiều trường hợp thỏa mãn, xuất ra <strong>một trường hợp bất kỳ</strong>.</li>
                <li>• Hiển thị rõ các ô ban đầu mang ký tự 'X' đã được giải thành công.</li>
              </ul>
            </div>
          </div>

          {/* Mục 3: Ví dụ mẫu từ đề bài */}
          <section className="spec-card">
            <div className="flex justify-between items-center mb-3">
              <h3 className="section-title text-accent">4. VÍ DỤ MINH HỌA (SAMPLE)</h3>
              <button
                className="btn btn-sm btn-primary-gradient"
                onClick={() => {
                  onLoadSample();
                  onClose();
                }}
              >
                <SparklesIcon className="w-4 h-4" />
                Nạp Ví Dụ Mẫu Vào Bộ Giải
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-secondary mb-1 flex items-center justify-between">
                  <span>SAMPLE INPUT (Có 1 ô X tại hàng 4, cột 8)</span>
                </div>
                <pre className="code-box font-mono text-xs">
{`5  8  1  6  7  2  4  3  9
7  9  2  8  4  3  6  5  1
3  6  4  5  9  1  7  8  2
4  3  8  9  5  7  2 [X] 6
2  5  6  1  8  4  9  7  3
1  7  9  3  2  6  8  4  5
8  4  5  2  1  9  3  6  7
9  1  3  7  6  8  5  2  4
6  2  7  4  3  5  1  9  8`}
                </pre>
              </div>

              <div>
                <div className="text-xs font-semibold text-emerald mb-1">
                  SAMPLE OUTPUT (Ô X được điền số 1 hợp lệ)
                </div>
                <pre className="code-box font-mono text-xs border-emerald-subtle">
{`5  8  1  6  7  2  4  3  9
7  9  2  8  4  3  6  5  1
3  6  4  5  9  1  7  8  2
4  3  8  9  5  7  2 [1] 6
2  5  6  1  8  4  9  7  3
1  7  9  3  2  6  8  4  5
8  4  5  2  1  9  3  6  7
9  1  3  7  6  8  5  2  4
6  2  7  4  3  5  1  9  8`}
                </pre>
              </div>
            </div>
          </section>

          {/* Mục 4: Yêu cầu kỹ thuật bắt buộc */}
          <div className="notice-box bg-accent-subtle border-accent">
            <h4 className="font-semibold text-accent flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5" />
              Yêu Cầu Cốt Lõi: Kỹ Thuật Quay Lui (Backtracking)
            </h4>
            <p className="text-sm text-secondary mt-1">
              Bài tập <strong>bắt buộc 100% sử dụng kỹ thuật Backtracking</strong> (Quay lui đệ quy và hoàn tác trạng thái).
              Ứng dụng xây dựng đầy đủ Visualizer quan sát từng bước thử số (Try 1..9), phát hiện xung đột hàng/cột/khối (Prune),
              và rút số khi bế tắc (Backtrack) kèm Call Stack đệ quy chi tiết.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onLoadSample();
              onClose();
            }}
          >
            Thử Nghiệm Với Sample Đề Bài
          </button>
        </div>
      </div>
    </div>
  );
}
