const express=require("express");
const multer = require('multer');
// Configuration de stockage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Dossier de destination
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replaceAll(":","-") + '-' + file.originalname);
    }
});
// Filtres : accepter images, PDFs et documents
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 
        'image/gif', 
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
    ];
    if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
    } else {
    cb(new Error('Type de fichier non autorisé. Types acceptés: images, PDF, Word, Excel, texte'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
        files: 5 // 5 fichiers max
    }
});

module.exports=upload;