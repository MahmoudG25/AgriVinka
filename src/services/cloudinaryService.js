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
      resourceType = 'image'; // Cloudinary treats PDFs as images for upload/transformations
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
            // Optimize image/video delivery with f_auto and q_auto
            let optimizedUrl = response.secure_url;

            // Only apply standard transformations to images (including PDFs)
            if (resourceType === 'image') {
              optimizedUrl = optimizedUrl.replace('/upload/', '/upload/f_auto,q_auto/');
            }
            // For videos, simple optimization
            else if (resourceType === 'video') {
              optimizedUrl = optimizedUrl.replace('/upload/', '/upload/f_auto,q_auto/');
            }

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
  }
};
