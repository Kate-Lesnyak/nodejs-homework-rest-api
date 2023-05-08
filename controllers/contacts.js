const contacts = require('../models/contacts');
const { HttpError, ctrlWrapper } = require('../helpers');

const getAllContacts = async (req, res) => {
	const result = await contacts.getAllContacts();
	res.status(200).json(result);
};

const getContactById = async (req, res) => {
	const { id } = req.params;
	const result = await contacts.getContactById(id);
	if (!result) {
		throw HttpError(404, 'Not Found');
	}
	res.status(200).json(result);
};

const addContact = async (req, res) => {
	const result = await contacts.addContact(req.body);
	res.status(201).json(result);
};

const updateContactById = async (req, res) => {
	const { id } = req.params;
	const result = await contacts.updateContactById(id, req.body);
	if (!result) {
		throw HttpError(404, 'Not Found');
	}
	res.status(200).json(result);
};

const removeContact = async (req, res) => {
	const { id } = req.params;
	const result = await contacts.removeContact(id);
	if (!result) {
		throw HttpError(404, 'Not Found');
	}
	res.status(200).json({ 'message': 'contact deleted' });
};

module.exports = {
	getAllContacts: ctrlWrapper(getAllContacts),
	getContactById: ctrlWrapper(getContactById),
	addContact: ctrlWrapper(addContact),
	updateContactById: ctrlWrapper(updateContactById),
	removeContact: ctrlWrapper(removeContact)
}