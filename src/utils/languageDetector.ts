import { FaPython, FaJs, FaHtml5, FaCss3, FaJava, FaCode } from 'react-icons/fa';
import { SiTypescript, SiCplusplus } from 'react-icons/si';
import type { IconType } from 'react-icons';

export interface Language {
    name: string;
    lang: string;
    icon: IconType | null;
    color?: string;
    regex?: RegExp;
}

export const detectLanguage = (code: string): Language => {
    if (!code) return { name: 'Text', lang: 'text', icon: null };

    const patterns: Language[] = [
        { name: 'Python', lang: 'python', icon: FaPython, color: '#3776AB', regex: /\b(def|import|from|class|if __name__|print\(|input\(|for .+ in |range\(|elif|:\s*$)/m },
        { name: 'JavaScript', lang: 'javascript', icon: FaJs, color: '#F7DF1E', regex: /\b(const|let|var|function|=>|import|export|console\.log)\b/ },
        { name: 'TypeScript', lang: 'typescript', icon: SiTypescript, color: '#3178C6', regex: /\b(interface|type|namespace|enum|implements|as |: (string|number|boolean))\b/ },
        { name: 'HTML', lang: 'html', icon: FaHtml5, color: '#E34F26', regex: /<\/?[a-z][\s\S]*>/i },
        { name: 'CSS', lang: 'css', icon: FaCss3, color: '#1572B6', regex: /\{[\s\S]*?\}|@media|@import/ },
        { name: 'Java', lang: 'java', icon: FaJava, color: '#007396', regex: /\b(public class|void main|System\.out\.println)\b/ },
        { name: 'C++', lang: 'cpp', icon: SiCplusplus, color: '#00599C', regex: /\b(#include|std::|cout|cin)\b/ },
        { name: 'C#', lang: 'csharp', icon: FaCode, color: '#239120', regex: /\b(using System|namespace|Console\.WriteLine)\b/ },
        { name: 'Go', lang: 'go', icon: FaCode, color: '#00ADD8', regex: /\b(package main|func main|fmt\.Println)\b/ },
        { name: 'Rust', lang: 'rust', icon: FaCode, color: '#CE422B', regex: /\b(fn main|println!|let mut|impl)\b/ },
        { name: 'PHP', lang: 'php', icon: FaCode, color: '#777BB4', regex: /\b(<\?php|\$this|echo)\b/ },
        { name: 'Ruby', lang: 'ruby', icon: FaCode, color: '#CC342D', regex: /\b(def |end|puts|require)\b/ },
    ];

    for (const pattern of patterns) {
        if (pattern.regex && pattern.regex.test(code)) {
            return pattern;
        }
    }

    return { name: 'Text', lang: 'text', icon: null };
};
