import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Default to 'default' (Deep Blue)
    const [currentTheme, setCurrentTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'default';
    });

    useEffect(() => {
        // Remove all theme classes
        document.body.classList.remove('theme-default', 'theme-neon', 'theme-light', 'theme-oled');
        // Add current theme class
        document.body.classList.add(`theme-${currentTheme}`);
        // Save to localStorage
        localStorage.setItem('app-theme', currentTheme);
    }, [currentTheme]);

    const setTheme = (theme) => {
        setCurrentTheme(theme);
    };

    return (
        <ThemeContext.Provider value={{ currentTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
