const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs/promises');
const gravatar = require('gravatar');
const Jimp = require('jimp');

const { User } = require('../models/user');
const { HttpError, ctrlWrapper } = require('../helpers');

const { SECRET_KEY } = process.env;

const avatarsDir = path.join(__dirname, '..', 'public', 'avatars');

const register = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });

	if (user) {
		throw HttpError(409, 'Email already in use');
	};

	const hashPassword = await bcrypt.hash(password, 10);
	const avatarURL = gravatar.url(email);

	const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL });

	res.status(201).json(
		{
			user: {
				name: newUser.name,
				email: newUser.email,
				subscription: newUser.subscription,
				avatarURL: newUser.avatarURL
			}
		});
};

const login = async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	if (!user) {
		throw HttpError(401, 'Email or password is wrong');
	};

	const passwordCompare = await bcrypt.compare(password, user.password);
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
			subscription: user.subscription,
			avatarURL: user.avatarURL
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

const updateAvatar = async (req, res) => {
	const { _id } = req.user;
	const { path: tempUpload, originalname } = req.file;

	const filename = `${_id}_${originalname}`;
	const resultUpload = path.join(avatarsDir, filename);

	const avatar = await Jimp.read(tempUpload);
	avatar.autocrop().cover(250, 250, Jimp.HORIZONTAL_ALIGN_CENTER || Jimp.VERTICAL_ALIGN_MIDDLE).write(resultUpload);
	// avatar.resize(250, 250, Jimp.RESIZE_BEZIER).write(resultUpload);

	await fs.rename(tempUpload, resultUpload);

	const avatarURL = path.join('avatars', filename);

	await User.findByIdAndUpdate(_id, { avatarURL });

	res.json({
		avatarURL,
	});
};

module.exports = {
	register: ctrlWrapper(register),
	login: ctrlWrapper(login),
	getCurrentUser: ctrlWrapper(getCurrentUser),
	logout: ctrlWrapper(logout),
	updateSubscription: ctrlWrapper(updateSubscription),
	updateAvatar: ctrlWrapper(updateAvatar)
}


