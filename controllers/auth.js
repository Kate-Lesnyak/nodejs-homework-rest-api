const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs/promises');
const gravatar = require('gravatar');
const Jimp = require('jimp');
const { nanoid } = require('nanoid');

const { User } = require('../models/user');
const { HttpError, ctrlWrapper, sendEmail } = require('../helpers');

const { SECRET_KEY, BASE_URL } = process.env;

const avatarsDir = path.join(__dirname, '..', 'public', 'avatars');

const register = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });

	if (user) {
		throw HttpError(409, 'Email already in use');
	};

	const hashPassword = await bcrypt.hash(password, 10);
	const avatarURL = gravatar.url(email);
	const verificationToken = nanoid();

	const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL, verificationToken });

	const verifyEmail = {
		to: email,
		subject: 'Verify email',
		html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click verify email</a>`
	}

	await sendEmail(verifyEmail);

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

const verifyEmail = async (req, res) => {
	const { verificationToken } = req.params;
	const user = await User.findOne({ verificationToken });

	if (!user) {
		throw HttpError(404, 'User not found');
	}

	await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: null });

	res.json({ message: 'Verification successful' })
};

const resendVerifyEmail = async (req, res) => {
	const { email } = req.body;
	const user = await User.findOne({ email });

	if (!user) {
		throw HttpError(404, 'User not found');
	}

	if (user.verify) {
		throw HttpError(400, 'Verification has already been passed');
	}

	const verifyEmail = {
		to: email,
		subject: 'Verify email',
		html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click verify email</a>`
	}

	await sendEmail(verifyEmail);

	res.json({
		message: 'Verification email sent success'
	})
};

const login = async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	if (!user) {
		throw HttpError(401, 'Email or password is wrong');
	};

	if (!user.verify) {
		throw HttpError(401, 'Email not verified');
	}

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
	verifyEmail: ctrlWrapper(verifyEmail),
	resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
	login: ctrlWrapper(login),
	getCurrentUser: ctrlWrapper(getCurrentUser),
	logout: ctrlWrapper(logout),
	updateSubscription: ctrlWrapper(updateSubscription),
	updateAvatar: ctrlWrapper(updateAvatar)
}


