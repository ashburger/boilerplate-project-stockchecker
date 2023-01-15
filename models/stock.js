const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const stockSchema = new mongoose.Schema({
  stock: {type: String, unique:true},
  likes: {type: [String], default:[]}
});
stockSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Stock', stockSchema);