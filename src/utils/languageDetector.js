import { FaPython, FaJs, FaHtml5, FaCss3, FaJava, FaCode } from 'react-icons/fa';
import { SiTypescript, SiCplusplus } from 'react-icons/si';

export const detectLanguage = (code) => {
    if (!code) return { name: 'Text', lang: 'text', icon: null };

    const patterns = [
        { name: 'Python', lang: 'python', icon: FaPython, regex: /\b(def|import|from|class|if __name__|print\(|input\(|for .+ in |range\(|elif|:\s*$)/m },
        { name: 'JavaScript', lang: 'javascript', icon: FaJs, regex: /\b(const|let|var|function|=>|import|export|console\.log)\b/ },
        { name: 'TypeScript', lang: 'typescript', icon: SiTypescript, regex: /\b(interface|type|namespace|enum|implements|as |: (string|number|boolean))\b/ },
        { name: 'HTML', lang: 'html', icon: FaHtml5, regex: /<\/?[a-z][\s\S]*>/i },
        { name: 'CSS', lang: 'css', icon: FaCss3, regex: /\{[\s\S]*?\}|@media|@import/ },
        { name: 'Java', lang: 'java', icon: FaJava, regex: /\b(public class|void main|System\.out\.println)\b/ },
        { name: 'C++', lang: 'cpp', icon: SiCplusplus, regex: /\b(#include|std::|cout|cin)\b/ },
        { name: 'C#', lang: 'csharp', icon: FaCode, regex: /\b(using System|namespace|Console\.WriteLine)\b/ },
        { name: 'Go', lang: 'go', icon: FaCode, regex: /\b(package main|func main|fmt\.Println)\b/ },
        { name: 'Rust', lang: 'rust', icon: FaCode, regex: /\b(fn main|println!|let mut|impl)\b/ },
        { name: 'PHP', lang: 'php', icon: FaCode, regex: /\b(<\?php|\$this|echo)\b/ },
        { name: 'Ruby', lang: 'ruby', icon: FaCode, regex: /\b(def |end|puts|require)\b/ },
    ];

    for (const pattern of patterns) {
        if (pattern.regex.test(code)) {
            return pattern;
        }
    }

    return { name: 'Text', lang: 'text', icon: null };
};
