import React, { useState } from 'react';
import { compressState } from '../utils/urlState';
import { useToast } from '../context/ToastContext';
import { QRCodeCanvas } from 'qrcode.react';
import { useHistory } from '../hooks/useHistory';
import { FaHistory, FaPlus, FaTimes, FaFile, FaLink, FaExternalLinkAlt, FaCopy, FaQrcode } from 'react-icons/fa';
import FileUploader from './FileUploader';

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444'];

interface Variable {
    name: string;
    color: string;
}

const Generator = () => {
    const [code, setCode] = useState<string>('');
    const [variables, setVariables] = useState<Variable[]>([{ name: '', color: COLORS[0] }]);
    const [filename, setFilename] = useState<string>('');
    const [generatedLink, setGeneratedLink] = useState<string>('');
    const [showQRModal, setShowQRModal] = useState<boolean>(false);
    const { showToast } = useToast();
    const { history, addToHistory } = useHistory();

    const addVariable = () => {
        if (variables.length >= 6) {
            showToast('สูงสุด 6 ตัวแปร / Max 6 variables', 'error');
            return;
        }
        setVariables([...variables, { name: '', color: COLORS[variables.length % COLORS.length] }]);
    };

    const removeVariable = (index: number) => {
        if (variables.length === 1) return;
        const newVars = variables.filter((_, i) => i !== index);
        setVariables(newVars);
    };

    const updateVariable = (index: number, value: string) => {
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
            showToast('กำลังสร้างลิงก์... / Creating link...', 'info');
            
            const state = { code, variables: validVariables, filename };
            
            // Try Gist first (short URL), fallback to hash
            let link = '';
            let usedFallback = false;
            
            try {
                const { createGist } = await import('../utils/gistService');
                
                // Add timeout to prevent long waiting
                const gistPromise = createGist(state);
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), 5000)
                );
                
                const gistId = await Promise.race([gistPromise, timeoutPromise]) as string;
                link = `${window.location.origin}/${gistId}`;
            } catch (gistError) {
                console.log('Gist failed, using hash fallback:', gistError);
                usedFallback = true;
                const hash = await compressState(state);
                link = `${window.location.origin}/#${hash}`;
            }
            
            setGeneratedLink(link);

            const varLabel = validVariables.map(v => v.name).join(', ');
            addToHistory(link, code, varLabel);

            if (usedFallback) {
                showToast('สร้างลิงก์สำเร็จ (ใช้ระบบสำรอง) / Link created (fallback mode)', 'success');
            } else {
                showToast('สร้างลิงก์เรียบร้อยแล้ว / Link generated!', 'success');
            }
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

    const handleFocus = (e: React.MouseEvent<HTMLInputElement>) => (e.target as HTMLInputElement).select();

    return (
        <div className="glass-card fade-in">
            <h1>Variable Replacer</h1>
            <p>สร้างลิงก์สำหรับแชร์โค้ดที่สามารถแก้ไขตัวแปรได้ <br></br> (Create shareable code templates)</p>

            <div className="generator-grid">
                {/* Left Column: Code Input */}
                <div className="generator-section">
                    <div className="input-group">
                        <label>Code Snippet (โค้ดของคุณ)</label>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="วางโค้ดที่นี่... (Paste your code here)"
                            rows={12}
                        />
                    </div>

                    <div className="input-group">
                        <label>Filename (ชื่อไฟล์ - ไม่บังคับ)</label>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            background: 'rgba(99, 102, 241, 0.05)',
                            borderRadius: '8px',
                            border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}>
                            <FaFile style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', flexShrink: 0 }} />
                            <input
                                type="text"
                                value={filename}
                                onChange={(e) => setFilename(e.target.value)}
                                placeholder="example.js (optional)"
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            />
                            {filename && (
                                <button
                                    onClick={() => setFilename('')}
                                    style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#ef4444',
                                        border: 'none',
                                        borderRadius: '6px',
                                        width: '28px',
                                        height: '28px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        flexShrink: 0
                                    }}
                                    title="Clear filename"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Upload File (อัปโหลดไฟล์)</label>
                        <FileUploader
                            onFileSelect={(file) => {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                    const content = ev.target?.result as string;
                                    setCode(content);
                                    setFilename(file.name);
                                    showToast(`Uploaded ${file.name}`, 'success');
                                };
                                reader.readAsText(file);
                            }}
                            maxSizeKB={15}
                        />
                    </div>


                </div>

                {/* Right Column: Variables & Settings */}
                <div className="generator-section">
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
                        <FaLink style={{ marginRight: '0.5rem' }} />
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
                                    <FaCopy style={{ marginRight: '0.5rem' }} />
                                    คัดลอกลิงก์ (Copy Link)
                                </button>
                                <a href={generatedLink} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FaExternalLinkAlt style={{ marginRight: '0.5rem' }} />
                                    เปิดลิงก์ (Open)
                                </a>
                            </div>

                            <div className="qr-container">
                                <div className="qr-wrapper" onClick={() => setShowQRModal(true)} style={{ cursor: 'pointer' }}>
                                    <QRCodeCanvas
                                        value={generatedLink}
                                        size={Math.min(200, window.innerWidth - 100)}
                                        bgColor={"#ffffff"}
                                        fgColor={"#000000"}
                                        level={"M"}
                                        includeMargin={true}
                                        style={{ borderRadius: '12px', maxWidth: '100%', height: 'auto' }}
                                    />
                                </div>
                                <p className="qr-label">คลิกเพื่อดูขนาดใหญ่ (Click to enlarge)</p>
                            </div>
                        </div>
                    )}

                    {history.length > 0 && (
                        <button 
                            className="btn-history"
                            onClick={() => window.location.href = '/history'}
                        >
                            <FaHistory style={{ marginRight: '0.5rem' }} />
                            ดูประวัติลิงก์ ({history.length})
                        </button>
                    )}

                    {showQRModal && (
                        <>
                            <div className="qr-modal-overlay" onClick={() => setShowQRModal(false)}></div>
                            <div className="qr-modal">
                                <button className="qr-modal-close" onClick={() => setShowQRModal(false)}>
                                    <FaTimes />
                                </button>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaQrcode /> QR Code
                                </h3>
                                <div className="qr-modal-content">
                                    <QRCodeCanvas
                                        value={generatedLink}
                                        size={Math.min(400, window.innerWidth - 120)}
                                        bgColor={"#ffffff"}
                                        fgColor={"#000000"}
                                        level={"H"}
                                        includeMargin={true}
                                        style={{ borderRadius: '16px', maxWidth: '100%', height: 'auto' }}
                                    />
                                </div>
                                <p className="qr-modal-label">สแกนเพื่อเปิดลิงก์บนมือถือ</p>
                            </div>
                        </>
                    )}


                </div>
            </div>
        </div>
    );
};

export default Generator;
