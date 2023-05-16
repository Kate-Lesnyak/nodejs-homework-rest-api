const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { User } = require('../models/user');
const { HttpError, ctrlWrapper } = require('../helpers');

const { SECRET_KEY } = process.env;

const register = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });

	if (user) {
		throw HttpError(409, 'Email already in use');
	};

	const hashPassword = await bcrypt.hash(password, 10);

	const newUser = await User.create({ ...req.body, password: hashPassword });

	res.status(201).json(
		{
			user: {
				name: newUser.name,
				email: newUser.email,
				subscription: newUser.subscription
			}
		});
};

const login = async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	if (!user) {
		throw HttpError(401, 'Email or password is wrong');
	};

	const passwordCompare = bcrypt.compare(password, user.password);
	if (!passwordCompare) {
		throw HttpError(401, 'Email or password is wrong');
	};

	const payload = { id: user._id };

	const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '23h' });

	await User.findByIdAndUpdate(user._id, { token });

	res.json({
		token,
		user: {
			name: user.name,
			email: user.email,
			subscription: user.subscription
		}
	});
};

const getCurrentUser = async (req, res) => {
	const { name, email, subscription } = req.user;
	res.json({ name, email, subscription });
};

const logout = async (req, res) => {
	const { _id } = req.user;
	await User.findByIdAndUpdate(_id, { token: '' });

	// res.json({ message: 'Logout success' })
	res.status(204).send();
};

const updateSubscription = async (req, res) => {
	const { _id } = req.user;
	const result = await User.findByIdAndUpdate(_id, req.body, { new: true });
	if (!result) {
		throw HttpError(404, 'Not Found');
	}
	res.json(result);
};

module.exports = {
	register: ctrlWrapper(register),
	login: ctrlWrapper(login),
	getCurrentUser: ctrlWrapper(getCurrentUser),
	logout: ctrlWrapper(logout),
	updateSubscription: ctrlWrapper(updateSubscription)
}


