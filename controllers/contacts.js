const { Contact } = require('../models/contact');
const { HttpError, ctrlWrapper } = require('../helpers');

const getAllContacts = async (req, res) => {
	const { _id: owner } = req.user;
	const { page = 1, limit = 20, favorite } = req.query;
	const skip = (page - 1) * limit;

	const result = await Contact.find(favorite ? { owner, favorite } : { owner }, "-createdAt -updatedAt", { skip, limit }).populate('owner', 'name email subscription');

	res.status(200).json(result);
};

const getContactById = async (req, res) => {
	const { id } = req.params;
	// const result = await Contact.findOne({ _id: id })
	const result = await Contact.findById(id, "-createdAt -updatedAt").populate('owner', 'name email subscription');

	if (!result) {
		throw HttpError(404, 'Not Found');
	}
	res.json(result);
};

const addContact = async (req, res) => {
	const { _id: owner } = req.user;
	const result = await Contact.create({ ...req.body, owner });
	res.status(201).json(result);
};

const updateContactById = async (req, res) => {
	const { id } = req.params;
	const result = await Contact.findByIdAndUpdate(id, req.body, { new: true });

	if (!result) {
		throw HttpError(404, 'Not Found');
	}
	res.json(result);
};

const updateContactFavorite = async (req, res) => {
	const { id } = req.params;
	const result = await Contact.findByIdAndUpdate(id, req.body, { new: true });
	if (!result) {
		throw HttpError(404, 'Not Found');
	}
	res.json(result);
};

const removeContact = async (req, res) => {
	const { id } = req.params;
	const result = await Contact.findByIdAndRemove(id);
	if (!result) {
		throw HttpError(404, 'Not Found');
	}
	res.json({ 'message': 'Contact deleted' });
};


module.exports = {
	getAllContacts: ctrlWrapper(getAllContacts),
	getContactById: ctrlWrapper(getContactById),
	addContact: ctrlWrapper(addContact),
	updateContactById: ctrlWrapper(updateContactById),
	updateContactFavorite: ctrlWrapper(updateContactFavorite),
	removeContact: ctrlWrapper(removeContact)
}