const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favSchema = new Schema({
    trade: {type: Schema.Types.ObjectId, ref: 'Trade'},
    user: {type: Schema.Types.ObjectId, ref: 'User'}
}
);
  
module.exports = mongoose.model('Favourite', favSchema);