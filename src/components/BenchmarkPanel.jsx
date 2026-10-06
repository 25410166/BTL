import React, { useState } from 'react';
import {
  Gauge,
  Play,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Clock,
  Cpu,
  BarChart3,
  Layers,
  Sparkles,
  Info,
} from './Icons';
import { runBenchmark } from '../algorithms/benchmark';
import { generateTreeTopology } from '../algorithms/treeUtils';

export function BenchmarkPanel({ n, adj, queries, root = 1 }) {
  const [benchResults, setBenchResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [customN, setCustomN] = useState(1000);
  const [customQ, setCustomQ] = useState(1000);

  const handleRunCurrent = async () => {
    setIsRunning(true);
    // Allow UI to update
    setTimeout(async () => {
      const res = await runBenchmark(n, adj, queries, root);
      setBenchResults(res);
      setIsRunning(false);
    }, 50);
  };

  const handleRunStress = async (testN, testQ) => {
    setIsRunning(true);
    setTimeout(async () => {
      const generated = generateTreeTopology('random', testN, testQ);
      // parse generated
      const adjGen = Array.from({ length: testN + 1 }, () => []);
      for (const [u, v] of generated.edges) {
        adjGen[u].push(v);
        adjGen[v].push(u);
      }
      const res = await runBenchmark(testN, adjGen, generated.queries, 1);
      setBenchResults(res);
      setIsRunning(false);
    }, 50);
  };

  // Find max time for bar chart scaling
  const maxTotalTime = benchResults
    ? Math.max(
        ...Object.values(benchResults.algorithms).map((a) => a.totalTimeMs || 0),
        0.1
      )
    : 1;

  return (
    <div className="benchmark-panel-container">
      {/* Benchmark Header & Actions */}
      <div className="benchmark-header-card">
        <div className="bench-title-info">
          <div className="bench-icon-circle">
            <Gauge size={24} />
          </div>
          <div>
            <h3>So Sánh & Đo Lường Hiệu Năng 4 Thuật Toán (Benchmark)</h3>
            <p>
              Đối sánh trực tiếp 4 giải thuật: Binary Lifting, Euler Tour + RMQ (Sparse Table), Tarjan
              Offline (DSU) và Naive BFS trên cùng tập dữ liệu.
            </p>
          </div>
        </div>

        <div className="bench-buttons">
          <button
            className="btn-primary-glow"
            onClick={handleRunCurrent}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <span className="spinner-dot" /> Đang đo lường...
              </>
            ) : (
              <>
                <Play size={16} /> Chạy trên dữ liệu hiện tại ({n} căn hộ, {queries.length} truy vấn)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stress Test Launcher Bar */}
      <div className="stress-test-bar">
        <div className="stress-label">
          <Sparkles size={16} /> Thử nghiệm quy mô lớn (Stress Test):
        </div>
        <div className="stress-presets">
          <button
            className="stress-btn"
            disabled={isRunning}
            onClick={() => handleRunStress(500, 500)}
          >
            N=500, Q=500
          </button>
          <button
            className="stress-btn"
            disabled={isRunning}
            onClick={() => handleRunStress(2000, 2000)}
          >
            N=2,000, Q=2,000
          </button>
          <button
            className="stress-btn highlight"
            disabled={isRunning}
            onClick={() => handleRunStress(10000, 10000)}
          >
            N=10,000, Q=10,000
          </button>
          <button
            className="stress-btn extreme"
            disabled={isRunning}
            onClick={() => handleRunStress(50000, 50000)}
          >
            N=50,000, Q=50,000
          </button>
        </div>
      </div>

      {/* Benchmark Results Display */}
      {benchResults && (
        <div className="benchmark-results-section">
          {/* Verification Banner */}
          <div
            className={`verification-banner ${
              benchResults.isIdentical ? 'verified' : 'mismatch'
            }`}
          >
            {benchResults.isIdentical ? (
              <>
                <CheckCircle2 size={18} />
                <span>
                  <strong>Kiểm thử đúng đắn 100%:</strong> Toàn bộ 4 thuật toán đều trả về kết quả
                  khoảng cách trùng khớp hoàn toàn trên toàn bộ {benchResults.q.toLocaleString()} truy vấn!
                </span>
              </>
            ) : (
              <>
                <AlertTriangle size={18} />
                <span>Phát hiện sai khác kết quả giữa các thuật toán! Cần kiểm tra lại.</span>
              </>
            )}
          </div>

          {/* Algorithm Cards Grid */}
          <div className="algo-cards-grid">
            {Object.entries(benchResults.algorithms).map(([key, algo]) => {
              const percentOfMax = Math.max(
                3,
                Math.min(100, (algo.totalTimeMs / maxTotalTime) * 100)
              );

              return (
                <div key={key} className={`algo-card ${key}`}>
                  <div className="algo-card-top">
                    <div>
                      <h4 className="algo-name">{algo.name}</h4>
                      <p className="algo-desc">{algo.description}</p>
                    </div>
                    <span className="complexity-tag">{algo.timeComplexity}</span>
                  </div>

                  <div className="metrics-row">
                    <div className="metric-item">
                      <span className="metric-label">
                        <Clock size={13} /> Tiền xử lý
                      </span>
                      <span className="metric-value">{algo.preTimeMs} ms</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">
                        <Zap size={13} /> Thời gian truy vấn
                      </span>
                      <span className="metric-value">{algo.queryTimeMs} ms</span>
                    </div>
                    <div className="metric-item highlight">
                      <span className="metric-label">
                        <Cpu size={13} /> Tổng thời gian
                      </span>
                      <span className="metric-value bold">{algo.totalTimeMs} ms</span>
                    </div>
                  </div>

                  {/* Relative Performance Visual Bar */}
                  <div className="time-bar-wrapper">
                    <div
                      className="time-bar-fill"
                      style={{ width: `${percentOfMax}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparative Theory & Complexity Table */}
          <div className="complexity-table-card">
            <h4 className="table-title">
              <BarChart3 size={16} /> Bảng So Sánh Lý Thuyết Độ Phức Tạp (Big-O Complexity)
            </h4>
            <div className="table-responsive-wrapper">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Thuật toán</th>
                    <th>Thời gian Tiền xử lý</th>
                    <th>Thời gian mỗi Truy vấn</th>
                    <th>Tổng thời gian (N, Q)</th>
                    <th>Không gian (Space)</th>
                    <th>Phạm vi áp dụng tối ưu</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Binary Lifting (Nhị phân nâng)</strong>
                    </td>
                    <td>
                      <code>O(N log N)</code>
                    </td>
                    <td>
                      <code>O(log N)</code>
                    </td>
                    <td>
                      <code>O((N + Q) log N)</code>
                    </td>
                    <td>
                      <code>O(N log N)</code>
                    </td>
                    <td>Trực tuyến (Online), dễ cài đặt, mở rộng được trọng số cạnh.</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Euler Tour + RMQ (Sparse Table)</strong>
                    </td>
                    <td>
                      <code>O(N log N)</code>
                    </td>
                    <td>
                      <code className="text-success">O(1)</code>
                    </td>
                    <td>
                      <code>O(N log N + Q)</code>
                    </td>
                    <td>
                      <code>O(N log N)</code>
                    </td>
                    <td>Số truy vấn Q cực lớn (hàng triệu truy vấn).</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Tarjan's Offline LCA (DSU)</strong>
                    </td>
                    <td>
                      <code>O(1)</code>
                    </td>
                    <td>
                      <code>O(α(N))</code> amortized
                    </td>
                    <td>
                      <code className="text-success">O(N + Q · α(N))</code>
                    </td>
                    <td>
                      <code>O(N + Q)</code>
                    </td>
                    <td>Ngoại tuyến (Offline), biết trước toàn bộ truy vấn, bộ nhớ thấp.</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Duyệt BFS ngây thơ (Naive BFS)</strong>
                    </td>
                    <td>
                      <code>O(1)</code>
                    </td>
                    <td>
                      <code className="text-danger">O(N)</code>
                    </td>
                    <td>
                      <code className="text-danger">O(Q · N)</code>
                    </td>
                    <td>
                      <code>O(N)</code>
                    </td>
                    <td>Chỉ phù hợp khi Q rất nhỏ hoặc kiểm chứng tính đúng.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
