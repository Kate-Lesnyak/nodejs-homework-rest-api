const { Schema, model } = require('mongoose');
const Joi = require('joi');

const { handleMongooseError } = require('../helpers');

const contactSchema = new Schema({
	name: {
		type: String,
		required: [true, 'Set name for contact']
	},
	email: {
		type: String,
		// match: 
		required: true
	},
	phone: {
		type: String,
		// match: 
		required: true
	},
	favorite: {
		type: Boolean,
		default: false,
	}
},
	{
		versionKey: false,
		timestamps: true
	});

contactSchema.post('save', handleMongooseError);

const Contact = model('contact', contactSchema);

const addSchema = Joi.object({
	name: Joi.string()
		.alphanum()
		.min(3)
		.max(30)
		.required(),
	email: Joi.string()
		.email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
		.required(),
	phone: Joi.string()
		.required(),
	favorite: Joi.boolean()
});

const updateFavoriteSchema = Joi.object({
	favorite: Joi.boolean().required()
});

const schemas = {
	addSchema,
	updateFavoriteSchema
};


module.exports = {
	Contact,
	schemas
};