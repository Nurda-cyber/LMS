const express = require('express');
const path = require('path');
const multer = require('multer');
const auth = require('../middleware/auth');
const requireStudent = require('../middleware/requireStudent');
const submissionController = require('../controllers/submissionController');

const router = express.Router();

const MAX_SIZE_MB = 10;
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed =
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (!allowed) {
    return cb(new Error('Допустимы только файлы PDF и DOCX'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter
});

// POST /assignments/:id/submit — студент загружает файл задания
router.post(
  '/:id/submit',
  auth,
  requireStudent,
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'Файл слишком большой. Максимум 10 МБ.' });
        }
        return res.status(400).json({ error: err.message || 'Ошибка загрузки файла' });
      }
      if (err) {
        return res.status(400).json({ error: err.message || 'Ошибка загрузки файла' });
      }
      return next();
    });
  },
  submissionController.submit
);

module.exports = router;

