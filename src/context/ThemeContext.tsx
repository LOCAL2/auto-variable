import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface ThemeContextType {
    currentTheme: string;
    setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    // Default to 'default' (Deep Blue)
    const [currentTheme, setCurrentTheme] = useState<string>(() => {
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

    const setTheme = (theme: string) => {
        setCurrentTheme(theme);
    };

    return (
        <ThemeContext.Provider value={{ currentTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
