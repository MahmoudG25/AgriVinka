// src/services/mediaLinkService.js

/**
 * Normalizes video/media links into a unified format for the learning platform.
 * Supports: YouTube, Vimeo, Google Drive, and Direct media links (mp4, pdf, etc).
 */

export const normalizeMediaLink = (url) => {
  if (!url || typeof url !== 'string') {
    return { error: 'رابط غير صالح' };
  }

  const trimmedUrl = url.trim();

  // 1. YouTube
  // Matches: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const ytMatch = trimmedUrl.match(ytRegex);

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      provider: 'youtube',
      type: 'video',
      url: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
      originalUrl: trimmedUrl,
      publicId: videoId
    };
  }

  // 2. Vimeo
  // Matches: vimeo.com/ID
  const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i;
  const vimeoMatch = trimmedUrl.match(vimeoRegex);

  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      provider: 'vimeo',
      type: 'video',
      url: `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`,
      originalUrl: trimmedUrl,
      publicId: videoId
    };
  }

  // 3. Google Drive
  // Matches: drive.google.com/file/d/ID/view, drive.google.com/open?id=ID
  const driveRegex = /drive\.google\.com\/(?:file\/d\/|open\?id=)([-\w]+)/i;
  const driveMatch = trimmedUrl.match(driveRegex);

  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      provider: 'drive',
      type: 'video', // Assume video or embeddable document
      url: `https://drive.google.com/file/d/${fileId}/preview`,
      originalUrl: trimmedUrl,
      publicId: fileId
    };
  }

  // 4. Direct External Links & Cloudinary
  // Matches: .mp4, .pdf, .jpg, etc.
  try {
    const parsedUrl = new URL(trimmedUrl);

    let type = 'link';
    if (parsedUrl.pathname.match(/\.(mp4|webm|ogg)$/i)) type = 'video';
    else if (parsedUrl.pathname.match(/\.(pdf)$/i)) type = 'pdf';
    else if (parsedUrl.pathname.match(/\.(jpe?g|png|gif|webp)$/i)) type = 'image';

    return {
      provider: 'external',
      type: type,
      url: trimmedUrl,
      originalUrl: trimmedUrl,
      publicId: parsedUrl.pathname // basic fallback
    };
  } catch (e) {
    return { error: 'صيغة الرابط غير صحيحة أو غير مدعومة' };
  }
};
