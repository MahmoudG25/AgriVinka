// src/services/mediaLinkService.js

/**
 * Normalizes video/media links into a unified format for the learning platform.
 * Supports: YouTube, Vimeo, Google Drive, and Direct media links (mp4, pdf, etc).
 */

export const normalizeGoogleDriveLink = (url) => {
  if (!url || typeof url !== 'string') return null;

  const trimmedUrl = url.trim();

  // 1) Standard share link: /file/d/ID/view or /file/d/ID/preview
  const fileDrive = trimmedUrl.match(/drive\.google\.com\/(?:file\/d\/)([-\w]+)(?:\/(?:view|preview|download))?/i);
  if (fileDrive && fileDrive[1]) {
    return `https://drive.google.com/file/d/${fileDrive[1]}/preview`;
  }

  // 2) Open link with id query: /open?id=ID
  const openDrive = trimmedUrl.match(/drive\.google\.com\/open\?id=([-\w]+)/i);
  if (openDrive && openDrive[1]) {
    return `https://drive.google.com/file/d/${openDrive[1]}/preview`;
  }

  // 3) uc link: /uc?id=ID
  const ucDrive = trimmedUrl.match(/drive\.google\.com\/uc\?id=([-\w]+)/i);
  if (ucDrive && ucDrive[1]) {
    return `https://drive.google.com/file/d/${ucDrive[1]}/preview`;
  }

  // 4) Share link with /file/d/ID?usp=sharing etc
  const queryDrive = trimmedUrl.match(/drive\.google\.com\/file\/d\/([-\w]+)(?:\?[-\w=&]+)?/i);
  if (queryDrive && queryDrive[1]) {
    return `https://drive.google.com/file/d/${queryDrive[1]}/preview`;
  }

  return null;
};

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
  const normalizedDrive = normalizeGoogleDriveLink(trimmedUrl);
  if (normalizedDrive) {
    return {
      provider: 'drive',
      type: 'video', // Assume video or embeddable document
      url: normalizedDrive,
      originalUrl: trimmedUrl,
      publicId: normalizedDrive.match(/\/file\/d\/([-\w]+)/i)?.[1] || ''
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
