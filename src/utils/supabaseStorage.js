const path = require("path");
const supabase = require("../config/supabaseClient");
const config = require("../config").get(process.env.ENV);

const bucket = process.env.SUPABASE_STORAGE_BUCKET || process.env.SUPABASE_BUCKET_NAME || config.supabase?.storageBucket || "jb-bucket";

function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function getPublicUrl(filePath) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

async function uploadBuffer(buffer, filePath, contentType = "application/octet-stream") {
  const { error } = await supabase.storage.from(bucket).upload(filePath, buffer, {
    cacheControl: "3600",
    contentType,
    upsert: true,
  });

  if (error) throw error;
  return filePath;
}

async function createSignedUrl(filePath, expiresIn = 60 * 60) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(filePath, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

async function uploadFiles(files = [], folder = "uploads") {
  const uploadedPaths = [];

  for (const file of files) {
    const ext = path.extname(file.originalname || "");
    const baseName = path.basename(file.originalname || "file", ext);
    const filePath = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}-${sanitizeFileName(baseName)}${ext}`;
    await uploadBuffer(file.buffer, filePath, file.mimetype);
    uploadedPaths.push(filePath);
  }

  return uploadedPaths;
}

async function deleteFiles(filePaths = []) {
  const paths = filePaths.filter(Boolean);
  if (!paths.length) return;
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) throw error;
}

module.exports = {
  bucket,
  getPublicUrl,
  createSignedUrl,
  uploadBuffer,
  uploadFiles,
  deleteFiles,
};
