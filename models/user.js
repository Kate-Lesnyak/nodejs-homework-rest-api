const { Schema, model } = require('mongoose');
const Joi = require('joi');

const { handleMongooseError } = require('../helpers');

const subscriptionList = ["starter", "pro", "business"];
// eslint-disable-next-line no-useless-escape
const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		match: emailRegexp,
		required: [true, 'Email is required'],
		unique: true,
	},
	password: {
		type: String,
		minlength: 7,
		required: [true, 'Password is required'],
	},
	subscription: {
		type: String,
		enum: subscriptionList,
		default: "starter"
	},
	token: {
		type: String,
		default: null,
	}
},
	{
		versionKey: false,
		timestamps: true
	},
);

userSchema.post('save', handleMongooseError);

const User = model('user', userSchema);

const registerSchema = Joi.object({
	name: Joi.string()
		.alphanum()
		.min(3)
		.max(30)
		.required(),
	email: Joi.string()
		.pattern(emailRegexp)
		.required(),
	password: Joi
		.string()
		.min(7)
		.required()
});

const loginSchema = Joi.object({
	email: Joi.string()
		.pattern(emailRegexp)
		.required(),
	password: Joi.string()
		.min(7)
		.required()
});

const updateSubscriptionSchema = Joi.object({
	subscription: Joi.string()
		.valid(...subscriptionList)
		.required()
});

const schemas = {
	registerSchema,
	loginSchema,
	updateSubscriptionSchema
};

module.exports = {
	User,
	schemas
};
