const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storySchema = new Schema({
        category:{type: String, required: [true, 'category is required']},
        title: {type: String, required:[true, 'title is required']},
        details:{type:String, required:[true,'details is required'],
                minlength:[10, 'the description should have atleast 10 characters']},
        status:{type:String, default:"Available"},
        singer:{type:String, required:[true,'status is required']},
        image:{type:String, required:[true,'image is required']},
        author: {type: Schema.Types.ObjectId, ref: 'User'},
        offerid:{type:Schema.Types.ObjectId,ref:'Offer'}
    },
{timestamps: true}
);
// Collection name : stories, database: maptrade
//const Story = mongoose.model('Story', storySchema);
module.exports = mongoose.model('trade', storySchema); 



