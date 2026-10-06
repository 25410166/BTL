// Navbar chính của ứng dụng
import React from 'react';
import {
  SparklesIcon,
  BookOpenIcon,
  BarChartIcon,
  GamepadIcon,
  MoonIcon,
  SunIcon,
  LayersIcon,
} from './Icons';

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
      <div className="navbar-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo & Tiêu đề */}
        <div className="flex items-center gap-3">
          <div className="logo-icon bg-primary-gradient p-2 rounded-xl text-white shadow-glow">
            <span className="font-mono font-black text-lg tracking-tighter">9×9</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-primary tracking-tight">
                Sudoku Backtracking Solver
              </h1>
              <span className="badge badge-accent text-[10px] hidden sm:inline-block">BTL Điểm 10</span>
            </div>
            <p className="text-[11px] text-secondary hidden sm:block">
              Trực Quan Hóa Thuật Toán Quay Lui & Bộ Testcase Toàn Diện
            </p>
          </div>
        </div>

        {/* Thanh chuyển chế độ xem (View Navigation) */}
        <nav className="nav-pills-bar flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-subtle">
          <button
            className={`nav-tab-btn ${activeView === 'visualizer' ? 'active' : ''}`}
            onClick={() => onChangeView('visualizer')}
          >
            <LayersIcon className="w-3.5 h-3.5" />
            <span>Trực Quan Hóa</span>
          </button>
          <button
            className={`nav-tab-btn ${activeView === 'play' ? 'active' : ''}`}
            onClick={() => onChangeView('play')}
          >
            <GamepadIcon className="w-3.5 h-3.5" />
            <span>Tự Giải (Play)</span>
          </button>
          <button
            className={`nav-tab-btn ${activeView === 'benchmark' ? 'active' : ''}`}
            onClick={() => onChangeView('benchmark')}
          >
            <BarChartIcon className="w-3.5 h-3.5" />
            <span>Đối Sánh</span>
          </button>
        </nav>

        {/* Các nút mở Báo cáo, Đề bài và Đổi theme */}
        <div className="flex items-center gap-2">
          <button
            className="btn btn-sm btn-secondary text-xs flex items-center gap-1.5"
            onClick={onOpenProblemSpec}
            title="Xem mô tả bài toán và đề bài gốc"
          >
            <BookOpenIcon className="w-3.5 h-3.5 text-accent" />
            <span className="hidden md:inline">Đề Bài & Input</span>
          </button>

          <button
            className="btn btn-sm btn-accent-outline text-xs flex items-center gap-1.5 font-medium"
            onClick={onOpenReport}
            title="Xem báo cáo chi tiết về kỹ thuật Backtracking"
          >
            <SparklesIcon className="w-3.5 h-3.5 text-purple" />
            <span className="hidden md:inline">Báo Cáo Lý Thuyết</span>
          </button>

          {/* Nút đổi Dark / Light mode */}
          <button
            className="btn-icon p-2 rounded-lg text-secondary hover:text-primary transition-colors"
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
