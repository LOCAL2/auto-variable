import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaPalette } from 'react-icons/fa';

const ThemeSwitcher = () => {
    const { currentTheme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const themes = [
        { id: 'default', name: 'Deep Blue', color: '#6366f1' },
        { id: 'neon', name: 'Cyberpunk', color: '#00ff9d' },
        { id: 'light', name: 'Clean Light', color: '#3b82f6' },
        { id: 'oled', name: 'OLED Black', color: '#000000' },
    ];

    return (
        <div className="theme-switcher-container">
            <button
                className="theme-toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Change Theme"
            >
                <FaPalette />
            </button>

            {isOpen && (
                <>
                    <div className="theme-menu-overlay" onClick={() => setIsOpen(false)}></div>
                    <div className="theme-menu fade-in-up">
                        {themes.map((theme) => (
                            <button
                                key={theme.id}
                                className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                                onClick={() => {
                                    setTheme(theme.id);
                                    setIsOpen(false);
                                }}
                            >
                                <span
                                    className="theme-preview-dot"
                                    style={{ background: theme.color, border: theme.id === 'light' ? '1px solid #ccc' : 'none' }}
                                ></span>
                                {theme.name}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ThemeSwitcher;
