const express = require('express');

const router = express.Router();

const ctrl = require('../../controllers/contacts');

const { validateBody } = require('../../middlewares');

const { schema } = require('../../schemas');

router.get('/', ctrl.getAllContacts);

router.get('/:id', ctrl.getContactById);

router.post('/', validateBody(schema), ctrl.addContact);

router.put('/:id', validateBody(schema), ctrl.updateContactById);

router.delete('/:id', ctrl.removeContact);

module.exports = router;
