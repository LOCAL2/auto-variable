import { useState, useEffect } from 'react';

export interface HistoryItem {
    id: number;
    link: string;
    preview: string;
    targetVar: string;
    timestamp: string;
}

export const useHistory = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('link_history');
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    const addToHistory = (link: string, codeSnippet: string, targetVar: string) => {
        const newItem: HistoryItem = {
            id: Date.now(),
            link,
            preview: codeSnippet.substring(0, 50) + (codeSnippet.length > 50 ? '...' : ''),
            targetVar,
            timestamp: new Date().toISOString()
        };

        const updatedHistory = [newItem, ...history].slice(0, 100); // Keep last 100
        setHistory(updatedHistory);
        localStorage.setItem('link_history', JSON.stringify(updatedHistory));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('link_history');
    };

    const removeItem = (id: number) => {
        const updatedHistory = history.filter(item => item.id !== id);
        setHistory(updatedHistory);
        localStorage.setItem('link_history', JSON.stringify(updatedHistory));
    };

    return { history, addToHistory, clearHistory, removeItem };
};
