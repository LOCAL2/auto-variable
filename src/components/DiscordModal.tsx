import { useState } from 'react';
import { FaTimes, FaPaperPlane, FaDiscord } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';

interface DiscordModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
}

const DiscordModal = ({ isOpen, onClose, url }: DiscordModalProps) => {
    const [title, setTitle] = useState('🔗 Code Template Shared');
    const [senderName, setSenderName] = useState(localStorage.getItem('discord_sender_name') || '');
    const [webhookUrl, setWebhookUrl] = useState(
        localStorage.getItem('discord_webhook') || 
        'https://discord.com/api/webhooks/1436953935746306078/12Vc-CPuZtQLRnJ3IaX6ly0p2UiPwRjvtSbN1Y-cRqelkG2AnS0oSCO1WS1V0pErNOxj'
    );
    const [color, setColor] = useState(localStorage.getItem('discord_embed_color') || '#6366f1');
    const [isSending, setIsSending] = useState(false);
    const { showToast } = useToast();

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!webhookUrl.trim()) {
            showToast('กรุณาใส่ Discord Webhook URL / Please enter webhook URL', 'error');
            return;
        }

        setIsSending(true);

        try {
            // Save webhook URL, color, and sender name to localStorage
            localStorage.setItem('discord_webhook', webhookUrl);
            localStorage.setItem('discord_embed_color', color);
            localStorage.setItem('discord_sender_name', senderName);

            // Convert hex color to decimal
            const colorDecimal = parseInt(color.replace('#', ''), 16);

            // Use sender name or default to "Anonymous"
            const displayName = senderName.trim() || 'Anonymous';

            const embed = {
                embeds: [{
                    author: {
                        name: `ผู้ส่ง: ${displayName}`,
                        icon_url: 'https://cdn-icons-png.flaticon.com/512/6681/6681204.png'
                    },
                    title: title,
                    description: `\`\`\`\n${url}\n\`\`\``,
                    color: colorDecimal,
                    timestamp: new Date().toISOString()
                }]
            };

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(embed)
            });

            if (response.ok) {
                showToast('ส่งไปยัง Discord สำเร็จ! / Sent to Discord!', 'success');
                onClose();
            } else {
                throw new Error('Failed to send');
            }
        } catch (error) {
            console.error('Discord send error:', error);
            showToast('เกิดข้อผิดพลาดในการส่ง / Failed to send', 'error');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            <div className="qr-modal-overlay" onClick={onClose}></div>
            <div className="discord-modal">
                <button className="qr-modal-close" onClick={onClose}>
                    <FaTimes />
                </button>

                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <FaDiscord style={{ color: '#5865F2' }} />
                    Send to Discord
                </h3>

                <div className="discord-form">
                    <div className="input-group">
                        <label>Discord Webhook URL</label>
                        <input
                            type="text"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            placeholder="https://discord.com/api/webhooks/..."
                            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                        />
                    </div>

                    <div className="input-group">
                        <label>Your Name (ชื่อผู้ส่ง)</label>
                        <input
                            type="text"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            placeholder="Anonymous"
                        />
                    </div>

                    <div className="input-group">
                        <label>Embed Title (ชื่อหัวข้อ)</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter title..."
                        />
                    </div>

                    <div className="input-group">
                        <label>Embed Color (สีของ Embed)</label>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                style={{
                                    width: '60px',
                                    height: '40px',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            />
                            <input
                                type="text"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                placeholder="#6366f1"
                                style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
                            />
                        </div>
                    </div>

                    <div className="discord-preview">
                        <div className="discord-preview-label">Preview:</div>
                        <div className="discord-embed-preview" style={{ borderLeftColor: color }}>
                            <div className="discord-embed-author">
                                👤 ผู้ส่ง: {senderName || 'Anonymous'}
                            </div>
                            <div className="discord-embed-title">{title}</div>
                            <div className="discord-embed-code-block">{url}</div>
                        </div>
                    </div>

                    <button 
                        className="btn-primary" 
                        onClick={handleSend}
                        disabled={isSending}
                        style={{ marginTop: '1rem' }}
                    >
                        <FaPaperPlane style={{ marginRight: '0.5rem' }} />
                        {isSending ? 'กำลังส่ง... / Sending...' : 'ส่งไปยัง Discord / Send to Discord'}
                    </button>
                </div>
            </div>
        </>
    );
};

export default DiscordModal;
