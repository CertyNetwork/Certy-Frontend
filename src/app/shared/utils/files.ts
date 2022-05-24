const ERROR_MESSAGES = {
  fileNoExtension: 'File does not have extension',
};

const MIME_TYPES = {
  gltf: 'model/gltf+json',
  glb: 'model/gltf-binary',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  ogg: 'audio/ogg',
  webm: 'video/webm',
  mp4: 'video/mp4',
  mpeg: 'audio/mpeg',
  mp3: 'audio/mp3',
}

export const correctFileType = async (file: File): Promise<File> => {
  if (file.type.includes('svg')) return setMimeType(MIME_TYPES.svg, file);

  const fileExtension = getFileExtension(file.name);

  if (!fileExtension) throw new Error(ERROR_MESSAGES.fileNoExtension);

  if (fileExtension === 'glb') return setMimeType(MIME_TYPES.glb, file);
  if (fileExtension === 'gltf') return setMimeType(MIME_TYPES.gltf, file);

  return file;
}

export const setMimeType = async (type: string, file: File): Promise<File> => {
  return new File([new Blob([await file.arrayBuffer()])], file.name, {
    type: type,
  });
}

export const getFileExtension = (fileName: string): string | undefined => {
  return fileName.slice(
    (Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1
  );
}