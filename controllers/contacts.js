const { Contact } = require('../models/contact');
const { HttpError, ctrlWrapper } = require('../helpers');

const getAllContacts = async (req, res) => {
	const result = await Contact.find();
	res.status(200).json(result);
};

const getContactById = async (req, res) => {
	const { id } = req.params;
	const result = await Contact.findById(id);
	if (!result) {
		throw HttpError(404, 'Not Found');
	}
	res.status(200).json(result);
};

const addContact = async (req, res) => {
	const result = await Contact.create(req.body);
	res.status(201).json(result);
};

const updateContactById = async (req, res) => {
	const { id } = req.params;
	const result = await Contact.findByIdAndUpdate(id, req.body, { new: true });
	if (!result) {
		throw HttpError(404, 'Not Found');
	}
	res.status(200).json(result);
};

const updateContactFavorite = async (req, res) => {
	const { id } = req.params;
	const result = await Contact.findByIdAndUpdate(id, req.body, { new: true });
	if (!result) {
		throw HttpError(404, 'Not Found');
	}
	res.status(200).json(result);
};

const removeContact = async (req, res) => {
	const { id } = req.params;
	const result = await Contact.findByIdAndRemove(id);
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
	updateContactFavorite: ctrlWrapper(updateContactFavorite),
	removeContact: ctrlWrapper(removeContact)
}