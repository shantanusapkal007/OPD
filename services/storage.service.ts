import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/lib/firebase";

const MB = 1024 * 1024;
const PATIENT_PHOTO_MAX_DIMENSION = 720;
const VISIT_IMAGE_MAX_DIMENSION = 1024;
const PATIENT_PHOTO_QUALITY = 0.78;
const VISIT_IMAGE_QUALITY = 0.65;
const DEFAULT_QUALITY = 0.8;
const MAX_PARALLEL_UPLOADS = 8;

type UploadProgressCallback = (progress: number) => void;

function sanitizeFileName(fileName: string) {
  return fileName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
}

function createUniqueId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createStoragePath(folder: string, fileName: string) {
  return `${folder}/${createUniqueId()}-${sanitizeFileName(fileName)}`;
}

function getUploadMaxDimension(folder: string) {
  return folder.includes("patient-photos") ? PATIENT_PHOTO_MAX_DIMENSION : VISIT_IMAGE_MAX_DIMENSION;
}

function getUploadQuality(folder: string) {
  if (folder.includes("patient-photos")) {
    return PATIENT_PHOTO_QUALITY;
  }

  if (folder.includes("visit-images")) {
    return VISIT_IMAGE_QUALITY;
  }

  return DEFAULT_QUALITY;
}

function getOutputType(file: File) {
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file.type;
  }

  return "image/webp";
}

function replaceFileExtension(fileName: string, nextExtension: string) {
  return fileName.replace(/\.[^./\\]+$/, "") + `.${nextExtension}`;
}

function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error("Failed to read image."));
    };

    image.src = imageUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

async function optimizeImageForUpload(file: File, folder: string) {
  if (typeof window === "undefined") return file;
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;

  const image = await loadImageFromFile(file);
  const maxDimension = getUploadMaxDimension(folder);
  const largestSide = Math.max(image.naturalWidth, image.naturalHeight);

  if (largestSide <= maxDimension && file.size <= 1.5 * MB) {
    return file;
  }

  const scale = largestSide > maxDimension ? maxDimension / largestSide : 1;
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return file;
  }

  context.drawImage(image, 0, 0, width, height);

  const outputType = getOutputType(file);
  const optimizedBlob = await canvasToBlob(canvas, outputType, getUploadQuality(folder));

  if (!optimizedBlob || optimizedBlob.size >= file.size) {
    return file;
  }

  return new File([optimizedBlob], file.name, {
    type: outputType === file.type ? file.type : "image/webp",
    lastModified: file.lastModified,
  });
}

export function validateImageFiles(files: File[], maxSizeMb: number) {
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed.");
    }

    if (file.size > maxSizeMb * MB) {
      throw new Error(`Each image must be ${maxSizeMb}MB or smaller.`);
    }
  }
}

export async function uploadFileToStorage(file: File, folder: string, onProgress?: UploadProgressCallback) {
  const optimizedFile = await optimizeImageForUpload(file, folder);
  const fileName = optimizedFile.type === "image/webp" && !optimizedFile.name.toLowerCase().endsWith(".webp")
    ? replaceFileExtension(optimizedFile.name, "webp")
    : optimizedFile.name;
  const storageRef = ref(storage, createStoragePath(folder, fileName));

  return new Promise<string>((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, optimizedFile, { contentType: optimizedFile.type || file.type });

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        if (!snapshot.totalBytes) return;
        onProgress?.(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
      },
      reject,
      async () => {
        resolve(await getDownloadURL(storageRef));
      }
    );
  });
}

export async function uploadFilesToStorage(files: File[], folder: string, onProgress?: UploadProgressCallback) {
  if (files.length === 0) {
    onProgress?.(100);
    return [];
  }

  const results = new Array<string>(files.length);
  const fileProgress = new Array<number>(files.length).fill(0);
  let nextIndex = 0;

  const updateOverallProgress = () => {
    const progressTotal = fileProgress.reduce((sum, value) => sum + value, 0);
    onProgress?.(Math.round(progressTotal / files.length));
  };

  const worker = async () => {
    while (nextIndex < files.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await uploadFileToStorage(files[currentIndex], folder, (progress) => {
        fileProgress[currentIndex] = progress;
        updateOverallProgress();
      });
      fileProgress[currentIndex] = 100;
      updateOverallProgress();
    }
  };

  const workerCount = Math.min(MAX_PARALLEL_UPLOADS, files.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  onProgress?.(100);

  return results;
}
