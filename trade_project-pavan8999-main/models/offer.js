const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
    requested: {type: Schema.Types.ObjectId, ref:'trade'},
    tradingItem: {type: Schema.Types.ObjectId, ref:'trade'},
    status: {type:Boolean,default: true},
    offerCreated: {type: Schema.Types.ObjectId, ref:'User'},
}
);

module.exports = mongoose.model('Offer', offerSchema);