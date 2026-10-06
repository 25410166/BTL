import React, { useState } from 'react';
import { PRESET_TESTCASES } from '../data/presetTestcases.js';
import { SparklesIcon, ShuffleIcon } from './Icons.jsx';

export function TestcaseGrid({
  selectedId,
  onSelectTestcase,
  onRandomGenerate,
  disabled = false,
}) {
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'exam' | 'expand'

  const examTestcases = PRESET_TESTCASES.filter(t => t.category === 'exam');
  const expandTestcases = PRESET_TESTCASES.filter(t => t.category === 'expand');

  const displayedTestcases =
    filterCategory === 'exam'
      ? examTestcases
      : filterCategory === 'expand'
      ? expandTestcases
      : PRESET_TESTCASES;

  return (
    <div className="testcase-section-root">
      {/* Section Header with Segmented Filter */}
      <div className="section-header-bar">
        <div className="section-header-left">
          <span className="section-title">Bộ Testcase Kiểm Thử</span>
          <span className="section-subtitle">
            Chọn bộ dữ liệu mẫu để nạp trực tiếp vào ma trận Sudoku
          </span>
        </div>

        {/* Filter Pills & Random Action */}
        <div className="section-header-right">
          <div className="filter-pill-group">
            <button
              className={`filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
              onClick={() => setFilterCategory('all')}
            >
              Tất Cả ({PRESET_TESTCASES.length})
            </button>
            <button
              className={`filter-btn ${filterCategory === 'exam' ? 'active' : ''}`}
              onClick={() => setFilterCategory('exam')}
            >
              Chuẩn Đề Thi ({examTestcases.length})
            </button>
            <button
              className={`filter-btn ${filterCategory === 'expand' ? 'active' : ''}`}
              onClick={() => setFilterCategory('expand')}
            >
              Mở Rộng ({expandTestcases.length})
            </button>
          </div>

          <button
            className="btn-random-generate"
            onClick={onRandomGenerate}
            disabled={disabled}
            title="Sinh đề Sudoku ngẫu nhiên chuẩn 1..5 ô X"
          >
            <ShuffleIcon className="w-3.5 h-3.5" />
            <span>Sinh Ngẫu Nhiên</span>
          </button>
        </div>
      </div>

      {/* Grid: 3-4 cards / row on desktop, 2 on tablet, 1 on mobile */}
      <div className="testcase-grid">
        {displayedTestcases.map((tc, idx) => {
          const isSelected = selectedId === tc.id;
          const isExam = tc.category === 'exam';
          const displayNumber = String(idx + 1).padStart(2, '0');

          return (
            <div
              key={tc.id}
              className={`tc-card ${isSelected ? 'tc-card-selected' : ''} ${isExam ? 'tc-card-exam' : 'tc-card-expand'}`}
              onClick={() => !disabled && onSelectTestcase(tc)}
              role="button"
              tabIndex={0}
            >
              {/* Card Header: Number & Badge */}
              <div className="tc-card-top">
                <span className="tc-number font-mono">{displayNumber}</span>
                <div className="tc-badges-wrap">
                  <span className={`badge-pill ${isExam ? 'badge-pill-cyan' : 'badge-pill-purple'}`}>
                    {tc.emptyCount} ô 'X'
                  </span>
                  {isExam ? (
                    <span className="badge-pill badge-pill-emerald">≤ 5 X</span>
                  ) : (
                    <span className="badge-pill badge-pill-expand">Mở Rộng</span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="tc-card-body">
                <h4 className="tc-name">{tc.name}</h4>
                <p className="tc-desc" title={tc.description}>
                  {tc.description}
                </p>
              </div>

              {/* Card Footer: Action Indicator */}
              <div className="tc-card-footer">
                <span className="tc-status-text">
                  {isSelected ? '● Đang chọn' : 'Nạp vào bàn cờ'}
                </span>
                <span className="tc-arrow">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
