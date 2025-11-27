import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger'
}) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <>
            <div className="confirm-modal-overlay" onClick={onClose}></div>
            <div className="confirm-modal fade-in">
                <button className="confirm-modal-close" onClick={onClose}>
                    <FaTimes />
                </button>
                
                <div className={`confirm-modal-icon confirm-modal-icon-${type}`}>
                    <FaExclamationTriangle />
                </div>

                <h3 className="confirm-modal-title">{title}</h3>
                <p className="confirm-modal-message">{message}</p>

                <div className="confirm-modal-actions">
                    <button className="confirm-modal-btn confirm-modal-cancel" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button className={`confirm-modal-btn confirm-modal-confirm confirm-modal-confirm-${type}`} onClick={handleConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </>
    );
};

export default ConfirmModal;
