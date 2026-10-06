import React, { useState } from 'react';
import {
  ListOrdered,
  Copy,
  Download,
  Check,
  PlayCircle,
  Fuel,
  Search,
  ExternalLink,
} from './Icons';

export function OutputPanel({
  queries = [],
  results = [],
  onSelectQuery,
  activeQueryIndex = 0,
  fuelCapacity = 10,
}) {
  const [tab, setTab] = useState('table'); // 'table' | 'raw'
  const [copied, setCopied] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Raw text output: 1 distance per line
  const rawOutputText = results.map((r) => r.distance).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(rawOutputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([rawOutputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nguoi_giao_com_output.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter queries if needed
  const filteredQueries = results.filter((item, idx) => {
    if (!searchFilter) return true;
    const [u, v] = queries[idx] || [0, 0];
    return (
      u.toString().includes(searchFilter) ||
      v.toString().includes(searchFilter) ||
      (idx + 1).toString().includes(searchFilter)
    );
  });

  return (
    <div className="output-panel-card">
      <div className="panel-header">
        <div className="title-with-badge">
          <ListOrdered size={18} className="panel-icon" />
          <h3 className="panel-title">Kết Quả Đầu Ra (Output)</h3>
          <span className="count-badge">{results.length} truy vấn</span>
        </div>

        <div className="panel-actions">
          {/* Tab switcher */}
          <div className="tab-pill-group">
            <button
              className={`pill-btn ${tab === 'table' ? 'active' : ''}`}
              onClick={() => setTab('table')}
            >
              Bảng Chi Tiết
            </button>
            <button
              className={`pill-btn ${tab === 'raw' ? 'active' : ''}`}
              onClick={() => setTab('raw')}
            >
              Dữ Liệu Thô (Raw)
            </button>
          </div>

          <button className="btn-secondary" onClick={handleCopy} title="Sao chép kết quả">
            {copied ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
            <span>{copied ? 'Đã chép' : 'Chép'}</span>
          </button>

          <button className="btn-secondary" onClick={handleDownload} title="Tải output.txt về máy">
            <Download size={15} />
            <span>Lưu file</span>
          </button>
        </div>
      </div>

      {tab === 'table' ? (
        <div className="output-table-container">
          {results.length > 8 && (
            <div className="filter-bar">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Tìm căn hộ hoặc số thứ tự truy vấn..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="filter-input"
              />
            </div>
          )}

          <div className="table-responsive-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Căn hộ A ➔ B</th>
                  <th>Khoảng cách</th>
                  <th>Tổ tiên chung (LCA)</th>
                  <th>Bình xăng (K={fuelCapacity})</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueries.map((res) => {
                  const [u, v] = queries[res.queryIndex];
                  const isExceeded = res.distance > fuelCapacity;
                  const isActive = activeQueryIndex === res.queryIndex;

                  return (
                    <tr
                      key={res.queryIndex}
                      className={`result-row ${isActive ? 'row-selected' : ''}`}
                      onClick={() => onSelectQuery(res.queryIndex)}
                    >
                      <td className="idx-cell">{res.queryIndex + 1}</td>
                      <td className="nodes-cell">
                        <span className="node-badge start">{u}</span>
                        <span className="arrow-sep">➔</span>
                        <span className="node-badge end">{v}</span>
                      </td>
                      <td className="dist-cell">
                        <strong>{res.distance}</strong> con đường
                      </td>
                      <td className="lca-cell">
                        <span className="lca-badge">{res.lca}</span>
                      </td>
                      <td className="fuel-cell">
                        {isExceeded ? (
                          <span className="fuel-tag warning" title="Vượt quá dung tích bình xăng!">
                            <Fuel size={13} /> Thiếu xăng ({res.distance}/{fuelCapacity})
                          </span>
                        ) : (
                          <span className="fuel-tag ok" title="Đủ xăng giao cơm an toàn">
                            <Fuel size={13} /> Đủ xăng
                          </span>
                        )}
                      </td>
                      <td className="action-cell">
                        <button
                          className={`btn-play-query ${isActive ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectQuery(res.queryIndex);
                          }}
                          title="Xem mô phỏng từng bước trên cây"
                        >
                          <PlayCircle size={15} />
                          <span>Mô phỏng</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="raw-output-wrapper">
          <div className="raw-output-meta">
            Định dạng xuất chuẩn gồm {results.length} dòng số nguyên theo đúng yêu cầu đề bài:
          </div>
          <pre className="raw-output-pre">{rawOutputText}</pre>
        </div>
      )}
    </div>
  );
}
