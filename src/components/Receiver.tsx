import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { detectLanguage } from '../utils/languageDetector';

interface Variable {
    name: string;
    color: string;
}

interface ReceiverProps {
    initialCode: string;
    targetVar?: string;
    variables?: Variable[];
    filename?: string;
}

interface Language {
    name: string;
    lang: string;
    icon: React.ElementType | null;
    color?: string;
}

const Receiver = ({ initialCode, targetVar, variables, filename }: ReceiverProps) => {
    const initialVars = variables || (targetVar ? [{ name: targetVar, color: '#6366f1' }] : []);

    const [inputValues, setInputValues] = useState<Record<string, string>>({});
    const [displayCode, setDisplayCode] = useState<string>(initialCode);
    const [editableFilename, setEditableFilename] = useState<string>(filename || 'code.txt');
    const { showToast } = useToast();
    const [language, setLanguage] = useState<Language>({ name: 'Text', lang: 'text', icon: null });

    useEffect(() => {
        setLanguage(detectLanguage(initialCode));
    }, [initialCode]);



    useEffect(() => {
        let updatedCode = initialCode;

        initialVars.forEach(variable => {
            const val = inputValues[variable.name] || '';
            if (val) {
                const escapedTarget = variable.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escapedTarget, 'g');
                updatedCode = updatedCode.replace(regex, val);
            }
        });

        setDisplayCode(updatedCode);
    }, [inputValues, initialCode, initialVars]);

    const handleInputChange = (name: string, value: string) => {
        setInputValues(prev => ({ ...prev, [name]: value }));
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(displayCode).then(() => {
            showToast('คัดลอกโค้ดเรียบร้อยแล้ว / Code copied!', 'success');
        });
    };

    // Render code with highlighted variables
    const renderHighlightedCode = () => {
        let parts = [{ text: displayCode, isHighlight: false, color: null as string | null }];

        // Split code by each variable value
        initialVars.forEach(variable => {
            const val = inputValues[variable.name];
            if (val) {
                const newParts: typeof parts = [];
                parts.forEach(part => {
                    if (part.isHighlight) {
                        newParts.push(part);
                    } else {
                        const segments = part.text.split(val);
                        segments.forEach((segment, idx) => {
                            if (segment) {
                                newParts.push({ text: segment, isHighlight: false, color: null });
                            }
                            if (idx < segments.length - 1) {
                                newParts.push({ text: val, isHighlight: true, color: variable.color });
                            }
                        });
                    }
                });
                parts = newParts;
            }
        });

        return parts.map((part, idx) => {
            if (part.isHighlight) {
                return (
                    <mark
                        key={idx}
                        style={{
                            background: `${part.color}33`,
                            color: part.color || undefined,
                            fontWeight: 600,
                            padding: '2px 4px',
                            borderRadius: '4px',
                            border: `1px solid ${part.color}66`
                        }}
                    >
                        {part.text}
                    </mark>
                );
            }
            return <span key={idx}>{part.text}</span>;
        });
    };

    const Icon = language.icon;
    const hasInputValues = Object.keys(inputValues).some(key => inputValues[key]);

    return (
        <div className="glass-card fade-in">
            <button 
                className="back-to-home-btn"
                onClick={() => {
                    window.location.href = window.location.origin;
                }}
                title="Back to Home"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>กลับหน้าแรก</span>
            </button>

            <div className="receiver-header">
                <div>
                    <h1>Code Customizer</h1>
                    <p>กรอกชื่อตัวแปรของคุณเพื่ออัปเดตโค้ดด้านล่าง</p>
                </div>
            </div>

            <div className="receiver-grid">
                {/* Left: Variables Input */}
                <div className="receiver-section" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="input-group">
                        <label>Variables (ตัวแปร)</label>
                        <div className="variables-list">
                            {initialVars.map((variable, index) => (
                                <div key={index} className="variable-row">
                                    <div className="color-dot" style={{ background: variable.color }}></div>
                                    <input
                                        type="text"
                                        value={inputValues[variable.name] || ''}
                                        onChange={(e) => handleInputChange(variable.name, e.target.value)}
                                        placeholder={`แทนที่ '${variable.name}' ด้วย...`}
                                        style={{ borderColor: variable.color }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Filename (ชื่อไฟล์สำหรับดาวน์โหลด)</label>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            background: 'rgba(99, 102, 241, 0.05)',
                            borderRadius: '8px',
                            border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-primary)', flexShrink: 0 }}>
                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                <polyline points="13 2 13 9 20 9"></polyline>
                            </svg>
                            <input
                                type="text"
                                value={editableFilename}
                                onChange={(e) => setEditableFilename(e.target.value)}
                                placeholder="filename.txt"
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    fontFamily: 'var(--font-mono)'
                                }}
                            />
                        </div>
                    </div>

                    <div className="action-row">
                        <button className="btn-primary" onClick={handleCopy}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            <span>คัดลอกโค้ด</span>
                        </button>
                        <button
                            className="btn-download"
                            onClick={() => {
                                const blob = new Blob([displayCode], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = editableFilename;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                                showToast(`Downloaded ${editableFilename}`, 'success');
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            <span>ดาวน์โหลดไฟล์</span>
                        </button>
                    </div>

                    <div style={{ flex: 1 }}></div>

                    <div className="input-group fade-in" style={{ marginTop: 'auto' }}>
                        <label style={{ 
                            fontSize: '0.85rem', 
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.5rem'
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            Secure Link Identifier
                        </label>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1rem',
                            background: 'rgba(99, 102, 241, 0.08)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            borderRadius: '8px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.85rem',
                            color: 'var(--accent-primary)',
                            fontWeight: 600,
                            letterSpacing: '0.5px'
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.7 }}>
                                <polyline points="16 18 22 12 16 6"></polyline>
                                <polyline points="8 6 2 12 8 18"></polyline>
                            </svg>
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {(() => {
                                    const path = window.location.pathname;
                                    const hash = window.location.hash;
                                    
                                    // If using Gist (path-based)
                                    if (path && path.length > 1 && path !== '/') {
                                        const pathValue = path.substring(1);
                                        // Format: data/abc123 -> VR-ABC-123
                                        if (pathValue.startsWith('data/')) {
                                            const code = pathValue.substring(5).toUpperCase();
                                            // Split into chunks for better readability: VR-ABC-123
                                            const formatted = code.match(/.{1,3}/g)?.join('-') || code;
                                            return `VR-${formatted}`;
                                        }
                                        // Format long gist: abc123def456 -> ABC-123-DEF-456
                                        const upper = pathValue.toUpperCase();
                                        if (upper.length > 10) {
                                            const formatted = upper.match(/.{1,3}/g)?.join('-') || upper;
                                            return `GIST-${formatted}`;
                                        }
                                        return `#${upper}`;
                                    }
                                    
                                    // If using hash-based
                                    if (hash && hash.length > 1) {
                                        const hashValue = hash.substring(1);
                                        return hashValue.length > 30 ? `HASH-${hashValue.substring(0, 12).toUpperCase()}...` : `HASH-${hashValue.toUpperCase()}`;
                                    }
                                    
                                    return 'N/A';
                                })()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Code Preview */}
                <div className="receiver-section">
                    <div className="code-preview fade-in">
                        <div className="code-header">
                            <div className="code-header-left">
                                <span className="code-header-title">Live Preview</span>
                                {filename && (
                                    <div className="code-filename-wrapper">
                                        <span className="code-filename">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                <polyline points="14 2 14 8 20 8"></polyline>
                                            </svg>
                                            <span className="filename-text">{filename}</span>
                                        </span>
                                        <button
                                            className="copy-filename-btn"
                                            onClick={() => {
                                                navigator.clipboard.writeText(filename);
                                                showToast(`คัดลอก "${filename}" แล้ว / Copied filename!`, 'success');
                                            }}
                                            title="Copy filename"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <span 
                                className="lang-badge"
                                style={{
                                    backgroundColor: language.color ? `${language.color}20` : undefined,
                                    borderColor: language.color ? `${language.color}40` : undefined,
                                    color: language.color || undefined
                                }}
                            >
                                {Icon && <Icon style={{ marginRight: '6px' }} />}
                                {language.name}
                            </span>
                        </div>
                        <div className="syntax-highlighter-wrapper">
                            {hasInputValues ? (
                                <pre style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.6',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    margin: 0,
                                    padding: 0
                                }}>
                                    {renderHighlightedCode()}
                                </pre>
                            ) : (
                                <SyntaxHighlighter
                                    language={language.lang}
                                    style={vscDarkPlus}
                                    customStyle={{
                                        background: 'transparent',
                                        padding: 0,
                                        margin: 0,
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6',
                                    }}
                                    wrapLines={true}
                                    wrapLongLines={true}
                                >
                                    {displayCode}
                                </SyntaxHighlighter>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Receiver;
