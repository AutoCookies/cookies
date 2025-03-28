import React, { useState, useEffect } from 'react';
import styles from './styles/EditSharePostModal.module.css';

interface EditSharePostModalProps {
  isOpen: boolean;
  initialCaption: string;
  onSave: (caption: string) => Promise<void>;
  onClose: () => void;
  maxLength?: number;
}

const EditSharePostModal: React.FC<EditSharePostModalProps> = ({
  isOpen,
  initialCaption = '',
  onSave,
  onClose,
  maxLength = 500,
}) => {
  const [caption, setCaption] = useState(initialCaption);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(initialCaption.length);

  useEffect(() => {
    // Reset state khi modal mở/đóng
    if (isOpen) {
      setCaption(initialCaption);
      setCharCount(initialCaption.length);
      setError(null);
    }
  }, [isOpen, initialCaption]);

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setCaption(value);
      setCharCount(value.length);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!caption.trim()) {
      setError('Vui lòng nhập chú thích');
      return;
    }

    setIsSaving(true);
    setError(null);
    
    try {
      await onSave(caption.trim());
      onClose();
    } catch (err) {
      setError('Lỗi khi lưu chú thích. Vui lòng thử lại.');
      console.error('Save caption error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Chỉnh sửa chú thích chia sẻ</h2>
          <button 
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Đóng"
          >
            &times;
          </button>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.formGroup}>
            <label htmlFor="caption-input">Chú thích</label>
            <textarea
              id="caption-input"
              value={caption}
              onChange={handleCaptionChange}
              rows={5}
              placeholder="Nhập chú thích của bạn..."
              className={`${styles.captionInput} ${error ? styles.errorInput : ''}`}
              aria-invalid={!!error}
              aria-describedby={error ? 'caption-error' : undefined}
            />
            <div className={styles.charCounter}>
              {charCount}/{maxLength} ký tự
            </div>
            {error && (
              <div id="caption-error" className={styles.errorMessage}>
                {error}
              </div>
            )}
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className={styles.secondaryButton}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || !caption.trim()}
              className={styles.primaryButton}
            >
              {isSaving ? (
                <>
                  <span className={styles.spinner} aria-hidden="true"></span>
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSharePostModal;