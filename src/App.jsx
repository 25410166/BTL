import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { SudokuBoard } from './components/SudokuBoard';
import { ControlToolbar } from './components/ControlToolbar';
import { InputSection } from './components/InputSection';
import { OutputSection } from './components/OutputSection';
import { StepExecutionTrace } from './components/StepExecutionTrace';
import { BenchmarkSection } from './components/BenchmarkSection';
import { PlayPracticeMode } from './components/PlayPracticeMode';
import { ProblemSpecModal } from './components/ProblemSpecModal';
import { TheoryReportModal } from './components/TheoryReportModal';
import { PRESET_TESTCASES } from './data/presetTestcases';
import {
  cloneBoard,
  getEmptyCells,
  validateInitialBoard,
} from './algorithms/sudokuUtils';
import {
  generateBacktrackingTrace,
  solveBacktrackingInstant,
} from './algorithms/sudokuBacktracking';
import {
  generateMRVTrace,
  solveBacktrackingMRVInstant,
} from './algorithms/sudokuMRV';
import { fireConfetti } from './utils/confetti';
import { SparklesIcon, BookOpenIcon, CheckCircleIcon } from './components/Icons';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(true);

  // View state: 'visualizer' | 'play' | 'benchmark'
  const [activeView, setActiveView] = useState('visualizer');

  // Modals state
  const [isProblemSpecOpen, setIsProblemSpecOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Sudoku Board state
  const initialPreset = PRESET_TESTCASES[0]; // Sample đề thi
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

  // Visualizer execution state
  const [strategy, setStrategy] = useState('sequential'); // 'sequential' | 'mrv'
  const [speedMs, setSpeedMs] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [status, setStatus] = useState('IDLE'); // 'IDLE' | 'RUNNING' | 'PAUSED' | 'SOLVED' | 'NO_SOLUTION'
  const [solvedBoard, setSolvedBoard] = useState(null);
  const [executionStats, setExecutionStats] = useState(null);

  const timerRef = useRef(null);

  // Áp dụng theme class vào thẻ html root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Chuẩn bị các bước (Trace Steps) khi cần
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

  // Khởi động hoặc tạm dừng chạy tự động
  function handleTogglePlay() {
    if (isPlaying) {
      // Đang chạy -> Tạm dừng
      setIsPlaying(false);
      setStatus('PAUSED');
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      // Đang dừng -> Bắt đầu chạy
      const traceSteps = ensureStepsReady();
      if (!traceSteps || traceSteps.length === 0) return;

      setIsPlaying(true);
      setStatus('RUNNING');
    }
  }

  // Effect chạy vòng lặp hoạt ảnh theo speedMs
  useEffect(() => {
    if (!isPlaying) return;

    timerRef.current = setInterval(() => {
      setCurrentStepIndex(prevIdx => {
        const nextIdx = prevIdx + 1;
        if (nextIdx >= steps.length) {
          // Đã chạy tới bước cuối cùng
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

        // Cập nhật bàn cờ hiển thị theo bước hiện thời
        setDisplayBoard(steps[nextIdx].board);
        return nextIdx;
      });
    }, speedMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speedMs, steps]);

  // Tiến 1 bước (Step Forward)
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

  // Lùi 1 bước (Step Backward)
  function handleStepBackward() {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      setDisplayBoard(steps[prevIdx].board);
      setStatus('PAUSED');
    }
  }

  // Tua trực tiếp đến 1 bước cụ thể
  function handleSeekStep(targetIdx) {
    if (steps.length === 0) return;
    const clampedIdx = Math.max(0, Math.min(targetIdx, steps.length - 1));
    setCurrentStepIndex(clampedIdx);
    setDisplayBoard(steps[clampedIdx].board);
  }

  // Đặt lại bàn cờ về ban đầu
  function handleReset() {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setStatus('IDLE');
    setCurrentStepIndex(0);
    setDisplayBoard(cloneBoard(initialBoard));
  }

  // Giải tức thì (Instant Solve)
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

  // Nạp dữ liệu bàn cờ mới từ InputSection
  function handleApplyBoard(newBoard, title = 'Bàn cờ tùy chỉnh') {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setStatus('IDLE');
    setSteps([]);
    setCurrentStepIndex(0);
    setSolvedBoard(null);
    setExecutionStats(null);

    setInitialBoard(cloneBoard(newBoard));
    setDisplayBoard(cloneBoard(newBoard));
    setBoardTitle(title);
  }

  // Chuyển đổi chiến lược Backtracking
  function handleChangeStrategy(newStrat) {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setStatus('IDLE');
    setStrategy(newStrat);
    setSteps([]);
    setCurrentStepIndex(0);
    setDisplayBoard(cloneBoard(initialBoard));
  }

  // Nạp Sample đề bài từ modal
  function handleLoadExamSample() {
    const sample = PRESET_TESTCASES.find(t => t.id === 'sample_exam');
    if (sample) {
      handleApplyBoard(sample.board, sample.name);
    }
  }

  const currentStep = steps[currentStepIndex] || null;

  return (
    <div className="app-layout min-h-screen bg-surface-1 text-primary flex flex-col font-sans transition-colors duration-200">
      {/* 1. Thanh điều hướng đầu trang */}
      <Navbar
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenProblemSpec={() => setIsProblemSpecOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(prev => !prev)}
      />

      {/* 2. Banner thông tin đề tài nổi bật */}
      <section className="bg-surface-2 border-b border-subtle py-2.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="badge badge-accent">Đang xét:</span>
            <span className="font-semibold text-primary">{boardTitle}</span>
            <span className="text-secondary">
              ({initialEmptyCoords.length} ô trống mang ký tự 'X' cần tìm số)
            </span>
            {initialEmptyCoords.length <= 5 ? (
              <span className="badge badge-emerald text-[10px] hidden sm:inline-flex items-center gap-1">
                <CheckCircleIcon className="w-3 h-3" /> Chuẩn Đề Thi (≤ 5 ô X)
              </span>
            ) : (
              <span className="badge badge-purple text-[10px] hidden sm:inline-flex items-center gap-1">
                <SparklesIcon className="w-3 h-3" /> Mở Rộng Thử Thách
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-secondary text-[11px]">
            <span>
              Thuật toán: <strong className="text-accent">100% Backtracking (Quay lui)</strong>
            </span>
            <button
              className="text-accent underline font-medium hover:text-primary transition-colors"
              onClick={() => setIsProblemSpecOpen(true)}
            >
              Xem đề bài gốc & ví dụ
            </button>
          </div>
        </div>
      </section>

      {/* 3. Thân trang ứng dụng */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* VIEW 1: TRỰC QUAN HÓA THUẬT TOÁN (CHẾ ĐỘ MẶC ĐỊNH) */}
        {activeView === 'visualizer' && (
          <div className="space-y-6">
            {/* Thanh công cụ điều khiển mô phỏng */}
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

            {/* Bố cục 2 cột chính: Bên trái Bàn cờ, Bên phải Trình theo dõi chi tiết */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Cột trái (7/12): Bàn cờ Sudoku 9x9 */}
              <div className="lg:col-span-7 flex flex-col items-center board-main-wrapper p-4 sm:p-6 rounded-2xl bg-surface-card border border-subtle shadow-card">
                <SudokuBoard
                  board={displayBoard}
                  initialEmptySet={initialEmptySet}
                  currentStep={currentStep}
                  userSolvedState={status === 'SOLVED'}
                />

                {/* Chú thích màu sắc trực quan (Legend) */}
                <div className="mt-5 w-full pt-4 border-t border-subtle grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] text-secondary">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-surface-2 border border-subtle inline-block" />
                    <span>Số cho sẵn đề bài</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-amber-500/20 border border-amber-500 inline-block" />
                    <span>Ô trống 'X' ban đầu</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-sky-500/20 border border-sky-400 inline-block animate-pulse" />
                    <span>Ô đang thử giá trị</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-rose-500/20 border border-rose-500 inline-block" />
                    <span>Xung đột hàng/cột/khối</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-orange-500/20 border border-orange-500 inline-block" />
                    <span>Quay lui (Backtrack)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-400 inline-block" />
                    <span>Số đã giải thành công</span>
                  </div>
                </div>
              </div>

              {/* Cột phải (5/12): Theo dõi vết đệ quy & Call Stack */}
              <div className="lg:col-span-5 space-y-6">
                <StepExecutionTrace
                  currentStep={currentStep}
                  currentStepIndex={currentStepIndex}
                  totalSteps={steps.length}
                  allSteps={steps}
                  onSelectStep={handleSeekStep}
                />
              </div>
            </div>

            {/* Bố cục 2 cột phụ: Input đầu vào & Output đầu ra */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InputSection
                currentBoard={initialBoard}
                onApplyBoard={handleApplyBoard}
                disabled={isPlaying}
              />
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
        )}

        {/* VIEW 2: TỰ GIẢI & LUYỆN TẬP (PLAY MODE) */}
        {activeView === 'play' && (
          <div className="space-y-6">
            <PlayPracticeMode
              initialBoard={initialBoard}
              initialEmptySet={initialEmptySet}
            />
          </div>
        )}

        {/* VIEW 3: ĐỐI SÁNH THUẬT TOÁN (BENCHMARK) */}
        {activeView === 'benchmark' && (
          <div className="space-y-6">
            <BenchmarkSection />
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <footer className="bg-surface-2 border-t border-subtle py-4 px-4 sm:px-6 text-center text-xs text-secondary mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Bài Tập Lớn: <strong>Giải Sudoku 9×9 Bằng Kỹ Thuật Quay Lui (Backtracking)</strong> — Triển khai React + Vite
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsReportOpen(true)}
              className="text-accent hover:underline"
            >
              Báo Cáo Lý Thuyết
            </button>
            <button
              onClick={() => setIsProblemSpecOpen(true)}
              className="text-accent hover:underline"
            >
              Mô Tả Bài Toán
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProblemSpecModal
        isOpen={isProblemSpecOpen}
        onClose={() => setIsProblemSpecOpen(false)}
        onLoadSample={handleLoadExamSample}
      />
      <TheoryReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}
