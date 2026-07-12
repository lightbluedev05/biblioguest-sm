const express = require('express');
const router = express.Router();
const controller = require('../controllers/libro_controller');
const validation = require('../middleware/validation');
const auth = require('../middleware/authMiddleware');

// Lectura - Público (catálogo visible para todos)
router.get('/libro', validation.validatePagination, controller.getLibros);
router.get('/libro/:id', controller.getLibroById);
router.get('/libro/:id/detalle', controller.getLibroDetalleById);

// Modificación - Solo bibliotecarios y admins
router.post('/libro', auth.requireBibliotecarioOrAdmin, controller.createLibro);
router.put('/libro/:id', auth.requireBibliotecarioOrAdmin, controller.updateLibro);
router.delete('/libro/:id', auth.requireAdmin, controller.deleteLibro);

// Autores - Solo bibliotecarios y admins
router.post('/libro/:id/autores', auth.requireBibliotecarioOrAdmin, controller.setAutoresLibro);
router.delete('/libro/:id/autores/:idAutor', auth.requireBibliotecarioOrAdmin, controller.removeAutorLibro);

// Categorías - Solo bibliotecarios y admins
router.post('/libro/:id/categorias', auth.requireBibliotecarioOrAdmin, controller.setCategoriasLibro);
router.delete('/libro/:id/categorias/:idCategoria', auth.requireBibliotecarioOrAdmin, controller.removeCategoriaLibro);

// Etiquetas - Solo bibliotecarios y admins
router.post('/libro/:id/etiquetas', auth.requireBibliotecarioOrAdmin, controller.setEtiquetasLibro);
router.delete('/libro/:id/etiquetas/:idEtiqueta', auth.requireBibliotecarioOrAdmin, controller.removeEtiquetaLibro);

module.exports = router;