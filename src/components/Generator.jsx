import React, { useState } from 'react';
import { compressState } from '../utils/urlState';
import { useToast } from '../context/ToastContext';
import { QRCodeCanvas } from 'qrcode.react';
import { useHistory } from '../hooks/useHistory';
import { FaHistory, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444'];

const Generator = () => {
    const [code, setCode] = useState('');
    const [variables, setVariables] = useState([{ name: '', color: COLORS[0] }]);
    const [generatedLink, setGeneratedLink] = useState('');
    const [showQRModal, setShowQRModal] = useState(false);
    const { showToast } = useToast();
    const { history, addToHistory, clearHistory, removeItem } = useHistory();

    const addVariable = () => {
        if (variables.length >= 6) {
            showToast('สูงสุด 6 ตัวแปร / Max 6 variables', 'error');
            return;
        }
        setVariables([...variables, { name: '', color: COLORS[variables.length % COLORS.length] }]);
    };

    const removeVariable = (index) => {
        if (variables.length === 1) return;
        const newVars = variables.filter((_, i) => i !== index);
        setVariables(newVars);
    };

    const updateVariable = (index, value) => {
        const newVars = [...variables];
        newVars[index].name = value;
        setVariables(newVars);
    };

    const handleGenerate = async () => {
        const validVariables = variables.filter(v => v.name.trim() !== '');

        if (!code || validVariables.length === 0) {
            showToast('กรุณากรอกโค้ดและอย่างน้อย 1 ตัวแปร / Please enter code and at least 1 variable', 'error');
            return;
        }

        try {
            const state = { code, variables: validVariables };
            const hash = await compressState(state);
            const link = `${window.location.origin}/#${hash}`;
            setGeneratedLink(link);

            const varLabel = validVariables.map(v => v.name).join(', ');
            addToHistory(link, code, varLabel);

            showToast('สร้างลิงก์เรียบร้อยแล้ว / Link generated!', 'success');
        } catch (error) {
            console.error("Generation error:", error);
            showToast('เกิดข้อผิดพลาดในการสร้างลิงก์ / Error generating link', 'error');
        }
    };

    const handleCopy = () => {
        if (!generatedLink) return;
        navigator.clipboard.writeText(generatedLink).then(() => {
            showToast('คัดลอกลิงก์แล้ว / Link copied!', 'success');
        });
    };

    const handleFocus = (e) => e.target.select();

    return (
        <div className="glass-card fade-in">
            <h1>Variable Replacer</h1>
            <p>สร้างลิงก์สำหรับแชร์โค้ดที่สามารถแก้ไขตัวแปรได้ <br></br> (Create shareable code templates)</p>

            <div className="input-group">
                <label>Code Snippet (โค้ดของคุณ)</label>
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="วางโค้ดที่นี่... (Paste your code here)"
                    rows={6}
                />
            </div>

            <div className="input-group">
                <label>Target Variables (ตัวแปรที่ต้องการให้เปลี่ยน)</label>
                <div className="variables-list">
                    {variables.map((variable, index) => (
                        <div key={index} className="variable-row fade-in">
                            <div className="color-dot" style={{ background: variable.color }}></div>
                            <input
                                type="text"
                                value={variable.name}
                                onChange={(e) => updateVariable(index, e.target.value)}
                                placeholder={`Variable ${index + 1} (e.g. api_key)`}
                                style={{ borderColor: variable.color }}
                            />
                            {variables.length > 1 && (
                                <button className="remove-var-btn" onClick={() => removeVariable(index)}>
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button className="add-var-btn" onClick={addVariable}>
                    <FaPlus /> เพิ่มตัวแปร (Add Variable)
                </button>
            </div>

            <button className="btn-primary" onClick={handleGenerate}>
                สร้างลิงก์และคัดลอก (Generate Link)
            </button>

            {generatedLink && (
                <div className="result-container fade-in">
                    <div className="input-group">
                        <label>Shareable Secure Link</label>
                        <input
                            type="text"
                            value={generatedLink}
                            readOnly
                            onClick={handleFocus}
                            className="generated-input"
                        />
                    </div>

                    <div className="action-row">
                        <button className="btn-secondary" onClick={handleCopy}>
                            คัดลอกลิงก์ (Copy Link)
                        </button>
                        <a href={generatedLink} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
                            เปิดลิงก์ (Open)
                        </a>
                    </div>

                    <div className="qr-container">
                        <div className="qr-wrapper" onClick={() => setShowQRModal(true)} style={{ cursor: 'pointer' }}>
                            <QRCodeCanvas
                                value={generatedLink}
                                size={200}
                                bgColor={"#ffffff"}
                                fgColor={"#000000"}
                                level={"M"}
                                includeMargin={true}
                                style={{ borderRadius: '12px' }}
                            />
                        </div>
                        <p className="qr-label">คลิกเพื่อดูขนาดใหญ่ (Click to enlarge)</p>
                    </div>
                </div>
            )}

            {history.length > 0 && (
                <div className="history-section fade-in">
                    <div className="history-header">
                        <h3><FaHistory style={{ marginRight: '8px' }} /> Recent Links</h3>
                        <button onClick={clearHistory} className="clear-history-btn" title="Clear History">
                            <FaTrash />
                        </button>
                    </div>
                    <div className="history-list">
                        {history.map((item) => (
                            <div key={item.id} className="history-item">
                                <div className="history-info">
                                    <span className="history-var">{item.targetVar}</span>
                                    <span className="history-preview">{item.preview}</span>
                                </div>
                                <div className="history-actions">
                                    <a href={item.link} target="_blank" rel="noreferrer" className="history-link-btn">
                                        Open
                                    </a>
                                    <button onClick={() => removeItem(item.id)} className="history-delete-btn" title="Delete">
                                        <FaTimes />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showQRModal && (
                <>
                    <div className="qr-modal-overlay" onClick={() => setShowQRModal(false)}></div>
                    <div className="qr-modal">
                        <button className="qr-modal-close" onClick={() => setShowQRModal(false)}>
                            <FaTimes />
                        </button>
                        <h3>QR Code</h3>
                        <div className="qr-modal-content">
                            <QRCodeCanvas
                                value={generatedLink}
                                size={400}
                                bgColor={"#ffffff"}
                                fgColor={"#000000"}
                                level={"H"}
                                includeMargin={true}
                                style={{ borderRadius: '16px' }}
                            />
                        </div>
                        <p className="qr-modal-label">สแกนเพื่อเปิดลิงก์บนมือถือ</p>
                    </div>
                </>
            )}
        </div>
    );
};

export default Generator;
