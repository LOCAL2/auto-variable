import React, { useState, useRef } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';

interface FileUploaderProps {
    onFileSelect: (file: File) => void;
    maxSizeKB?: number;
    accept?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
    onFileSelect,
    maxSizeKB = 15,
    accept = '.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt,.sql,.html,.css,.json,.xml,.yaml,.yml,.md,.txt'
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFile = (file: File) => {
        if (file.size > maxSizeKB * 1000) {
            alert(`ไฟล์มีขนาดใหญ่เกินไป (Max ${maxSizeKB}KB) / File too large`);
            return;
        }
        onFileSelect(file);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            className={`file-uploader ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileInput}
                style={{ display: 'none' }}
            />
            <div className="file-uploader-icon">
                <FaCloudUploadAlt />
            </div>
            <div className="file-uploader-text">
                <p className="file-uploader-title">
                    Drop your file here or click to browse
                </p>
                <p className="file-uploader-subtitle">
                    Max {maxSizeKB}KB • Code files only
                </p>
            </div>
        </div>
    );
};

export default FileUploader;
