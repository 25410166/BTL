import React, { useState, useEffect } from 'react';
import {
  Bike,
  Fuel,
  MapPin,
  Route,
  Navigation,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
} from './Icons';
import { queryDistance, reconstructPath } from '../algorithms/binaryLifting';

export function ShipperSimulator({
  n,
  up,
  depth,
  LOGN,
  fuelCapacity,
  setFuelCapacity,
  onStepNodeChange,
}) {
  const [multiStops, setMultiStops] = useState([1, 3, 5, 2]);
  const [inputStops, setInputStops] = useState('1, 3, 5, 2');
  const [gasStations, setGasStations] = useState([1, 3]);
  const [inputGas, setInputGas] = useState('1, 3');
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentShipperNode, setCurrentShipperNode] = useState(1);
  const [currentFuel, setCurrentFuel] = useState(fuelCapacity);
  const [simLog, setSimLog] = useState([]);
  const [speed, setSpeed] = useState(1);

  // Compute full itinerary
  const routeCalculation = React.useMemo(() => {
    if (!up || up.length === 0 || multiStops.length < 2) return null;

    let totalDist = 0;
    const legs = [];
    const fullPathNodes = [];

    for (let i = 0; i < multiStops.length - 1; i++) {
      const u = multiStops[i];
      const v = multiStops[i + 1];
      if (u > n || v > n) continue;

      const d = queryDistance(u, v, up, depth, LOGN);
      totalDist += d;

      // Find LCA
      let currU = u;
      let currV = v;
      if (depth[currU] < depth[currV]) {
        const tmp = currU;
        currU = currV;
        currV = tmp;
      }
      const diff = depth[currU] - depth[currV];
      for (let k = LOGN - 1; k >= 0; k--) {
        if ((diff >> k) & 1) currU = up[currU][k];
      }
      let lca = currU;
      if (currU !== currV) {
        for (let k = LOGN - 1; k >= 0; k--) {
          if (up[currU][k] !== up[currV][k]) {
            currU = up[currU][k];
            currV = up[currV][k];
          }
        }
        lca = up[currU][0];
      }

      const legPath = reconstructPath(u, v, lca, up);
      legs.push({ from: u, to: v, dist: d, path: legPath });

      if (fullPathNodes.length === 0) {
        fullPathNodes.push(...legPath);
      } else {
        fullPathNodes.push(...legPath.slice(1));
      }
    }

    return { totalDist, legs, fullPathNodes };
  }, [multiStops, up, depth, LOGN, n]);

  // Update stops from text
  const applyStops = () => {
    const parsed = inputStops
      .split(/[,\s]+/)
      .map(Number)
      .filter((num) => num >= 1 && num <= n);
    if (parsed.length >= 2) {
      setMultiStops(parsed);
      setCurrentShipperNode(parsed[0]);
    }
  };

  const applyGasStations = () => {
    const parsed = inputGas
      .split(/[,\s]+/)
      .map(Number)
      .filter((num) => num >= 1 && num <= n);
    setGasStations(parsed);
  };

  // Run Animated Delivery Simulation
  const startDeliverySimulation = () => {
    if (!routeCalculation || routeCalculation.fullPathNodes.length === 0) return;
    setIsSimulating(true);
    setSimLog([]);

    const path = routeCalculation.fullPathNodes;
    let idx = 0;
    let fuel = fuelCapacity;
    const gasSet = new Set(gasStations);
    const logs = [];

    const interval = setInterval(() => {
      if (idx >= path.length) {
        clearInterval(interval);
        setIsSimulating(false);
        logs.push({
          msg: `Hoàn tất giao toàn bộ đơn hàng! Tổng quãng đường: ${routeCalculation.totalDist} con đường.`,
          type: 'success',
        });
        setSimLog([...logs]);
        return;
      }

      const curr = path[idx];
      setCurrentShipperNode(curr);
      if (onStepNodeChange) onStepNodeChange(curr);

      if (idx > 0) {
        fuel -= 1; // 1 edge = 1 fuel
      }

      // Check gas station
      if (gasSet.has(curr)) {
        fuel = fuelCapacity;
        logs.push({
          msg: `Đến căn hộ ${curr} (Trạm xăng): Nạp đầy bình xăng (${fuelCapacity}/${fuelCapacity})`,
          type: 'fuel',
        });
      } else if (fuel <= 0 && idx < path.length - 1) {
        logs.push({
          msg: `CẢNH BÁO: Hết xăng tại căn hộ ${curr}! Lưu Ngô không thể đi tiếp.`,
          type: 'danger',
        });
        setCurrentFuel(fuel);
        setSimLog([...logs]);
        clearInterval(interval);
        setIsSimulating(false);
        return;
      } else {
        logs.push({
          msg: `Xe chạy qua căn hộ ${curr} (Xăng còn: ${fuel}/${fuelCapacity})`,
          type: 'normal',
        });
      }

      setCurrentFuel(fuel);
      setSimLog([...logs]);
      idx++;
    }, Math.max(150, 800 / speed));
  };

  const gasSet = new Set(gasStations);

  return (
    <div className="shipper-simulator-container">
      {/* Header */}
      <div className="sim-header-card">
        <div className="sim-title-group">
          <div className="sim-icon-circle">
            <Bike size={24} />
          </div>
          <div>
            <h3>Bài Toán Mở Rộng: Giao Cơm Đa Điểm & Trạm Xăng Lưu Ngô</h3>
            <p>
              Mô phỏng thực tế: Giới hạn bình xăng, tiếp nhiên liệu tại trạm xăng và lên lộ trình giao
              nhiều đơn hàng liên tiếp trên cấu trúc cây.
            </p>
          </div>
        </div>

        {/* Current Fuel Gauge */}
        <div className="fuel-gauge-card">
          <div className="gauge-label">
            <Fuel size={16} /> Dung tích bình xăng
          </div>
          <div className="fuel-meter-wrapper">
            <div
              className={`fuel-bar-fill ${currentFuel <= 2 ? 'low' : ''}`}
              style={{
                width: `${Math.min(100, (currentFuel / fuelCapacity) * 100)}%`,
              }}
            />
          </div>
          <div className="gauge-value">
            {currentFuel} / {fuelCapacity} lít
          </div>
        </div>
      </div>

      {/* Control Panel Grid */}
      <div className="sim-controls-grid">
        {/* Left: Input stops & gas stations */}
        <div className="sim-sub-card">
          <h4>
            <Route size={16} /> Lộ Trình Giao Hàng (Danh sách căn hộ)
          </h4>
          <p className="sub-desc">Nhập các căn hộ cần giao cơm theo thứ tự (cách nhau bởi dấu phẩy):</p>
          <div className="input-group-row">
            <input
              type="text"
              value={inputStops}
              onChange={(e) => setInputStops(e.target.value)}
              placeholder="VD: 1, 3, 5, 2"
              className="text-input"
            />
            <button className="btn-secondary" onClick={applyStops}>
              Áp dụng
            </button>
          </div>

          <h4 style={{ marginTop: '16px' }}>
            <Fuel size={16} /> Vị Trí Các Trạm Xăng (Gas Stations)
          </h4>
          <p className="sub-desc">Căn hộ có trạm xăng sẽ giúp xe tự động đổ đầy bình:</p>
          <div className="input-group-row">
            <input
              type="text"
              value={inputGas}
              onChange={(e) => setInputGas(e.target.value)}
              placeholder="VD: 1, 3"
              className="text-input"
            />
            <button className="btn-secondary" onClick={applyGasStations}>
              Đặt trạm
            </button>
          </div>

          <div className="capacity-slider-group">
            <label>Dung tích bình xăng tối đa: {fuelCapacity} con đường</label>
            <input
              type="range"
              min="2"
              max="30"
              value={fuelCapacity}
              onChange={(e) => {
                const val = Number(e.target.value);
                setFuelCapacity(val);
                setCurrentFuel(val);
              }}
            />
          </div>
        </div>

        {/* Right: Route Details & Action */}
        <div className="sim-sub-card">
          <h4>
            <Navigation size={16} /> Phân Tích Lộ Trình Di Chuyển
          </h4>

          {routeCalculation && (
            <div className="route-summary-box">
              <div className="summary-stat">
                <span className="stat-label">Tổng quãng đường:</span>
                <span className="stat-number">{routeCalculation.totalDist} con đường</span>
              </div>
              <div className="summary-stat">
                <span className="stat-label">Số chặng giao:</span>
                <span className="stat-number">{routeCalculation.legs.length} chặng</span>
              </div>

              {/* Legs Breakdown */}
              <div className="legs-list">
                {routeCalculation.legs.map((leg, i) => (
                  <div key={i} className="leg-item">
                    <span className="leg-index">Chặng {i + 1}:</span>
                    <span className="leg-route">
                      {leg.from} ➔ {leg.to} ({leg.dist} cạnh)
                    </span>
                    <span className="leg-path-nodes">
                      [{leg.path.join(' ➔ ')}]
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="sim-action-row">
                <button
                  className="btn-primary-glow"
                  onClick={startDeliverySimulation}
                  disabled={isSimulating}
                >
                  <Play size={16} /> Bắt đầu hành trình giao cơm
                </button>
                <div className="speed-buttons">
                  <span className="speed-txt">Tốc độ:</span>
                  {[1, 2, 4].map((s) => (
                    <button
                      key={s}
                      className={`speed-pill ${speed === s ? 'active' : ''}`}
                      onClick={() => setSpeed(s)}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Activity Log */}
      {simLog.length > 0 && (
        <div className="sim-log-card">
          <h4>Nhật Ký Hành Trình Của Lưu Ngô</h4>
          <div className="log-entries">
            {simLog.slice(-6).map((item, idx) => (
              <div key={idx} className={`log-entry ${item.type}`}>
                <span className="log-bullet">•</span>
                <span>{item.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
