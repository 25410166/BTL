// Navbar chuẩn Pro Developer gọn nhẹ, hiện đại
import React from 'react';
import {
  SparklesIcon,
  BookOpenIcon,
  BarChartIcon,
  GamepadIcon,
  MoonIcon,
  SunIcon,
  LayersIcon,
} from './Icons.jsx';

export function Navbar({
  activeView,
  onChangeView,
  onOpenProblemSpec,
  onOpenReport,
  isDarkMode,
  onToggleTheme,
}) {
  return (
    <header className="navbar-container">
      <div className="navbar-inner max-w-7xl mx-auto px-4 flex items-center justify-between h-12">
        {/* Logo & Tiêu đề */}
        <div className="flex items-center gap-2.5">
          <div className="logo-badge">
            <span>9×9</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-primary tracking-tight">
                Sudoku Backtracking Solver
              </span>
              <span className="badge-mini-accent hidden sm:inline-block">Điểm 10</span>
            </div>
          </div>
        </div>

        {/* Thanh chuyển chế độ xem (View Navigation) */}
        <nav className="nav-pills-bar flex items-center gap-1 bg-surface-2 p-0.5 rounded-lg border border-subtle">
          <button
            className={`nav-tab-btn ${activeView === 'visualizer' ? 'active' : ''}`}
            onClick={() => onChangeView('visualizer')}
          >
            <LayersIcon className="w-3.5 h-3.5" />
            <span>Mô Phỏng</span>
          </button>
          <button
            className={`nav-tab-btn ${activeView === 'play' ? 'active' : ''}`}
            onClick={() => onChangeView('play')}
          >
            <GamepadIcon className="w-3.5 h-3.5" />
            <span>Tự Giải</span>
          </button>
          <button
            className={`nav-tab-btn ${activeView === 'benchmark' ? 'active' : ''}`}
            onClick={() => onChangeView('benchmark')}
          >
            <BarChartIcon className="w-3.5 h-3.5" />
            <span>Đối Sánh</span>
          </button>
        </nav>

        {/* Nút hành động */}
        <div className="flex items-center gap-1.5">
          <button
            className="btn-header-action"
            onClick={onOpenProblemSpec}
            title="Xem mô tả bài toán và đề bài gốc"
          >
            <BookOpenIcon className="w-3.5 h-3.5 text-accent" />
            <span className="hidden md:inline">Đề Bài & Input</span>
          </button>

          <button
            className="btn-header-action btn-header-purple"
            onClick={onOpenReport}
            title="Xem báo cáo chi tiết về kỹ thuật Backtracking"
          >
            <SparklesIcon className="w-3.5 h-3.5 text-purple" />
            <span className="hidden md:inline">Báo Cáo Lý Thuyết</span>
          </button>

          <button
            className="btn-icon p-1.5 rounded-md text-secondary hover:text-primary transition-colors"
            onClick={onToggleTheme}
            aria-label="Đổi chế độ sáng tối"
            title={isDarkMode ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
          >
            {isDarkMode ? <SunIcon className="w-4 h-4 text-warning" /> : <MoonIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
