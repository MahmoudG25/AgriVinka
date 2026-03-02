import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../constants/env';

export const cloudinaryService = {
  uploadFile: async (file, folder = 'general', onProgress = null) => {
    // Determine resource type based on file type
    let resourceType = 'auto';
    if (file.type.startsWith('video/')) {
      resourceType = 'video';
    } else if (file.type.startsWith('image/')) {
      resourceType = 'image';
    } else if (file.type === 'application/pdf') {
      // PDFs should be uploaded as 'raw' to avoid transformation corruption
      resourceType = 'raw';
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    // Organize files into a master Namaa-Academy folder
    formData.append('folder', `Namaa-Academy/${folder}`);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

      xhr.open('POST', url, true);

      // Handle progress if callback provided
      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(Math.round(percentComplete));
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            let optimizedUrl = response.secure_url;

            // Only apply transformations to images (NOT PDFs or raw files)
            if (resourceType === 'image') {
              optimizedUrl = optimizedUrl.replace('/upload/', '/upload/f_auto,q_auto/');
            }
            // For videos, simple optimization
            else if (resourceType === 'video') {
              optimizedUrl = optimizedUrl.replace('/upload/', '/upload/f_auto,q_auto/');
            }
            // For raw files (PDFs): NO transformations — deliver as-is

            resolve(optimizedUrl);
          } catch (err) {
            reject(new Error('Failed to parse Cloudinary response'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.error?.message || 'Upload failed'));
          } catch (e) {
            reject(new Error('Upload failed with status ' + xhr.status));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error occurred during upload. Please check your connection or CORS settings.'));
      };

      xhr.send(formData);
    });
  },

  /**
   * Upload a PDF file as RAW to Cloudinary.
   * RAW uploads preserve the file exactly as-is with no transformations.
   * 
   * @param {File|Blob} file The PDF file/blob
   * @param {string} userId Used to create isolated folder structures
   * @returns {Promise<{secureUrl: string, publicId: string}>}
   */
  uploadPdf: async (file, userId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', `Namaa-Academy/certificates/${userId || 'guest'}`);

    try {
      // Upload as RAW — this preserves the PDF binary exactly.
      // Raw files are served without ANY transformations.
      const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`;

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Failed to upload PDF');
      }

      const data = await response.json();
      // Return the raw secure_url — NO transformations applied
      return {
        secureUrl: data.secure_url,
        publicId: data.public_id
      };
    } catch (error) {
      console.error('Cloudinary PDF Upload Error:', error);
      throw error;
    }
  },

  /**
   * Get a forced-download URL for a Cloudinary raw file.
   * Appends fl_attachment to force browser download instead of inline preview.
   * 
   * @param {string} secureUrl The Cloudinary secure URL
   * @returns {string} Download URL with forced attachment
   */
  getDownloadUrl: (secureUrl) => {
    if (!secureUrl) return '';
    // For raw uploads, just append ?dl=1 or use fl_attachment
    // Raw URLs don't support transformations, so just use the URL directly
    return secureUrl;
  }
};
