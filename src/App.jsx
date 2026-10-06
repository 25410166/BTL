import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Bike,
  Sparkles,
  GitBranch,
  Gauge,
  BookOpen,
  Sun,
  Moon,
  Github,
  PlayCircle,
  HelpCircle,
  Info,
  Maximize2,
} from './components/Icons';
import { parseInput } from './algorithms/treeUtils';
import {
  preprocessBinaryLifting,
  getLCAWithVisualizationSteps,
  queryDistance,
  queryLCA,
  reconstructPath,
} from './algorithms/binaryLifting';
import { PRESET_TESTCASES } from './data/presetTestcases';
import { TreeVisualizer } from './components/TreeVisualizer';
import { StepController } from './components/StepController';
import { BinaryLiftingTable } from './components/BinaryLiftingTable';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { BenchmarkPanel } from './components/BenchmarkPanel';
import { ShipperSimulator } from './components/ShipperSimulator';
import { ReportModal } from './components/ReportModal';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState('dark');

  // Active top navigation tab
  const [activeTab, setActiveTab] = useState('visualizer'); // 'visualizer' | 'benchmark' | 'creative'
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Input & Testcase state
  const [rawInput, setRawInput] = useState(PRESET_TESTCASES[0].data);
  const [selectedPresetId, setSelectedPresetId] = useState(PRESET_TESTCASES[0].id);

  // Parse input
  const parseResult = useMemo(() => {
    return parseInput(rawInput);
  }, [rawInput]);

  // Precomputed Binary Lifting DP
  const blData = useMemo(() => {
    if (!parseResult.success || parseResult.n <= 0) return null;
    return preprocessBinaryLifting(parseResult.n, parseResult.adj, 1);
  }, [parseResult]);

  // Calculated Results for all queries
  const allResults = useMemo(() => {
    if (!parseResult.success || !blData || !parseResult.queries) return [];
    const { up, depth, LOGN } = blData;
    return parseResult.queries.map(([u, v], idx) => {
      const lca = queryLCA(u, v, up, depth, LOGN);
      const distance = depth[u] + depth[v] - 2 * depth[lca];
      return {
        queryIndex: idx,
        u,
        v,
        distance,
        lca,
      };
    });
  }, [parseResult, blData]);

  // Visualizer interactive query selection
  const [activeQueryIndex, setActiveQueryIndex] = useState(0);
  const [selectedStartNode, setSelectedStartNode] = useState(null);
  const [selectedEndNode, setSelectedEndNode] = useState(null);

  // Visualization Steps state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [fuelCapacity, setFuelCapacity] = useState(8);
  const [shipperNode, setShipperNode] = useState(null);

  // Compute active query pair
  const activeQuery = useMemo(() => {
    if (selectedStartNode && selectedEndNode) {
      return [selectedStartNode, selectedEndNode];
    }
    if (parseResult.queries && parseResult.queries[activeQueryIndex]) {
      return parseResult.queries[activeQueryIndex];
    }
    return [1, 1];
  }, [selectedStartNode, selectedEndNode, parseResult.queries, activeQueryIndex]);

  // Generate visualization steps whenever activeQuery or blData changes
  const visualizationSteps = useMemo(() => {
    if (!blData || !activeQuery) return [];
    const [u, v] = activeQuery;
    return getLCAWithVisualizationSteps(u, v, blData.up, blData.depth, blData.LOGN);
  }, [blData, activeQuery]);

  // Reset step index when query changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [activeQuery]);

  // Active step in the visualizer
  const currentStep = visualizationSteps[currentStepIndex] || null;

  // Handle direct node click on tree
  const handleSelectNode = (nodeId) => {
    if (!selectedStartNode || (selectedStartNode && selectedEndNode)) {
      setSelectedStartNode(nodeId);
      setSelectedEndNode(null);
    } else if (selectedStartNode && !selectedEndNode) {
      setSelectedEndNode(nodeId);
    }
  };

  // Preset load handler
  const handleLoadPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setRawInput(preset.data);
    setSelectedStartNode(null);
    setSelectedEndNode(null);
    setActiveQueryIndex(0);
  };

  // Step control handlers
  const handlePrevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.min(visualizationSteps.length - 1, prev + 1));
  }, [visualizationSteps.length]);

  const handleResetSteps = useCallback(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  const handleJumpToStep = (index) => {
    setCurrentStepIndex(index);
  };

  return (
    <div className={`app-root ${theme}`}>
      {/* Top Navigation Bar */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-logo-icon">
            <Bike size={22} />
          </div>
          <div className="brand-text">
            <h1 className="brand-title">Người Giao Cơm</h1>
            <span className="brand-badge">Lưu Ngô Tree LCA Solver</span>
          </div>
        </div>

        {/* Center Tabs */}
        <nav className="header-nav">
          <button
            className={`nav-tab ${activeTab === 'visualizer' ? 'active' : ''}`}
            onClick={() => setActiveTab('visualizer')}
          >
            <GitBranch size={16} />
            <span>Mô Phỏng Trực Quan</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'benchmark' ? 'active' : ''}`}
            onClick={() => setActiveTab('benchmark')}
          >
            <Gauge size={16} />
            <span>So Sánh Thuật Toán (Benchmark)</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'creative' ? 'active' : ''}`}
            onClick={() => setActiveTab('creative')}
          >
            <Sparkles size={16} />
            <span>Mở Rộng: Giao Đa Điểm & Xăng</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="header-actions">
          <button
            className="btn-report"
            onClick={() => setIsReportOpen(true)}
            title="Xem báo cáo khoa học & kỹ thuật"
          >
            <BookOpen size={16} />
            <span>Báo Cáo Điểm 10</span>
          </button>

          <button
            className="btn-icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Đổi giao diện Sáng / Tối"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="btn-icon github"
            title="Mã nguồn GitHub"
          >
            <Github size={18} />
          </a>
        </div>
      </header>

      {/* Main App Content */}
      <main className="app-main-content">
        {activeTab === 'visualizer' && (
          <div className="visualizer-layout-grid">
            {/* Left Column: Tree Canvas & Step Controls */}
            <section className="canvas-section">
              <div className="canvas-header-bar">
                <div className="query-display">
                  <span className="query-label">Đang xem truy vấn:</span>
                  <span className="query-target">
                    Căn hộ <strong>{activeQuery[0]}</strong> ➔ <strong>{activeQuery[1]}</strong>
                  </span>
                  {allResults[activeQueryIndex] && (
                    <span className="query-distance-badge">
                      Khoảng cách = <strong>{allResults[activeQueryIndex].distance}</strong>
                    </span>
                  )}
                </div>

                <div className="tree-quick-hints">
                  <span>Mẹo: Click 2 đỉnh trên cây để truy vấn bất kỳ</span>
                </div>
              </div>

              {/* Tree Canvas */}
              {parseResult.success && parseResult.n > 0 ? (
                <TreeVisualizer
                  n={parseResult.n}
                  adj={parseResult.adj}
                  root={1}
                  activeQuery={activeQuery}
                  currentStep={currentStep}
                  selectedStartNode={selectedStartNode}
                  selectedEndNode={selectedEndNode}
                  onSelectNode={handleSelectNode}
                  shipperProgress={
                    shipperNode
                      ? { currNode: shipperNode }
                      : currentStep?.finalPath
                      ? { currNode: currentStep.finalPath[0] }
                      : null
                  }
                />
              ) : (
                <div className="canvas-error-placeholder">
                  <Info size={28} />
                  <p>Vui lòng nhập dữ liệu cây hợp lệ ở khung bên phải để vẽ đồ thị.</p>
                </div>
              )}

              {/* Step Playback Controller */}
              <StepController
                steps={visualizationSteps}
                currentStepIndex={currentStepIndex}
                isPlaying={isPlaying}
                playbackSpeed={playbackSpeed}
                onPlayPause={setIsPlaying}
                onPrevStep={handlePrevStep}
                onNextStep={handleNextStep}
                onReset={handleResetSteps}
                onJumpToStep={handleJumpToStep}
                onChangeSpeed={setPlaybackSpeed}
              />

              {/* DP Table Inspector */}
              {blData && (
                <BinaryLiftingTable
                  n={parseResult.n}
                  up={blData.up}
                  depth={blData.depth}
                  LOGN={blData.LOGN}
                  activeNodes={currentStep?.activeNodes || []}
                />
              )}
            </section>

            {/* Right Column: Input & Output Panels */}
            <aside className="data-sidebar">
              <InputPanel
                rawInput={rawInput}
                onInputChange={setRawInput}
                parseResult={parseResult}
                onLoadPreset={handleLoadPreset}
                selectedPresetId={selectedPresetId}
              />

              <OutputPanel
                queries={parseResult.queries || []}
                results={allResults}
                onSelectQuery={(idx) => {
                  setActiveQueryIndex(idx);
                  setSelectedStartNode(null);
                  setSelectedEndNode(null);
                }}
                activeQueryIndex={activeQueryIndex}
                fuelCapacity={fuelCapacity}
              />
            </aside>
          </div>
        )}

        {activeTab === 'benchmark' && (
          <BenchmarkPanel
            n={parseResult.n || 5}
            adj={parseResult.adj || []}
            queries={parseResult.queries || []}
            root={1}
          />
        )}

        {activeTab === 'creative' && blData && (
          <div className="creative-tab-container">
            <ShipperSimulator
              n={parseResult.n}
              up={blData.up}
              depth={blData.depth}
              LOGN={blData.LOGN}
              fuelCapacity={fuelCapacity}
              setFuelCapacity={setFuelCapacity}
              onStepNodeChange={setShipperNode}
            />

            {/* Live Tree Preview inside Creative Simulator */}
            <div className="creative-canvas-wrapper">
              <TreeVisualizer
                n={parseResult.n}
                adj={parseResult.adj}
                root={1}
                activeQuery={[1, 1]}
                currentStep={{
                  finalPath: [],
                  activeNodes: [shipperNode || 1],
                }}
                selectedStartNode={null}
                selectedEndNode={null}
                onSelectNode={() => {}}
                shipperProgress={shipperNode ? { currNode: shipperNode } : null}
              />
            </div>
          </div>
        )}
      </main>

      {/* Academic Report Modal */}
      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </div>
  );
}
