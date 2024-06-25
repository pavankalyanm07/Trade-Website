const {body} = require('express-validator');
const {validationResult} = require('express-validator');

exports.validateId = (req, res, next)=>{
    let id = req.params.id;
    console.log("ddd",id)
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid story id');
        err.status = 400;
        return next(err);
    } else {
        return next();
    }
};

exports.validateSignUp = [body('firstName','First name cannot be empty' ).notEmpty().trim().escape(), 
body('lastName','Last name cannot be empty').notEmpty().trim().escape(),
body('email','Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({min:8, max:64})
];

exports.validateLogIn = [body('email','Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({min:8,max:64})];


exports.validateTrade = [
    body('category', 'Category cannot be empty').notEmpty().trim().escape(),
    body('title', 'Title cannot be empty').notEmpty().trim().escape(),
    body('singer', 'singer cannot be empty').notEmpty().trim().escape(),
    body('details', 'Details cannot be empty and minimum 10 letters are required').notEmpty().trim().escape().isLength({min:10}),
    body('image', 'image cannot be empty').notEmpty(),
];

exports.validateResult = (req, res, next) =>{
    let errors = validationResult(req);
    if (!errors.isEmpty()){
        errors.array().forEach(error=>{
            req.flash ('error', error.msg);
        });
        return res.redirect('back');
    } else {
        return next();
    }
}