import React, { useState } from 'react';
import { Table, Eye, EyeOff, Layers, Info } from './Icons';

export function BinaryLiftingTable({ n, up, depth, LOGN, activeNodes = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null);

  if (!up || up.length === 0) return null;

  // Limit display if N is large (e.g. show first 25 nodes with option)
  const maxDisplayNodes = Math.min(n, 25);
  const activeSet = new Set(activeNodes);

  return (
    <div className="binary-table-card">
      <div className="binary-table-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="header-left">
          <Layers size={18} className="header-icon" />
          <div>
            <h4 className="card-title">Bảng Quy Hoạch Động Nhị Phân Nâng (Binary Lifting Table)</h4>
            <p className="card-subtitle">
              Giá trị <code>up[u][k]</code>: Tổ tiên thứ 2^k của căn hộ u
            </p>
          </div>
        </div>
        <button className="toggle-btn">
          {isOpen ? <EyeOff size={16} /> : <Eye size={16} />}
          <span>{isOpen ? 'Thu gọn' : 'Xem chi tiết'}</span>
        </button>
      </div>

      {isOpen && (
        <div className="table-content-area">
          <div className="table-note">
            <Info size={14} />
            <span>
              Công thức truy hồi: <code>up[u][k] = up[up[u][k-1]][k-1]</code>. Độ phức tạp tiền xử lý:{' '}
              <code>O(N · log N)</code>.
            </span>
          </div>

          <div className="table-responsive-wrapper">
            <table className="lifting-table">
              <thead>
                <tr>
                  <th>Căn hộ (u)</th>
                  <th>Độ sâu</th>
                  {Array.from({ length: LOGN }, (_, k) => (
                    <th key={k}>
                      k={k}
                      <span className="power-sub">(2^{k}={1 << k})</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: maxDisplayNodes }, (_, i) => i + 1).map((u) => {
                  const isActive = activeSet.has(u);
                  return (
                    <tr key={u} className={isActive ? 'row-active' : ''}>
                      <td className="node-id-cell">
                        <span className="node-pill">{u}</span>
                      </td>
                      <td className="depth-cell">{depth[u]}</td>
                      {Array.from({ length: LOGN }, (_, k) => {
                        const val = up[u]?.[k] ?? 0;
                        const isHovered =
                          hoveredCell && hoveredCell.u === u && hoveredCell.k === k;
                        return (
                          <td
                            key={k}
                            className={`cell-val ${val === 0 ? 'zero-val' : ''} ${
                              isHovered ? 'cell-hovered' : ''
                            }`}
                            onMouseEnter={() => setHoveredCell({ u, k, val })}
                            onMouseLeave={() => setHoveredCell(null)}
                            title={`Tổ tiên cách ${1 << k} bước của ${u} là ${val}`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {n > maxDisplayNodes && (
            <div className="table-truncated-alert">
              Đang hiển thị 25/{n} căn hộ đầu tiên để tối ưu giao diện.
            </div>
          )}

          {hoveredCell && (
            <div className="cell-explanation">
              <strong>Giải thích ô up[{hoveredCell.u}][{hoveredCell.k}]:</strong> Căn hộ{' '}
              <span className="hl">{hoveredCell.val}</span> là tổ tiên nằm cách căn hộ{' '}
              <span className="hl">{hoveredCell.u}</span> đúng{' '}
              <span className="hl">2^{hoveredCell.k} = {1 << hoveredCell.k}</span> cạnh đi lên phía
              gốc cây.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
