const express = require('express');

const router = express.Router();

const contacts = require('../../models/contacts');

router.get('/', async (req, res, next) => {
	const result = await contacts.listContacts();
	// res.json(result);
	res.json({
		status: 'success',
		code: 200,
		data: { result }
	});
});

router.get('/:contactId', async (req, res, next) => {
	const oneContact = await contacts.getContactById(req.params.contactId);
	// res.json(oneContact);
	res.json({
		status: 'success',
		code: 200,
		data: { oneContact }
	});
});

router.post('/', async (req, res, next) => {
	const { name, email, phone } = req.body;
	const newContact = await contacts.addContact(name, email, phone);
	// res.json(newContact);
	// newContact.name = name;
	// newContact.email = email;
	// newContact.phone = phone;

	res.status(201).json({
		status: 'success',
		code: 201,
		data: { newContact }
	});
});


router.put('/:contactId', async (req, res, next) => {
	const { contactId } = req.params;
	const { name, email, phone } = req.body;
	const updateContact = contacts.updateContactById(contactId, name, email, phone);
	// res.json(updateContact);
	res.json({
		status: 'success',
		code: 200,
		data: { updateContact }
	})
});

router.delete('/:contactId', async (req, res, next) => {
	const removeContact = contacts.removeContact(req.params.contactId);
	res.status(204).json({
		data: removeContact
	});
});

module.exports = router;
