const mongoose = require('mongoose'); // Correction de l'orthographe (mongosse -> mongoose)

const todoSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    completed: { // Correction de la casse (Completed -> completed)
        type: Boolean,
        default: false,
    }
});

const TaskSchema = new mongoose.Schema({
    title: {
        type: String, // Ajout du mot-clé 'type' manquant
        required: true
    },
    description: {
        type: String,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    dueDate: {
        type: Date,
        required: true
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    attachments: [{
        type: String,
    }],
    todoChecklist: [todoSchema],
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100 // Ajout de validation pour le pourcentage
    },
}, {
    timestamps: true
});

// Création du modèle
const Task = mongoose.model('Task', TaskSchema);

module.exports = {Task};