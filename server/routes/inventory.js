const express = require('express');
const router = express.Router();

const { protect, ownerOnly } = require('../middleware/auth');
const inventoryController = require('../controllers/inventoryController');

router.get('/', protect, inventoryController.getAll);
router.post('/', protect, ownerOnly, inventoryController.create);
router.put('/:id', protect, ownerOnly, inventoryController.update);
router.delete('/:id', protect, ownerOnly, inventoryController.delete);

router.get('/consumables', protect, inventoryController.getAllConsumables);
router.post('/consumables', protect, ownerOnly, inventoryController.createConsumable);
router.delete('/consumables/:id', protect, ownerOnly, inventoryController.deleteConsumable);

module.exports = router;
