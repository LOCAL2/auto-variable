import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { detectLanguage } from '../utils/languageDetector';

const Receiver = ({ initialCode, targetVar, variables }) => {
    const initialVars = variables || (targetVar ? [{ name: targetVar, color: '#6366f1' }] : []);

    const [inputValues, setInputValues] = useState({});
    const [displayCode, setDisplayCode] = useState(initialCode);
    const { showToast } = useToast();
    const [language, setLanguage] = useState({ name: 'Text', lang: 'text', icon: null });

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

    const handleInputChange = (name, value) => {
        setInputValues(prev => ({ ...prev, [name]: value }));
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(displayCode).then(() => {
            showToast('คัดลอกโค้ดเรียบร้อยแล้ว / Code copied!', 'success');
        });
    };

    // Render code with highlighted variables
    const renderHighlightedCode = () => {
        let parts = [{ text: displayCode, isHighlight: false, color: null }];

        // Split code by each variable value
        initialVars.forEach(variable => {
            const val = inputValues[variable.name];
            if (val) {
                const newParts = [];
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
                            color: part.color,
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
            <h1>Code Customizer</h1>
            <p>กรอกชื่อตัวแปรของคุณเพื่ออัปเดตโค้ดด้านล่าง</p>

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
                                autoFocus={index === 0}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="code-preview fade-in">
                <div className="code-header">
                    <span>Live Preview</span>
                    <span className="lang-badge">
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

            <div className="input-group fade-in" style={{ marginTop: '1.5rem', opacity: 0.8 }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Data Hash / ID</label>
                <div className="secure-hash" style={{ fontSize: '0.75rem', padding: '0.5rem', marginTop: '0.25rem' }}>
                    {window.location.hash.substring(1, 20)}...
                </div>
            </div>

            <button className="btn-primary" onClick={handleCopy} style={{ marginTop: '1rem' }}>
                คัดลอกโค้ด (Copy Code)
            </button>
        </div>
    );
};

export default Receiver;
