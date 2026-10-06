// Thanh chọn nhanh các tập testcase trực tiếp trên bàn cờ Sudoku
import React from 'react';
import { PRESET_TESTCASES } from '../data/presetTestcases.js';
import { SparklesIcon, ShuffleIcon } from './Icons.jsx';

export function TestcaseQuickBar({
  selectedId,
  onSelectTestcase,
  onRandomGenerate,
  disabled = false,
}) {
  return (
    <div className="testcase-quickbar-container">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
          <SparklesIcon className="w-3.5 h-3.5 text-accent" />
          <span>Chọn Tập Testcase Trực Tiếp Trên Bàn Cờ:</span>
        </span>
        <button
          className="btn-quick-random"
          onClick={onRandomGenerate}
          disabled={disabled}
          title="Sinh ma trận Sudoku ngẫu nhiên chuẩn đề thi (1..5 ô X)"
        >
          <ShuffleIcon className="w-3 h-3" />
          <span>Sinh Đề Ngẫu Nhiên</span>
        </button>
      </div>

      {/* Danh sách các nút testcase dạng pill cuộn ngang mượt mà */}
      <div className="testcase-pills-scroll">
        {PRESET_TESTCASES.map(tc => {
          const isSelected = selectedId === tc.id;
          const isExam = tc.category === 'exam';

          return (
            <button
              key={tc.id}
              className={`testcase-pill-btn ${isSelected ? 'pill-active' : ''} ${isExam ? 'pill-exam' : 'pill-expand'}`}
              onClick={() => onSelectTestcase(tc)}
              disabled={disabled}
              title={`${tc.name}: ${tc.description}`}
            >
              <span className="pill-title">{tc.shortName || tc.name}</span>
              <span className="pill-badge">{tc.emptyCount} 'X'</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
