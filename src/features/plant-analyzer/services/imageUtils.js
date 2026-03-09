/**
 * Compresses and resizes an image file using the Canvas API.
 * This ensures large mobile photos are reduced before sending to AI providers.
 * 
 * @param {File} file - The original image file
 * @param {number} maxWidthOrHeight - Maximum dimension (width or height)
 * @param {number} quality - JPEG compression quality (0.0 to 1.0)
 * @returns {Promise<{ base64: string, mimeType: string, originalSize: number, newSize: number }>}
 */
export const compressImage = (file, maxWidthOrHeight = 1024, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = Math.round((height * maxWidthOrHeight) / width);
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = Math.round((width * maxWidthOrHeight) / height);
            height = maxWidthOrHeight;
          }
        }

        // Draw to canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Export to JPEG base64
        const mimeType = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);

        // Calculate sizes for comparison
        const originalSize = file.size;
        // Approximate base64 size back to bytes
        const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const padding = (dataUrl.charAt(dataUrl.length - 2) === '=') ? 2 : ((dataUrl.charAt(dataUrl.length - 1) === '=') ? 1 : 0);
        const newSize = (base64Length * 0.75) - padding;

        // The AI APIs typically expect the raw base64 string without the Data-URI header.
        const base64Data = dataUrl.split(',')[1];

        resolve({
          base64: base64Data,
          mimeType,
          originalSize,
          newSize
        });
      };

      img.onerror = () => {
        reject(new Error("Failed to load image for compression"));
      };
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
  });
};
