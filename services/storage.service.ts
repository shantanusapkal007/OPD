import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";

const MB = 1024 * 1024;

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
  const storageRef = ref(storage, createStoragePath(folder, file.name));
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadFilesToStorage(files: File[], folder: string) {
  return Promise.all(files.map((file) => uploadFileToStorage(file, folder)));
}
