# Variable Replacer

A modern web application for creating shareable code templates with customizable variables. Perfect for sharing code snippets where users can replace placeholder variables with their own values.

## Features

- 🎨 **4 Beautiful Themes**: Deep Blue, Cyberpunk Neon, and OLED Black
- 🔍 **Smart Language Detection**: Auto-detects 10+ programming languages
- 📱 **QR Code Generation**: Instant QR codes for mobile sharing
- 📜 **History Management**: Tracks your last 5 generated links
- 🎯 **Multiple Variables**: Support for up to 6 color-coded variables
- ✨ **Syntax Highlighting**: Professional code display with variable highlighting
- 🔗 **URL Compression**: GZIP compression for shorter shareable links

## Installation

```bash
# Clone the repository
git clone https://github.com/LOCAL2/auto-variable.git

# Navigate to project directory
cd auto-variable

# Install dependencies
npm install

# Start development server
npm run dev
```

## Usage

### Creating a Shareable Link

1. Paste your code snippet
2. Add variable names (e.g., `api_key`, `username`)
3. Click "Generate Link"
4. Share the generated URL or QR code

### Using a Shared Link

1. Open the shared link
2. Enter your custom values for each variable
3. Copy the customized code

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **React Syntax Highlighter** - Code highlighting
- **QRCode.react** - QR code generation
- **React Icons** - UI icons

## License

MIT License

## Credits

Created by **Local** (@barronxsl)
