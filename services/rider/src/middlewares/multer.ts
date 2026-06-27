import multer from "multer";

const storage = multer.memoryStorage();
const uploadFile = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single("file");

export default uploadFile;
