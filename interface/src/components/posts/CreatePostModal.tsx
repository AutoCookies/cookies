import React, { useState, useRef } from 'react';
import styles from './styles/CreatePostModal.module.css';
import { handleCreatePost } from '@/utils/posts/handleCreatePost';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated?: (newPost: any) => void; // Callback when post is successfully created
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPostCreated }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validate image file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                setError('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF)');
                return;
            }

            // Validate image size (5MB max)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                setError('Kích thước ảnh không được vượt quá 5MB');
                return;
            }

            setSelectedImage(file);
            setError(null);

            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setImagePreview(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            setError('Vui lòng nhập tiêu đề');
            return;
        }
        if (!content.trim() && !selectedImage) {
            setError('Vui lòng nhập nội dung hoặc thêm ảnh');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const result = await handleCreatePost(
                {
                    title,
                    content,
                    image: selectedImage || undefined
                },
                (newPost) => {
                    // Success callback
                    if (onPostCreated) {
                        onPostCreated(newPost);
                    }
                    // Reset form
                    setTitle('');
                    setContent('');
                    setImagePreview(null);
                    setSelectedImage(null);
                    onClose();
                },
                (error) => {
                    // Error callback
                    setError(error);
                }
            );

            if (!result.success) {
                setError(result.message || 'Có lỗi xảy ra khi tạo bài viết');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo bài viết');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Tạo bài viết mới</h2>
                    <button className={styles.closeButton} onClick={onClose}>&times;</button>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <div className={styles.formGroup}>
                    <label>Tiêu đề *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nhập tiêu đề bài viết"
                        className={styles.inputField}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Nội dung</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={5}
                        placeholder="Nhập nội dung bài viết"
                        className={styles.textareaField}
                    />
                </div>

                <div className={styles.imageSection}>
                    <label>Ảnh đính kèm</label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />

                    <div className={styles.imageControls}>
                        <button
                            type="button"
                            className={styles.uploadButton}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview ? 'Thay đổi ảnh' : 'Thêm ảnh'}
                        </button>
                        {imagePreview && (
                            <button
                                type="button"
                                className={styles.removeButton}
                                onClick={handleRemoveImage}
                            >
                                Xóa ảnh
                            </button>
                        )}
                    </div>

                    {imagePreview && (
                        <div className={styles.imagePreviewContainer}>
                            <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                        </div>
                    )}
                </div>

                <div className={styles.modalActions}>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="button"
                        className={styles.submitButton}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang đăng...' : 'Đăng bài'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;