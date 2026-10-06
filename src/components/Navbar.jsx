import React from 'react';
import {
  BookOpenIcon,
  MoonIcon,
  SunIcon,
} from './Icons.jsx';

export function Navbar({
  onOpenProblemSpec,
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
          <span className="navbar-tag">Quay Lui Thuần Túy</span>
        </div>

        {/* Right: Quick Actions */}
        <div className="navbar-actions">
          <button
            className="action-btn"
            onClick={onOpenProblemSpec}
            title="Xem Mô tả bài toán, Input, Output & Ví dụ gốc từ đề thi"
          >
            <BookOpenIcon className="w-3.5 h-3.5 text-accent" />
            <span>Đặc Tả Đề Bài</span>
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
