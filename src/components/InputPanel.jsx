import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Download,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  FolderOpen,
} from './Icons';
import { PRESET_TESTCASES } from '../data/presetTestcases';
import { generateTreeTopology } from '../algorithms/treeUtils';

export function InputPanel({
  rawInput,
  onInputChange,
  parseResult,
  onLoadPreset,
  selectedPresetId,
}) {
  const [showGenerator, setShowGenerator] = useState(false);
  const [genType, setGenType] = useState('random');
  const [genN, setGenN] = useState(15);
  const [genQ, setGenQ] = useState(8);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        onInputChange(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    const blob = new Blob([rawInput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nguoi_giao_com_input.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerate = () => {
    const generated = generateTreeTopology(genType, genN, genQ);
    onInputChange(generated.inputStr);
    setShowGenerator(false);
  };

  return (
    <div className="input-panel-card">
      <div className="panel-header">
        <div className="title-with-badge">
          <FileText size={18} className="panel-icon" />
          <h3 className="panel-title">Dữ Liệu Đầu Vào (Input)</h3>
        </div>

        <div className="panel-actions">
          <button
            className="btn-secondary"
            onClick={() => setShowGenerator(!showGenerator)}
            title="Tự động sinh testcase theo tham số"
          >
            <Sparkles size={15} />
            <span>Sinh Test</span>
          </button>

          <label className="btn-secondary file-upload-label" title="Tải file testcase .txt">
            <Upload size={15} />
            <span>Nạp file</span>
            <input type="file" accept=".txt" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <button className="btn-secondary" onClick={handleDownload} title="Tải file input.txt về máy">
            <Download size={15} />
            <span>Lưu file</span>
          </button>
        </div>
      </div>

      {/* Preset Testcases Bar */}
      <div className="presets-section">
        <span className="presets-label">Test mẫu:</span>
        <div className="presets-list">
          {PRESET_TESTCASES.map((preset) => (
            <button
              key={preset.id}
              className={`preset-pill ${selectedPresetId === preset.id ? 'active' : ''}`}
              onClick={() => onLoadPreset(preset)}
              title={preset.description}
            >
              <span className="preset-name">{preset.title.split(':')[1] || preset.title}</span>
              <span className="preset-badge">{preset.badge}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Random Testcase Generator Modal / Drawer */}
      {showGenerator && (
        <div className="generator-box">
          <div className="gen-header">
            <h4>
              <Sparkles size={16} /> Bộ Sinh Testcase Đa Dạng
            </h4>
            <button className="close-btn" onClick={() => setShowGenerator(false)}>
              ×
            </button>
          </div>
          <div className="gen-body">
            <div className="gen-field">
              <label>Dạng cấu trúc cây:</label>
              <select value={genType} onChange={(e) => setGenType(e.target.value)}>
                <option value="random">Cây ngẫu nhiên (Random Tree)</option>
                <option value="line">Cây đường thẳng / Dây xích (Bamboo)</option>
                <option value="star">Cây hình sao (Star Graph - Hub)</option>
                <option value="binary">Cây nhị phân đầy đủ (Binary Tree)</option>
                <option value="caterpillar">Cây sâu róm (Caterpillar Tree)</option>
              </select>
            </div>
            <div className="gen-row">
              <div className="gen-field half">
                <label>Số căn hộ (N):</label>
                <input
                  type="number"
                  min="2"
                  max="100000"
                  value={genN}
                  onChange={(e) => setGenN(Math.max(2, parseInt(e.target.value) || 2))}
                />
              </div>
              <div className="gen-field half">
                <label>Số truy vấn (Q):</label>
                <input
                  type="number"
                  min="1"
                  max="50000"
                  value={genQ}
                  onChange={(e) => setGenQ(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
            </div>
          </div>
          <div className="gen-footer">
            <button className="btn-primary" onClick={handleGenerate}>
              <RefreshCw size={14} /> Tạo Testcase Ngay
            </button>
          </div>
        </div>
      )}

      {/* Input Textarea */}
      <div className="textarea-wrapper">
        <textarea
          className="input-textarea"
          rows={8}
          value={rawInput}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Nhập theo định dạng:&#10;n q&#10;cạnh 1: u v&#10;...&#10;truy vấn 1: a b"
          spellCheck={false}
        />
      </div>

      {/* Live Validation Bar */}
      <div className={`validation-status ${parseResult?.success ? 'valid' : 'invalid'}`}>
        {parseResult?.success ? (
          <div className="status-msg">
            <CheckCircle2 size={16} className="status-icon" />
            <span>
              Hợp lệ: <strong>{parseResult.n}</strong> căn hộ, <strong>{parseResult.q}</strong> truy
              vấn. Đồ thị là CÂY liên thông không chu trình.
            </span>
          </div>
        ) : (
          <div className="status-msg">
            <AlertCircle size={16} className="status-icon error" />
            <span>{parseResult?.error || 'Đang phân tích cú pháp dữ liệu...'}</span>
          </div>
        )}
      </div>
    </div>
  );
}
