import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/lib/firebase";
import imageCompression from "browser-image-compression";

const MB = 1024 * 1024;
const PATIENT_PHOTO_MAX_DIMENSION = 720;
const VISIT_IMAGE_MAX_DIMENSION = 1280;

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

function replaceFileExtension(fileName: string, nextExtension: string) {
  return fileName.replace(/\.[^./\\]+$/, "") + `.${nextExtension}`;
}

async function optimizeImageForUpload(file: File, folder: string) {
  if (typeof window === "undefined") return file;
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;

  const isPatientPhoto = folder.includes("patient-photos");
  const options = {
    maxSizeMB: isPatientPhoto ? 0.2 : 0.5,
    maxWidthOrHeight: isPatientPhoto ? PATIENT_PHOTO_MAX_DIMENSION : VISIT_IMAGE_MAX_DIMENSION,
    useWebWorker: true,
    fileType: "image/webp",
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    return new File([compressedBlob], file.name, {
      type: "image/webp",
      lastModified: file.lastModified,
    });
  } catch (error) {
    console.error("Compression error:", error);
    return file;
  }
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
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(progress));
      },
      (error) => {
        console.error(error);
        reject(error);
      },
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

  const updateOverallProgress = () => {
    const progressTotal = fileProgress.reduce((sum, value) => sum + value, 0);
    onProgress?.(Math.round(progressTotal / files.length));
  };

  for (let i = 0; i < files.length; i++) {
    results[i] = await uploadFileToStorage(files[i], folder, (progress) => {
      fileProgress[i] = progress;
      updateOverallProgress();
    });
    fileProgress[i] = 100;
    updateOverallProgress();
  }

  onProgress?.(100);
  return results;
}
