import React, { useState, useRef, ChangeEvent } from 'react';
import styles from './styles/EditPostModal.module.css';
import { handleUpdatePost } from '@/utils/posts/handleUpdatePost';

interface EditPostModalProps {
  isOpen: boolean;
  initialData: {
    title: string;
    content: string;
    imageUrl?: string | null;
    postId: string; // Thêm postId vào props
  };
  onClose: () => void;
  onUpdateSuccess?: (updatedPost: any) => void; // Callback khi cập nhật thành công
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onUpdateSuccess,
}) => {
  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState(initialData.content);
  const [imagePreview, setImagePreview] = useState(initialData.imageUrl || null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
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
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề');
      return;
    }
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { success, post, message } = await handleUpdatePost(
        initialData.postId,
        {
          title: title.trim(),
          content: content.trim(),
          image: selectedImage
        },
        (updatedPost) => {
          onUpdateSuccess?.(updatedPost);
          onClose();
        },
        (error) => {
          setError(error);
        }
      );

      if (success) {
        // Đóng modal sau khi lưu thành công
        onClose();
      } else {
        setError(message || 'Có lỗi xảy ra khi cập nhật');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi cập nhật bài viết');
      console.error('Update post error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Chỉnh sửa bài viết</h2>
        
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        
        <div className={styles.formGroup}>
          <label>Tiêu đề *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError(null);
            }}
            placeholder="Nhập tiêu đề bài viết"
            className={styles.inputField}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Nội dung *</label>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError(null);
            }}
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
              onClick={() => fileInputRef.current?.click()}
              className={styles.uploadButton}
              type="button"
              disabled={isSaving}
            >
              {imagePreview ? 'Thay đổi ảnh' : 'Thêm ảnh'}
            </button>
            
            {imagePreview && (
              <button 
                onClick={handleRemoveImage}
                className={styles.removeButton}
                type="button"
                disabled={isSaving}
              >
                Xóa ảnh
              </button>
            )}
          </div>
          
          {imagePreview && (
            <div className={styles.imagePreviewContainer}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                className={styles.imagePreview}
              />
            </div>
          )}
        </div>

        <div className={styles.modalActions}>
          <button 
            onClick={onClose}
            disabled={isSaving}
            className={styles.cancelButton}
            type="button"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className={styles.saveButton}
            type="button"
          >
            {isSaving ? (
              <>
                <span className={styles.spinner}></span>
                Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;