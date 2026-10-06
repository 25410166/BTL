import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { SudokuBoard } from './components/SudokuBoard';
import { ControlToolbar } from './components/ControlToolbar';
import { TestcaseQuickBar } from './components/TestcaseQuickBar';
import { StepExecutionTrace } from './components/StepExecutionTrace';
import { InputSection } from './components/InputSection';
import { OutputSection } from './components/OutputSection';
import { BenchmarkSection } from './components/BenchmarkSection';
import { PlayPracticeMode } from './components/PlayPracticeMode';
import { ProblemSpecModal } from './components/ProblemSpecModal';
import { TheoryReportModal } from './components/TheoryReportModal';
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
import { CheckCircleIcon, SparklesIcon, LayersIcon } from './components/Icons.jsx';

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

  // Tọa độ các ô ban đầu mang ký tự 'X'
  const initialEmptyCoords = useMemo(() => getEmptyCells(initialBoard), [initialBoard]);
  const initialEmptySet = useMemo(() => {
    const s = new Set();
    initialEmptyCoords.forEach(({ row, col }) => s.add(`${row},${col}`));
    return s;
  }, [initialEmptyCoords]);

  // Visualizer Execution State
  const [strategy, setStrategy] = useState('sequential'); // 'sequential' | 'mrv'
  const [speedMs, setSpeedMs] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [status, setStatus] = useState('IDLE'); // 'IDLE' | 'RUNNING' | 'PAUSED' | 'SOLVED' | 'NO_SOLUTION'
  const [solvedBoard, setSolvedBoard] = useState(null);
  const [executionStats, setExecutionStats] = useState(null);

  const timerRef = useRef(null);

  // Dark/Light mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Đảm bảo trace steps sẵn sàng
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

  // Play / Pause loop
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

  // Timer animation loop
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

  // Chọn testcase từ QuickBar hoặc InputSection
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

  // Sinh đề ngẫu nhiên
  function handleRandomGenerate() {
    const { board } = generateRandomSudoku(5); // chuẩn 5 ô X
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

  // Nạp ma trận tự do từ InputSection
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
    <div className="app-shell flex flex-col min-h-screen">
      {/* 1. Header gọn gàng */}
      <Navbar
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenProblemSpec={() => setIsProblemSpecOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(prev => !prev)}
      />

      {/* 2. Thân chính ứng dụng */}
      <main className="main-content flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 space-y-4">
        {activeView === 'visualizer' && (
          <div className="space-y-4">
            {/* Context Bar gọn nhẹ */}
            <div className="context-bar">
              <div className="flex items-center gap-2">
                <span className="context-label">Đang nạp:</span>
                <strong className="text-primary text-xs">{boardTitle}</strong>
                <span className="badge-mini-x">{initialEmptyCoords.length} ô 'X'</span>
                {initialEmptyCoords.length <= 5 ? (
                  <span className="badge-mini-exam">Chuẩn Đề (≤ 5 ô X)</span>
                ) : (
                  <span className="badge-mini-expand">Mở Rộng</span>
                )}
              </div>

              <div className="flex items-center gap-3 text-[11px] text-secondary">
                <span>Thuật toán: <strong className="text-accent">100% Backtracking</strong></span>
                <button
                  className="text-accent hover:underline cursor-pointer"
                  onClick={() => setIsProblemSpecOpen(true)}
                >
                  Xem Đề Bài Gốc
                </button>
              </div>
            </div>

            {/* BỐ CỤC STUDIO 2 CỘT: Cột Trái Bàn Cờ, Cột Phải Bộ Theo Dõi */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* CỘT TRÁI (7/12): Bàn cờ + Thanh testcase + Điều khiển */}
              <div className="lg:col-span-7 flex flex-col space-y-3">
                {/* 1. Thanh chọn testcase 1-click trực tiếp trên bàn cờ */}
                <TestcaseQuickBar
                  selectedId={selectedPresetId}
                  onSelectTestcase={handleSelectTestcase}
                  onRandomGenerate={handleRandomGenerate}
                  disabled={isPlaying}
                />

                {/* 2. Bàn cờ Sudoku 9x9 */}
                <div className="board-center-deck">
                  <SudokuBoard
                    board={displayBoard}
                    initialEmptySet={initialEmptySet}
                    currentStep={currentStep}
                    userSolvedState={status === 'SOLVED'}
                  />

                  {/* Chú giải màu sắc nhỏ gọn */}
                  <div className="board-mini-legend">
                    <span className="legend-item"><span className="legend-box box-given" /> Cho sẵn</span>
                    <span className="legend-item"><span className="legend-box box-x" /> Ô 'X'</span>
                    <span className="legend-item"><span className="legend-box box-active" /> Đang xét</span>
                    <span className="legend-item"><span className="legend-box box-conflict" /> Xung đột</span>
                    <span className="legend-item"><span className="legend-box box-backtrack" /> Quay lui</span>
                    <span className="legend-item"><span className="legend-box box-solved" /> Đã giải</span>
                  </div>
                </div>

                {/* 3. Thanh điều khiển mô phỏng */}
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

              {/* CỘT PHẢI (5/12): Bộ theo dõi chuyển ô & Dòng/cột + Quick Output */}
              <div className="lg:col-span-5 flex flex-col space-y-3">
                <StepExecutionTrace
                  currentStep={currentStep}
                  currentStepIndex={currentStepIndex}
                  totalSteps={steps.length}
                  allSteps={steps}
                  onSelectStep={handleSeekStep}
                />

                {/* Quick Output Preview */}
                <OutputSection
                  solvedBoard={solvedBoard || (status === 'SOLVED' ? displayBoard : null)}
                  initialEmptyCoords={initialEmptyCoords}
                  stats={executionStats}
                  isSolved={status === 'SOLVED'}
                  isUnsolvable={status === 'NO_SOLUTION'}
                  status={status}
                />
              </div>
            </div>

            {/* Mục Nhập dữ liệu nâng cao (Nhập text ma trận, file .txt) */}
            <div className="pt-2">
              <InputSection
                currentBoard={initialBoard}
                onApplyBoard={handleApplyCustomBoard}
                disabled={isPlaying}
              />
            </div>
          </div>
        )}

        {/* Chế độ Play & Practice */}
        {activeView === 'play' && (
          <PlayPracticeMode
            initialBoard={initialBoard}
            initialEmptySet={initialEmptySet}
          />
        )}

        {/* Chế độ Đối sánh thuật toán */}
        {activeView === 'benchmark' && (
          <BenchmarkSection />
        )}
      </main>

      {/* Footer */}
      <footer className="footer-compact">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-[11px] text-secondary">
          <span>BTL Thiết Kế Thuật Toán: <strong>Sudoku 9×9 Backtracking Solver</strong></span>
          <div className="flex gap-4">
            <button onClick={() => setIsReportOpen(true)} className="hover:text-accent">Báo Cáo Lý Thuyết</button>
            <button onClick={() => setIsProblemSpecOpen(true)} className="hover:text-accent">Đề Bài & Output</button>
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
