import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";

const MB = 1024 * 1024;
const PATIENT_PHOTO_MAX_DIMENSION = 960;
const VISIT_IMAGE_MAX_DIMENSION = 1600;
const DEFAULT_QUALITY = 0.82;

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

  const outputType = file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg";
  const optimizedBlob = await canvasToBlob(canvas, outputType, DEFAULT_QUALITY);

  if (!optimizedBlob || optimizedBlob.size >= file.size) {
    return file;
  }

  return new File([optimizedBlob], file.name, {
    type: outputType,
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

export async function uploadFileToStorage(file: File, folder: string) {
  const optimizedFile = await optimizeImageForUpload(file, folder);
  const storageRef = ref(storage, createStoragePath(folder, optimizedFile.name));
  await uploadBytes(storageRef, optimizedFile, { contentType: optimizedFile.type || file.type });
  return getDownloadURL(storageRef);
}

export async function uploadFilesToStorage(files: File[], folder: string) {
  return Promise.all(files.map((file) => uploadFileToStorage(file, folder)));
}
