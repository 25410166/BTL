import React, { useState } from 'react';
import {
  parseInputText,
  formatBoardToText,
  generateRandomSudoku,
  validateInitialBoard,
} from '../algorithms/sudokuUtils.js';
import { PRESET_TESTCASES } from '../data/presetTestcases.js';
import {
  UploadIcon,
  ShuffleIcon,
  AlertTriangleIcon,
} from './Icons.jsx';

export function InputPanel({ currentBoard, onApplyBoard, disabled = false }) {
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'file' | 'random'
  const [rawText, setRawText] = useState(() => formatBoardToText(currentBoard, 'X'));
  const [parseError, setParseError] = useState(null);
  const [genHoles, setGenHoles] = useState(5);

  function handleApplyText() {
    setParseError(null);
    try {
      const { board } = parseInputText(rawText);
      const validation = validateInitialBoard(board);
      if (!validation.valid) {
        setParseError(`Dữ liệu mâu thuẫn: ${validation.errors[0]}`);
        return;
      }
      onApplyBoard(board, 'Ma trận nhập từ văn bản');
    } catch (err) {
      setParseError(err.message);
    }
  }

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

  function handleGenerateRandom() {
    const { board } = generateRandomSudoku(genHoles);
    onApplyBoard(board, `Sinh ngẫu nhiên (${genHoles} ô X)`);
    setRawText(formatBoardToText(board, 'X'));
    setParseError(null);
  }

  return (
    <div className="input-tools-panel">
      {/* Header Bar */}
      <div className="section-header-bar">
        <div className="section-header-left">
          <span className="section-title">Công Cụ Tùy Biến Input</span>
          <span className="section-subtitle">
            Nhập ma trận văn bản (hỗ trợ ký tự 'X' hoặc '0'), tải file .txt hoặc tùy chỉnh sinh đề
          </span>
        </div>

        {/* Segmented Toolbar Tabs */}
        <div className="input-nav-tabs">
          <button
            className={`input-tab-btn ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('text');
              setRawText(formatBoardToText(currentBoard, 'X'));
            }}
            disabled={disabled}
          >
            Nhập Ma Trận Text
          </button>
          <button
            className={`input-tab-btn ${activeTab === 'file' ? 'active' : ''}`}
            onClick={() => setActiveTab('file')}
            disabled={disabled}
          >
            Tải File .TXT
          </button>
          <button
            className={`input-tab-btn ${activeTab === 'random' ? 'active' : ''}`}
            onClick={() => setActiveTab('random')}
            disabled={disabled}
          >
            Sinh Đề Ngẫu Nhiên
          </button>
        </div>
      </div>

      {/* Tab 1: Text Matrix */}
      {activeTab === 'text' && (
        <div className="input-body-box space-y-2">
          <p className="input-hint">
            Dán 81 số ma trận 9×9 phân tách bởi dấu cách hoặc tab. Các ô trống dùng ký tự <code className="code-tag">X</code> hoặc <code className="code-tag">0</code>:
          </p>
          <textarea
            className="matrix-textarea font-mono"
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            disabled={disabled}
            rows={8}
            placeholder={`5 8 1 6 7 2 4 3 9\n7 9 2 8 4 3 6 5 1\n4 3 8 9 5 7 2 X 6...`}
          />
          <div className="matrix-actions-bar">
            <div className="flex gap-2">
              <button
                className="btn-text-action"
                onClick={() => {
                  const sample = PRESET_TESTCASES[0];
                  setRawText(formatBoardToText(sample.board, 'X'));
                }}
              >
                Mẫu Đề Bài (Sample)
              </button>
              <button
                className="btn-text-action text-danger"
                onClick={() => setRawText('')}
              >
                Xóa Trắng
              </button>
            </div>

            <button
              className="btn-apply-primary"
              onClick={handleApplyText}
              disabled={disabled || !rawText.trim()}
            >
              Áp Dụng Ma Trận Vào Bàn Cờ
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Upload File */}
      {activeTab === 'file' && (
        <div className="input-body-box">
          <div className="file-drop-zone">
            <UploadIcon className="w-6 h-6 text-accent mx-auto mb-1.5 opacity-80" />
            <p className="text-xs font-semibold text-primary mb-1">
              Chọn hoặc kéo thả file .txt chứa ma trận Sudoku 9×9
            </p>
            <p className="text-[11px] text-secondary mb-3">
              Quy cách: 81 số phân cách bằng dấu cách, ô trống là ký tự 'X' hoặc '0'.
            </p>
            <label className="btn-file-select cursor-pointer">
              <span>Chọn File Từ Máy Tính</span>
              <input
                type="file"
                accept=".txt"
                className="hidden"
                onChange={handleFileUpload}
                disabled={disabled}
              />
            </label>
          </div>
        </div>
      )}

      {/* Tab 3: Random Generator */}
      {activeTab === 'random' && (
        <div className="input-body-box">
          <div className="random-gen-card">
            <div className="random-slider-row">
              <span className="text-xs text-primary font-medium">
                Số lượng ô trống 'X' cần khoét: <strong className="text-accent font-mono text-sm">{genHoles}</strong>
              </span>
              <div className="holes-quick-pills">
                {[1, 2, 3, 5, 10, 20].map(h => (
                  <button
                    key={h}
                    className={`btn-hole-pill ${genHoles === h ? 'active' : ''}`}
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
              className="random-range-slider"
            />

            <button
              className="btn-generate-action"
              onClick={handleGenerateRandom}
              disabled={disabled}
            >
              <ShuffleIcon className="w-3.5 h-3.5" />
              <span>Sinh Ma Trận Sudoku Hợp Lệ Mới</span>
            </button>
          </div>
        </div>
      )}

      {/* Error alert */}
      {parseError && (
        <div className="input-error-alert">
          <AlertTriangleIcon className="w-4 h-4 flex-shrink-0" />
          <span>{parseError}</span>
        </div>
      )}
    </div>
  );
}
