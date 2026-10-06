import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { StatusBar } from './components/StatusBar.jsx';
import { SudokuBoard } from './components/SudokuBoard.jsx';
import { ControlToolbar } from './components/ControlToolbar.jsx';
import { SimulationSidebar } from './components/SimulationSidebar.jsx';
import { TestcaseGrid } from './components/TestcaseGrid.jsx';
import { InputPanel } from './components/InputPanel.jsx';
import { BenchmarkSection } from './components/BenchmarkSection.jsx';
import { PlayPracticeMode } from './components/PlayPracticeMode.jsx';
import { ProblemSpecModal } from './components/ProblemSpecModal.jsx';
import { TheoryReportModal } from './components/TheoryReportModal.jsx';
import { PRESET_TESTCASES } from './data/presetTestcases.js';
import {
  cloneBoard,
  getEmptyCells,
  validateInitialBoard,
  generateRandomSudoku,
} from './algorithms/sudokuUtils.js';
import {
  generateBacktrackingTrace,
  solveBacktrackingInstant,
} from './algorithms/sudokuBacktracking.js';
import {
  generateMRVTrace,
  solveBacktrackingMRVInstant,
} from './algorithms/sudokuMRV.js';
import { fireConfetti } from './utils/confetti.js';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeView, setActiveView] = useState('visualizer'); // 'visualizer' | 'play' | 'benchmark'

  // Modals
  const [isProblemSpecOpen, setIsProblemSpecOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Sudoku Board State
  const initialPreset = PRESET_TESTCASES[0];
  const [selectedPresetId, setSelectedPresetId] = useState(initialPreset.id);
  const [initialBoard, setInitialBoard] = useState(() => cloneBoard(initialPreset.board));
  const [boardTitle, setBoardTitle] = useState(initialPreset.name);
  const [displayBoard, setDisplayBoard] = useState(() => cloneBoard(initialPreset.board));

  // Tọa độ các ô mang ký tự 'X'
  const initialEmptyCoords = useMemo(() => getEmptyCells(initialBoard), [initialBoard]);
  const initialEmptySet = useMemo(() => {
    const s = new Set();
    initialEmptyCoords.forEach(({ row, col }) => s.add(`${row},${col}`));
    return s;
  }, [initialEmptyCoords]);

  // Simulation State
  const [strategy, setStrategy] = useState('sequential'); // 'sequential' | 'mrv'
  const [speedMs, setSpeedMs] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [status, setStatus] = useState('IDLE'); // 'IDLE' | 'RUNNING' | 'PAUSED' | 'SOLVED' | 'NO_SOLUTION'
  const [solvedBoard, setSolvedBoard] = useState(null);
  const [executionStats, setExecutionStats] = useState(null);

  const timerRef = useRef(null);

  // Sync theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sinh vết thực thi
  function ensureStepsReady() {
    if (steps.length > 0) return steps;

    const validation = validateInitialBoard(initialBoard);
    if (!validation.valid) {
      alert(`Bàn cờ ban đầu không hợp lệ: ${validation.errors[0]}`);
      return [];
    }

    const traceResult =
      strategy === 'mrv'
        ? generateMRVTrace(initialBoard)
        : generateBacktrackingTrace(initialBoard);

    setSteps(traceResult.steps);
    setSolvedBoard(traceResult.finalBoard);
    setExecutionStats(traceResult.stats);
    return traceResult.steps;
  }

  // Chạy hoặc tạm dừng
  function handleTogglePlay() {
    if (isPlaying) {
      setIsPlaying(false);
      setStatus('PAUSED');
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      const traceSteps = ensureStepsReady();
      if (!traceSteps || traceSteps.length === 0) return;

      setIsPlaying(true);
      setStatus('RUNNING');
    }
  }

  // Timer loop
  useEffect(() => {
    if (!isPlaying) return;

    timerRef.current = setInterval(() => {
      setCurrentStepIndex(prevIdx => {
        const nextIdx = prevIdx + 1;
        if (nextIdx >= steps.length) {
          clearInterval(timerRef.current);
          setIsPlaying(false);
          const lastStep = steps[steps.length - 1];
          if (lastStep?.type === 'SUCCESS') {
            setStatus('SOLVED');
            setDisplayBoard(lastStep.board);
            fireConfetti();
          } else {
            setStatus('NO_SOLUTION');
          }
          return prevIdx;
        }

        setDisplayBoard(steps[nextIdx].board);
        return nextIdx;
      });
    }, speedMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speedMs, steps]);

  // Tiến 1 bước
  function handleStepForward() {
    const traceSteps = ensureStepsReady();
    if (!traceSteps || traceSteps.length === 0) return;

    if (currentStepIndex < traceSteps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      setDisplayBoard(traceSteps[nextIdx].board);

      if (nextIdx === traceSteps.length - 1) {
        if (traceSteps[nextIdx].type === 'SUCCESS') {
          setStatus('SOLVED');
          fireConfetti();
        } else {
          setStatus('NO_SOLUTION');
        }
      }
    }
  }

  // Lùi 1 bước
  function handleStepBackward() {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      setDisplayBoard(steps[prevIdx].board);
      setStatus('PAUSED');
    }
  }

  // Tua bước
  function handleSeekStep(targetIdx) {
    if (steps.length === 0) return;
    const clampedIdx = Math.max(0, Math.min(targetIdx, steps.length - 1));
    setCurrentStepIndex(clampedIdx);
    setDisplayBoard(steps[clampedIdx].board);
  }

  // Đặt lại
  function handleReset() {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setStatus('IDLE');
    setCurrentStepIndex(0);
    setDisplayBoard(cloneBoard(initialBoard));
  }

  // Giải tức thì
  function handleInstantSolve() {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);

    const result =
      strategy === 'mrv'
        ? solveBacktrackingMRVInstant(initialBoard)
        : solveBacktrackingInstant(initialBoard);

    if (result.solved && result.board) {
      setDisplayBoard(result.board);
      setSolvedBoard(result.board);
      setExecutionStats(result.stats);
      setStatus('SOLVED');
      fireConfetti();
    } else {
      setStatus('NO_SOLUTION');
      setSolvedBoard(null);
    }
  }

  // Chọn testcase
  function handleSelectTestcase(testcase) {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setStatus('IDLE');
    setSteps([]);
    setCurrentStepIndex(0);
    setSolvedBoard(null);
    setExecutionStats(null);

    setSelectedPresetId(testcase.id);
    setInitialBoard(cloneBoard(testcase.board));
    setDisplayBoard(cloneBoard(testcase.board));
    setBoardTitle(testcase.name);
  }

  // Sinh ngẫu nhiên
  function handleRandomGenerate() {
    const { board } = generateRandomSudoku(5);
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setStatus('IDLE');
    setSteps([]);
    setCurrentStepIndex(0);
    setSolvedBoard(null);
    setExecutionStats(null);

    setSelectedPresetId('custom_random');
    setInitialBoard(cloneBoard(board));
    setDisplayBoard(cloneBoard(board));
    setBoardTitle('Sinh Ngẫu Nhiên (5 ô X)');
  }

  // Nhập ma trận tự do
  function handleApplyCustomBoard(newBoard, title) {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setStatus('IDLE');
    setSteps([]);
    setCurrentStepIndex(0);
    setSolvedBoard(null);
    setExecutionStats(null);

    setSelectedPresetId('custom');
    setInitialBoard(cloneBoard(newBoard));
    setDisplayBoard(cloneBoard(newBoard));
    setBoardTitle(title);
  }

  function handleChangeStrategy(newStrat) {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setStatus('IDLE');
    setStrategy(newStrat);
    setSteps([]);
    setCurrentStepIndex(0);
    setDisplayBoard(cloneBoard(initialBoard));
  }

  const currentStep = steps[currentStepIndex] || null;

  return (
    <div className="dashboard-app-root">
      {/* 1. HEADER (56px) */}
      <Navbar
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenProblemSpec={() => setIsProblemSpecOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(prev => !prev)}
      />

      {/* 2. STATUS BAR (44px) */}
      <StatusBar
        boardTitle={boardTitle}
        emptyCount={initialEmptyCoords.length}
        strategy={strategy}
        onOpenProblemSpec={() => setIsProblemSpecOpen(true)}
      />

      {/* 3. MAIN DASHBOARD CONTENT */}
      <main className="dashboard-main-container">
        {activeView === 'visualizer' && (
          <div className="visualizer-content-flow">
            {/* ========================================================
                MAIN ALGORITHM VISUALIZATION AREA (65% Board / 35% Sidebar)
                ======================================================== */}
            <div className="main-simulation-grid">
              {/* Left Column (65%): Sudoku Board + Controls Directly Below */}
              <div className="simulation-board-column">
                <SudokuBoard
                  board={displayBoard}
                  initialEmptySet={initialEmptySet}
                  currentStep={currentStep}
                  userSolvedState={status === 'SOLVED'}
                />

                {/* Điều Khiển Thuật Toán - 1 hàng ngang, đặt ngay dưới bàn cờ */}
                <ControlToolbar
                  isPlaying={isPlaying}
                  onTogglePlay={handleTogglePlay}
                  onStepForward={handleStepForward}
                  onStepBackward={handleStepBackward}
                  onReset={handleReset}
                  onInstantSolve={handleInstantSolve}
                  speedMs={speedMs}
                  onChangeSpeed={setSpeedMs}
                  currentStepIndex={currentStepIndex}
                  totalSteps={steps.length}
                  onSeekStep={handleSeekStep}
                  strategy={strategy}
                  onChangeStrategy={handleChangeStrategy}
                  status={status}
                />
              </div>

              {/* Right Column (35%): Inspector & Output Panel */}
              <div className="simulation-sidebar-column">
                <SimulationSidebar
                  status={status}
                  currentStep={currentStep}
                  currentStepIndex={currentStepIndex}
                  totalSteps={steps.length}
                  allSteps={steps}
                  onSelectStep={handleSeekStep}
                  solvedBoard={solvedBoard || (status === 'SOLVED' ? displayBoard : null)}
                  initialEmptyCoords={initialEmptyCoords}
                  executionStats={executionStats}
                />
              </div>
            </div>

            {/* ========================================================
                TESTCASE SELECTOR (Grid layout 3-4 cards / row)
                ======================================================== */}
            <TestcaseGrid
              selectedId={selectedPresetId}
              onSelectTestcase={handleSelectTestcase}
              onRandomGenerate={handleRandomGenerate}
              disabled={isPlaying}
            />

            {/* ========================================================
                INPUT / TESTCASE DETAILS (Segmented tools)
                ======================================================== */}
            <InputPanel
              currentBoard={initialBoard}
              onApplyBoard={handleApplyCustomBoard}
              disabled={isPlaying}
            />
          </div>
        )}

        {/* View 2: Play Mode */}
        {activeView === 'play' && (
          <PlayPracticeMode
            initialBoard={initialBoard}
            initialEmptySet={initialEmptySet}
          />
        )}

        {/* View 3: Benchmark Mode */}
        {activeView === 'benchmark' && (
          <BenchmarkSection />
        )}
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="dashboard-footer-inner">
          <span>BTL Thiết Kế & Đánh Giá Thuật Toán: <strong>Sudoku 9×9 Backtracking Solver</strong></span>
          <div className="flex gap-4">
            <button onClick={() => setIsReportOpen(true)} className="footer-link">Báo Cáo Lý Thuyết</button>
            <button onClick={() => setIsProblemSpecOpen(true)} className="footer-link">Đặc Tả Đề Bài</button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProblemSpecModal
        isOpen={isProblemSpecOpen}
        onClose={() => setIsProblemSpecOpen(false)}
        onLoadSample={() => handleSelectTestcase(PRESET_TESTCASES[0])}
      />
      <TheoryReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}
