// Khu vực nhập dữ liệu đầu vào (Input) đa phương thức:
// 1. Chọn Testcase mẫu (Chuẩn đề thi & Mở rộng)
// 2. Nhập văn bản ma trận text (hỗ trợ ký tự 'X')
// 3. Tải file .txt
// 4. Sinh đề ngẫu nhiên (Sudoku Generator)

import React, { useState } from 'react';
import { PRESET_TESTCASES } from '../data/presetTestcases';
import {
  parseInputText,
  formatBoardToText,
  generateRandomSudoku,
  validateInitialBoard,
} from '../algorithms/sudokuUtils';
import {
  SparklesIcon,
  UploadIcon,
  ShuffleIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
} from './Icons';

export function InputSection({ currentBoard, onApplyBoard, disabled = false }) {
  const [activeTab, setActiveTab] = useState('preset'); // 'preset' | 'text' | 'file' | 'generator'
  const [selectedPresetId, setSelectedPresetId] = useState('sample_exam');
  const [rawText, setRawText] = useState(formatBoardToText(currentBoard, 'X'));
  const [parseError, setParseError] = useState(null);
  const [genHoles, setGenHoles] = useState(5);

  // Xử lý nạp testcase từ Preset
  function handleSelectPreset(testcase) {
    setSelectedPresetId(testcase.id);
    setParseError(null);
    onApplyBoard(testcase.board, testcase.name);
    setRawText(formatBoardToText(testcase.board, 'X'));
  }

  // Xử lý áp dụng văn bản từ Textarea
  function handleApplyText() {
    setParseError(null);
    try {
      const { board } = parseInputText(rawText);
      const validation = validateInitialBoard(board);
      if (!validation.valid) {
        setParseError(`Dữ liệu mâu thuẫn: ${validation.errors[0]}`);
        return;
      }
      onApplyBoard(board, 'Dữ liệu nhập từ văn bản');
    } catch (err) {
      setParseError(err.message);
    }
  }

  // Xử lý tải file .txt
  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result;
        if (typeof text === 'string') {
          setRawText(text);
          const { board } = parseInputText(text);
          const validation = validateInitialBoard(board);
          if (!validation.valid) {
            setParseError(`Cảnh báo file chứa mâu thuẫn: ${validation.errors[0]}`);
          } else {
            setParseError(null);
          }
          onApplyBoard(board, `Tải từ file: ${file.name}`);
        }
      } catch (err) {
        setParseError(`Lỗi đọc file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  }

  // Xử lý sinh đề ngẫu nhiên
  function handleGenerateRandom() {
    const { board } = generateRandomSudoku(genHoles);
    onApplyBoard(board, `Sinh ngẫu nhiên (${genHoles} ô X)`);
    setRawText(formatBoardToText(board, 'X'));
    setParseError(null);
  }

  const examPresets = PRESET_TESTCASES.filter(t => t.category === 'exam');
  const expandPresets = PRESET_TESTCASES.filter(t => t.category === 'expand');

  return (
    <div className="input-panel-card">
      <div className="panel-header mb-3">
        <h3 className="panel-title flex items-center gap-2">
          <span>Dữ Liệu Đầu Vào (Input)</span>
        </h3>
        <span className="text-xs text-secondary">Hỗ trợ ký tự 'X' hoặc '0' đại diện cho ô trống</span>
      </div>

      {/* Tabs chuyển đổi hình thức nhập */}
      <div className="tab-pills-container mb-4">
        <button
          className={`tab-pill ${activeTab === 'preset' ? 'active' : ''}`}
          onClick={() => setActiveTab('preset')}
          disabled={disabled}
        >
          Bộ Testcase Mẫu ({PRESET_TESTCASES.length})
        </button>
        <button
          className={`tab-pill ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('text');
            setRawText(formatBoardToText(currentBoard, 'X'));
          }}
          disabled={disabled}
        >
          Nhập Văn Bản Ma Trận
        </button>
        <button
          className={`tab-pill ${activeTab === 'file' ? 'active' : ''}`}
          onClick={() => setActiveTab('file')}
          disabled={disabled}
        >
          Tải File .TXT
        </button>
        <button
          className={`tab-pill ${activeTab === 'generator' ? 'active' : ''}`}
          onClick={() => setActiveTab('generator')}
          disabled={disabled}
        >
          Sinh Đề Ngẫu Nhiên
        </button>
      </div>

      {/* Nội dung Tab 1: Bộ Testcase Mẫu */}
      {activeTab === 'preset' && (
        <div className="space-y-4">
          {/* Nhóm Đề thi chuẩn (<= 5 ô X) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                Nhóm 1: Chuẩn Quy Định Đề Thi (≤ 5 ô trống 'X')
              </span>
              <span className="badge badge-accent text-[11px]">Đúng format đề 100%</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {examPresets.map(tc => (
                <button
                  key={tc.id}
                  className={`testcase-card ${selectedPresetId === tc.id ? 'active' : ''}`}
                  onClick={() => handleSelectPreset(tc)}
                  disabled={disabled}
                >
                  <div className="flex justify-between items-start">
                    <span className="testcase-name font-semibold text-xs">{tc.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-secondary font-mono">
                      {tc.emptyCount} ô 'X'
                    </span>
                  </div>
                  <p className="testcase-desc text-[11px] text-secondary mt-1 line-clamp-2">
                    {tc.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Nhóm Mở rộng (Phát triển đề tài - Điểm 10) */}
          <div className="pt-2 border-t border-subtle">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple flex items-center gap-1.5">
                <SparklesIcon className="w-3.5 h-3.5" />
                Nhóm 2: Mở Rộng & Thử Thách Đánh Giá Năng Lực (Điểm 10 Sáng Tạo)
              </span>
              <span className="badge badge-purple text-[11px]">20 - 58 ô trống</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
              {expandPresets.map(tc => (
                <button
                  key={tc.id}
                  className={`testcase-card ${selectedPresetId === tc.id ? 'active' : ''}`}
                  onClick={() => handleSelectPreset(tc)}
                  disabled={disabled}
                >
                  <div className="flex justify-between items-start">
                    <span className="testcase-name font-semibold text-xs text-primary">{tc.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-purple font-mono">
                      {tc.emptyCount} ô trống
                    </span>
                  </div>
                  <p className="testcase-desc text-[11px] text-secondary mt-1">
                    {tc.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Nội dung Tab 2: Nhập Văn Bản Ma Trận */}
      {activeTab === 'text' && (
        <div className="space-y-3">
          <p className="text-xs text-secondary">
            Dán 81 số tương ứng 9 dòng x 9 cột. Dùng ký tự <code className="code-inline">X</code> hoặc <code className="code-inline">0</code> cho ô trống:
          </p>
          <textarea
            className="textarea-matrix font-mono text-xs w-full h-44 p-3 rounded-lg"
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            disabled={disabled}
            placeholder={`5 8 1 6 7 2 4 3 9\n7 9 2 8 4 3 6 5 1\n...\n4 3 8 9 5 7 2 X 6`}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-secondary text-xs"
                onClick={() => {
                  const sample = PRESET_TESTCASES.find(t => t.id === 'sample_exam');
                  if (sample) setRawText(formatBoardToText(sample.board, 'X'));
                }}
              >
                Mẫu Đề Bài (Sample)
              </button>
              <button
                className="btn btn-sm btn-secondary text-xs text-danger-hover"
                onClick={() => setRawText('')}
              >
                Xóa Trắng
              </button>
            </div>
            <button
              className="btn btn-sm btn-primary-gradient px-4 font-semibold text-xs"
              onClick={handleApplyText}
              disabled={disabled || !rawText.trim()}
            >
              Áp Dụng Ma Trận Vào Bàn Cờ
            </button>
          </div>
        </div>
      )}

      {/* Nội dung Tab 3: Upload File TXT */}
      {activeTab === 'file' && (
        <div className="p-6 border-2 border-dashed border-subtle rounded-xl text-center">
          <UploadIcon className="w-10 h-10 text-accent mx-auto mb-2 opacity-80" />
          <p className="text-sm font-medium mb-1">Kéo thả file .txt hoặc bấm để chọn từ máy tính</p>
          <p className="text-xs text-secondary mb-4">
            Định dạng ma trận 9x9 phân cách bởi dấu cách hoặc tab, ô trống dùng ký tự 'X' hoặc '0'.
          </p>
          <label className="btn btn-sm btn-primary inline-flex cursor-pointer">
            <span>Chọn File .txt</span>
            <input
              type="file"
              accept=".txt"
              className="hidden"
              onChange={handleFileUpload}
              disabled={disabled}
            />
          </label>
        </div>
      )}

      {/* Nội dung Tab 4: Sinh Đề Ngẫu Nhiên */}
      {activeTab === 'generator' && (
        <div className="space-y-4 p-4 rounded-xl bg-surface-2 border border-subtle">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-primary">
              Số lượng ô trống 'X' cần khoét: <span className="text-accent text-sm font-bold">{genHoles}</span>
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 5, 10, 20].map(h => (
                <button
                  key={h}
                  className={`btn-tag ${genHoles === h ? 'tag-active' : ''}`}
                  onClick={() => setGenHoles(h)}
                >
                  {h} {h <= 5 ? '(Chuẩn đề)' : ''}
                </button>
              ))}
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={genHoles}
            onChange={e => setGenHoles(parseInt(e.target.value, 10))}
            className="range-slider w-full"
          />
          <p className="text-[11px] text-secondary">
            * Hệ thống đảm bảo tạo ra một lời giải Sudoku 9x9 hợp lệ ngẫu nhiên rồi khoét đúng {genHoles} ô thành 'X'.
          </p>
          <button
            className="btn btn-sm btn-primary-gradient w-full py-2 font-semibold flex items-center justify-center gap-2"
            onClick={handleGenerateRandom}
            disabled={disabled}
          >
            <ShuffleIcon className="w-4 h-4" />
            Sinh Ma Trận Sudoku Mới
          </button>
        </div>
      )}

      {/* Thông báo lỗi phân tích nếu có */}
      {parseError && (
        <div className="mt-3 p-3 rounded-lg bg-danger-subtle border border-danger flex items-start gap-2 text-xs text-danger">
          <AlertTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{parseError}</span>
        </div>
      )}
    </div>
  );
}
