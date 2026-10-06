import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Bike, HelpCircle } from './Icons';
import { computeTreeLayout } from '../algorithms/treeUtils';

export function TreeVisualizer({
  n,
  adj,
  root = 1,
  activeQuery,
  currentStep,
  selectedStartNode,
  selectedEndNode,
  onSelectNode,
  shipperProgress = null, // node id or fraction for animation
}) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 750, height: 460 });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute layout positions
  const nodePositions = useMemo(() => {
    return computeTreeLayout(n, adj, root, dimensions.width, dimensions.height);
  }, [n, adj, root, dimensions]);

  // Reset transform when n or layout changes significantly
  const resetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  const zoomIn = () => setTransform((prev) => ({ ...prev, scale: Math.min(prev.scale * 1.25, 4) }));
  const zoomOut = () => setTransform((prev) => ({ ...prev, scale: Math.max(prev.scale / 1.25, 0.4) }));

  // Mouse pan handling
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'circle' || e.target.tagName === 'text') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(Math.max(prev.scale * zoomFactor, 0.3), 5),
    }));
  };

  // Derive active paths and nodes
  const activeNodesSet = useMemo(() => {
    if (currentStep?.activeNodes) return new Set(currentStep.activeNodes);
    const s = new Set();
    if (selectedStartNode) s.add(selectedStartNode);
    if (selectedEndNode) s.add(selectedEndNode);
    return s;
  }, [currentStep, selectedStartNode, selectedEndNode]);

  const pathEdgesSet = useMemo(() => {
    const s = new Set();
    const path = currentStep?.finalPath;
    if (path && path.length > 1) {
      for (let i = 0; i < path.length - 1; i++) {
        const u = Math.min(path[i], path[i + 1]);
        const v = Math.max(path[i], path[i + 1]);
        s.add(`${u}-${v}`);
      }
    }
    return s;
  }, [currentStep]);

  // Edges to render
  const renderedEdges = useMemo(() => {
    const edgeList = [];
    const seen = new Set();
    for (let u = 1; u <= n; u++) {
      for (const v of adj[u] || []) {
        const key = `${Math.min(u, v)}-${Math.max(u, v)}`;
        if (!seen.has(key)) {
          seen.add(key);
          edgeList.push({ u, v, key });
        }
      }
    }
    return edgeList;
  }, [n, adj]);

  // Jump arcs (during binary lifting)
  const jumpArc = useMemo(() => {
    if (!currentStep?.jumpInfo) return null;
    const { from, to, uFrom, uTo, vFrom, vTo } = currentStep.jumpInfo;
    const arcs = [];
    if (from && to && nodePositions[from] && nodePositions[to]) {
      arcs.push({ from: nodePositions[from], to: nodePositions[to], label: `2^${currentStep.jumpInfo.power}` });
    }
    if (uFrom && uTo && nodePositions[uFrom] && nodePositions[uTo]) {
      arcs.push({ from: nodePositions[uFrom], to: nodePositions[uTo], label: `2^${currentStep.jumpInfo.power}` });
    }
    if (vFrom && vTo && nodePositions[vFrom] && nodePositions[vTo]) {
      arcs.push({ from: nodePositions[vFrom], to: nodePositions[vTo], label: `2^${currentStep.jumpInfo.power}` });
    }
    return arcs;
  }, [currentStep, nodePositions]);

  // Shipper current coordinates
  const shipperCoord = useMemo(() => {
    if (!shipperProgress) return null;
    const { currNode } = shipperProgress;
    if (currNode && nodePositions[currNode]) {
      return nodePositions[currNode];
    }
    return null;
  }, [shipperProgress, nodePositions]);

  return (
    <div
      ref={containerRef}
      className="tree-visualizer-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Floating Canvas Controls */}
      <div className="canvas-controls">
        <button onClick={zoomIn} title="Phóng to" className="control-btn">
          <ZoomIn size={16} />
        </button>
        <button onClick={zoomOut} title="Thu nhỏ" className="control-btn">
          <ZoomOut size={16} />
        </button>
        <button onClick={resetView} title="Căn giữa / Đặt lại view" className="control-btn">
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Floating Canvas Legend */}
      <div className="canvas-legend">
        <div className="legend-item">
          <span className="legend-dot root-dot"></span> Gốc ({root})
        </div>
        <div className="legend-item">
          <span className="legend-dot start-dot"></span> Điểm A
        </div>
        <div className="legend-item">
          <span className="legend-dot end-dot"></span> Điểm B
        </div>
        <div className="legend-item">
          <span className="legend-dot lca-dot"></span> LCA
        </div>
        <div className="legend-item">
          <span className="legend-line path-line"></span> Đường đi
        </div>
      </div>

      {/* Node Hover Tooltip */}
      {hoveredNode && (
        <div
          className="node-tooltip"
          style={{
            left: hoveredNode.screenX + 15,
            top: hoveredNode.screenY - 10,
          }}
        >
          <div className="tooltip-title">Căn hộ {hoveredNode.id}</div>
          <div className="tooltip-detail">Độ sâu (Depth): {hoveredNode.depth}</div>
          <div className="tooltip-detail">Bậc (Degree): {hoveredNode.degree} lân cận</div>
          <div className="tooltip-hint">Click để chọn điểm truy vấn A / B</div>
        </div>
      )}

      {/* Main SVG Graph */}
      <svg className="tree-svg" width="100%" height="100%">
        <defs>
          {/* Glowing Filter for active paths */}
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="neon-node" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.8" />
          </filter>

          {/* Gradients */}
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          <linearGradient id="jumpGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* Base Edges */}
          {renderedEdges.map(({ u, v, key }) => {
            const p1 = nodePositions[u];
            const p2 = nodePositions[v];
            if (!p1 || !p2) return null;
            const isPath = pathEdgesSet.has(key);

            return (
              <line
                key={key}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                className={`tree-edge ${isPath ? 'path-edge' : ''}`}
                stroke={isPath ? 'url(#pathGradient)' : 'var(--edge-color)'}
                strokeWidth={isPath ? 4.5 : 2}
                filter={isPath ? 'url(#glow)' : undefined}
              />
            );
          })}

          {/* Binary Lifting Jump Arcs */}
          {jumpArc &&
            jumpArc.map((arc, i) => {
              const dx = arc.to.x - arc.from.x;
              const dy = arc.to.y - arc.from.y;
              const cx = (arc.from.x + arc.to.x) / 2 - 35;
              const cy = (arc.from.y + arc.to.y) / 2;
              const pathD = `M ${arc.from.x} ${arc.from.y} Q ${cx} ${cy} ${arc.to.x} ${arc.to.y}`;

              return (
                <g key={`jump-${i}`} className="jump-arc-group">
                  <path
                    d={pathD}
                    fill="none"
                    stroke="url(#jumpGradient)"
                    strokeWidth="2.5"
                    strokeDasharray="5,4"
                    className="animated-dash"
                  />
                  <text
                    x={cx - 10}
                    y={cy}
                    fill="#f59e0b"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {arc.label}
                  </text>
                </g>
              );
            })}

          {/* Nodes */}
          {Array.from({ length: n }, (_, i) => i + 1).map((u) => {
            const pos = nodePositions[u];
            if (!pos) return null;

            const isRoot = u === root;
            const isStart = u === (selectedStartNode || activeQuery?.[0]);
            const isEnd = u === (selectedEndNode || activeQuery?.[1]);
            const isLCA = u === currentStep?.lcaCandidate || u === currentStep?.lca;
            const isInPath = currentStep?.finalPath?.includes(u);
            const isActive = activeNodesSet.has(u);

            let nodeFill = 'var(--node-bg)';
            let nodeStroke = 'var(--node-border)';
            let strokeWidth = 2.5;

            if (isLCA) {
              nodeFill = '#7c3aed'; // Purple
              nodeStroke = '#c084fc';
              strokeWidth = 4;
            } else if (isStart) {
              nodeFill = '#0284c7'; // Blue
              nodeStroke = '#38bdf8';
              strokeWidth = 3.5;
            } else if (isEnd) {
              nodeFill = '#059669'; // Green
              nodeStroke = '#34d399';
              strokeWidth = 3.5;
            } else if (isRoot) {
              nodeFill = '#d97706'; // Gold
              nodeStroke = '#fde047';
            } else if (isInPath) {
              nodeFill = '#3b82f6';
              nodeStroke = '#93c5fd';
            }

            const radius = isLCA ? 20 : isStart || isEnd ? 19 : isRoot ? 18 : 16;

            return (
              <g
                key={u}
                className={`tree-node-group ${isActive ? 'pulse-node' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(u);
                }}
                onMouseEnter={(e) => {
                  const rect = containerRef.current.getBoundingClientRect();
                  setHoveredNode({
                    id: u,
                    depth: pos.depth,
                    degree: adj[u]?.length || 0,
                    screenX: e.clientX - rect.left,
                    screenY: e.clientY - rect.top,
                  });
                }}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Outer ring for selected or active */}
                {(isStart || isEnd || isLCA) && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius + 6}
                    fill="none"
                    stroke={nodeStroke}
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    opacity="0.8"
                    className="rotating-halo"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={nodeFill}
                  stroke={nodeStroke}
                  strokeWidth={strokeWidth}
                  filter={isLCA || isStart || isEnd ? 'url(#glow)' : undefined}
                />

                {/* Node Label (Number) */}
                <text
                  x={pos.x}
                  y={pos.y + 4.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={radius > 16 ? 12 : 11}
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {u}
                </text>

                {/* Sub-label for Depth */}
                <text
                  x={pos.x}
                  y={pos.y + radius + 13}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="9"
                  pointerEvents="none"
                >
                  d={pos.depth}
                </text>
              </g>
            );
          })}

          {/* Animated Shipper Icon */}
          {shipperCoord && (
            <g
              transform={`translate(${shipperCoord.x - 14}, ${shipperCoord.y - 14})`}
              className="shipper-marker"
            >
              <circle cx="14" cy="14" r="16" fill="#f59e0b" opacity="0.25" className="ping-circle" />
              <rect x="0" y="0" width="28" height="28" rx="14" fill="#f59e0b" />
              <g transform="translate(6, 6) scale(0.65)">
                <Bike color="#ffffff" size={24} />
              </g>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
