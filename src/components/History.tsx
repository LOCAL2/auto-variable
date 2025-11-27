import { useState, useMemo } from 'react';
import { useHistory } from '../hooks/useHistory';
import { useToast } from '../context/ToastContext';
import { FaTrash, FaTimes, FaCopy, FaExternalLinkAlt, FaArrowLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ConfirmModal from './ConfirmModal';

const ITEMS_PER_PAGE = 9;

const History = () => {
    const { history, clearHistory, removeItem } = useHistory();
    const { showToast } = useToast();
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const handleBack = () => {
        window.location.href = window.location.origin;
    };

    // Calculate pagination
    const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentItems = useMemo(() => history.slice(startIndex, endIndex), [history, startIndex, endIndex]);

    const goToPage = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToPrevPage = () => {
        if (currentPage > 1) goToPage(currentPage - 1);
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) goToPage(currentPage + 1);
    };

    return (
        <div className="glass-card fade-in">
            <button 
                className="back-to-home-btn"
                onClick={handleBack}
                title="Back to Home"
            >
                <FaArrowLeft />
                <span>กลับหน้าแรก</span>
            </button>

            <div className="history-page-header">
                <h1>Recent Links</h1>
                <p>ประวัติลิงก์ที่สร้างล่าสุด (Your generated links history)</p>
            </div>

            {history.length === 0 ? (
                <div className="empty-history">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: '1rem' }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <h3>ยังไม่มีประวัติ</h3>
                    <p>เมื่อคุณสร้างลิงก์ จะแสดงที่นี่</p>
                    <button className="btn-primary" onClick={handleBack} style={{ marginTop: '1rem' }}>
                        สร้างลิงก์แรก
                    </button>
                </div>
            ) : (
                <>
                    <div className="history-actions">
                        <span className="history-count">{history.length} ลิงก์</span>
                        <button onClick={() => setShowClearConfirm(true)} className="btn-danger">
                            <FaTrash style={{ marginRight: '0.5rem' }} />
                            ลบทั้งหมด
                        </button>
                    </div>

                    <div className="history-grid">
                        {currentItems.map((item) => (
                            <div key={item.id} className="history-card fade-in">
                                <button 
                                    onClick={() => setDeleteItemId(item.id)} 
                                    className="history-card-delete"
                                    title="Delete"
                                >
                                    <FaTimes />
                                </button>
                                
                                <div className="history-card-content">
                                    <div className="history-card-var">{item.targetVar}</div>
                                    <div className="history-card-preview">{item.preview}</div>
                                    <div className="history-card-link">{item.link}</div>
                                </div>

                                <div className="history-card-actions">
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(item.link);
                                            showToast('คัดลอกลิงก์แล้ว / Link copied!', 'success');
                                        }}
                                        className="btn-secondary"
                                    >
                                        <FaCopy />
                                        <span>Copy</span>
                                    </button>
                                    <a 
                                        href={item.link} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="btn-secondary"
                                    >
                                        <FaExternalLinkAlt />
                                        <span>Open</span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                className="pagination-btn"
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                            >
                                <FaChevronLeft />
                                <span>ก่อนหน้า</span>
                            </button>

                            <div className="pagination-pages">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    // Show first, last, current, and adjacent pages
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={page}
                                                className={`pagination-page ${page === currentPage ? 'active' : ''}`}
                                                onClick={() => goToPage(page)}
                                            >
                                                {page}
                                            </button>
                                        );
                                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                                        return <span key={page} className="pagination-ellipsis">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button 
                                className="pagination-btn"
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                            >
                                <span>ถัดไป</span>
                                <FaChevronRight />
                            </button>
                        </div>
                    )}
                </>
            )}

            <ConfirmModal
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                onConfirm={() => {
                    clearHistory();
                    showToast('ลบประวัติทั้งหมดแล้ว / All history cleared', 'success');
                    setShowClearConfirm(false);
                }}
                title="Clear All History?"
                message="Are you sure you want to delete all recent links? This action cannot be undone."
                confirmText="Yes, Clear All"
                cancelText="Cancel"
                type="danger"
            />

            <ConfirmModal
                isOpen={deleteItemId !== null}
                onClose={() => setDeleteItemId(null)}
                onConfirm={() => {
                    if (deleteItemId) {
                        removeItem(deleteItemId);
                        showToast('ลบลิงก์แล้ว / Link deleted', 'success');
                        setDeleteItemId(null);
                    }
                }}
                title="Delete This Link?"
                message="Are you sure you want to delete this link from your history?"
                confirmText="Yes, Delete"
                cancelText="Cancel"
                type="warning"
            />
        </div>
    );
};

export default History;
