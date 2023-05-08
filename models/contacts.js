const fs = require('fs/promises');
const path = require('path');
const { nanoid } = require('nanoid');

const contactsPath = path.join(__dirname, 'contacts.json');
console.log(contactsPath);

const updateContacts = async (contacts) => {
	await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
};

const getAllContacts = async () => {
	try {
		const data = await fs.readFile(contactsPath);
		return JSON.parse(data);
	} catch (error) {
		console.error(error.message);
	}
};

const getContactById = async (id) => {
	try {
		const contacts = await getAllContacts();
		const result = contacts.find((item) => item.id === id);
		return result || null;
	} catch (error) {
		console.error(error.message);
	}
};

const addContact = async (data) => {
	try {
		const contacts = await getAllContacts();
		const newContact = { id: nanoid(), ...data };
		contacts.push(newContact);
		await updateContacts(contacts);
		return newContact;
	} catch (error) {
		console.error(error.message);
	}
};

const updateContactById = async (id, data) => {
	try {
		const contacts = await getAllContacts();
		const index = contacts.findIndex(item => item.id === id);
		if (index === -1) {
			return null;
		}
		contacts[index] = { id, ...data };
		await updateContacts(contacts);
		return contacts[index];
	} catch (error) {
		console.error(error.message);
	}
};

const removeContact = async (id) => {
	try {
		const contacts = await getAllContacts();
		const index = contacts.findIndex(item => item.id === id);
		if (index === -1) {
			return null;
		}
		const [result] = contacts.splice(index, 1);
		await updateContacts(contacts);
		return result;
	} catch (error) {
		console.error(error.message);
	}
};

module.exports = {
	getAllContacts,
	getContactById,
	addContact,
	updateContactById,
	removeContact
}
