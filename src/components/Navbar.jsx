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
    <header className="navbar-root">
      <div className="navbar-container">
        {/* Left: Brand */}
        <div className="navbar-brand">
          <div className="logo-badge">9×9</div>
          <span className="navbar-title">Sudoku Backtracking Solver</span>
          <span className="navbar-tag">Academic Tool</span>
        </div>

        {/* Center/Right: Navigation Tabs */}
        <nav className="navbar-nav">
          <button
            className={`nav-tab ${activeView === 'visualizer' ? 'nav-tab-active' : ''}`}
            onClick={() => onChangeView('visualizer')}
          >
            <LayersIcon className="w-3.5 h-3.5" />
            <span>Mô Phỏng</span>
          </button>
          <button
            className={`nav-tab ${activeView === 'play' ? 'nav-tab-active' : ''}`}
            onClick={() => onChangeView('play')}
          >
            <GamepadIcon className="w-3.5 h-3.5" />
            <span>Tự Giải</span>
          </button>
          <button
            className={`nav-tab ${activeView === 'benchmark' ? 'nav-tab-active' : ''}`}
            onClick={() => onChangeView('benchmark')}
          >
            <BarChartIcon className="w-3.5 h-3.5" />
            <span>Đối Sánh</span>
          </button>
        </nav>

        {/* Right: Quick Actions */}
        <div className="navbar-actions">
          <button
            className="action-btn"
            onClick={onOpenProblemSpec}
            title="Xem Mô tả bài toán, Input, Output & Ví dụ gốc"
          >
            <BookOpenIcon className="w-3.5 h-3.5 text-accent" />
            <span className="hidden sm:inline">Đề Bài & Output</span>
          </button>

          <button
            className="action-btn action-btn-purple"
            onClick={onOpenReport}
            title="Xem Báo cáo nghiên cứu thuật toán"
          >
            <SparklesIcon className="w-3.5 h-3.5 text-purple" />
            <span className="hidden sm:inline">Báo Cáo Lý Thuyết</span>
          </button>

          <button
            className="action-icon-btn"
            onClick={onToggleTheme}
            aria-label="Đổi giao diện sáng/tối"
            title={isDarkMode ? 'Giao diện Sáng' : 'Giao diện Tối'}
          >
            {isDarkMode ? <SunIcon className="w-4 h-4 text-warning" /> : <MoonIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
