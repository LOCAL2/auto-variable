import React from 'react';

const CreditModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Overlay to close when clicking outside */}
            <div
                className="popover-overlay"
                onClick={onClose}
            ></div>

            <div className="credit-popover fade-in-up">
                <button className="close-button-popover" onClick={onClose}>&times;</button>

                <div className="profile-avatar-small">
                    <img
                        src="https://cdn.discordapp.com/avatars/1195754440955793442/337c3115ee427d5f8bccbaf16cb19a8d.png?size=1024"
                        alt="Local"
                        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                    />
                </div>

                <div className="popover-content">
                    <h2 className="profile-name-small">Local</h2>
                    <p className="profile-handle-small">@barronxsl</p>
                    <p className="profile-bio-small">
                        Owner Website
                    </p>
                </div>
            </div>
        </>
    );
};

export default CreditModal;
