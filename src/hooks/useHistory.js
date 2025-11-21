import { useState, useEffect } from 'react';

export const useHistory = () => {
    const [history, setHistory] = useState([]);

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

    const addToHistory = (link, codeSnippet, targetVar) => {
        const newItem = {
            id: Date.now(),
            link,
            preview: codeSnippet.substring(0, 50) + (codeSnippet.length > 50 ? '...' : ''),
            targetVar,
            timestamp: new Date().toISOString()
        };

        const updatedHistory = [newItem, ...history].slice(0, 5); // Keep last 5
        setHistory(updatedHistory);
        localStorage.setItem('link_history', JSON.stringify(updatedHistory));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('link_history');
    };

    const removeItem = (id) => {
        const updatedHistory = history.filter(item => item.id !== id);
        setHistory(updatedHistory);
        localStorage.setItem('link_history', JSON.stringify(updatedHistory));
    };

    return { history, addToHistory, clearHistory, removeItem };
};
