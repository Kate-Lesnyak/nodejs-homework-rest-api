const express = require('express');

const router = express.Router();

const ctrl = require('../../controllers/contacts');

const { validateBody } = require('../../middlewares');

const { schema } = require('../../schemas');

router.get('/', ctrl.getAllContacts);

router.get('/:contactId', ctrl.getContactById);

router.post('/', validateBody(schema), ctrl.addContact);

router.put('/:contactId', validateBody(schema), ctrl.updateContactById);

router.delete('/:contactId', ctrl.removeContact);

module.exports = router;
