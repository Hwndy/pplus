const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const UserController = require('../controllers/userController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/avatars');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

const upload = multer({ storage });

router.get('/', authenticateToken, authorizeRole(['admin']), UserController.getUsers);
router.get('/:id', authenticateToken, authorizeRole(['admin']), UserController.getUserById);
router.post('/', authenticateToken, authorizeRole(['admin']), upload.single('avatar'), UserController.createUser);
router.put('/:id', authenticateToken, authorizeRole(['admin']), upload.single('avatar'), UserController.updateUser);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), UserController.deleteUser);

module.exports = router;