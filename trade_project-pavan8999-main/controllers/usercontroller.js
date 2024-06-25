const model = require('../models/user');
const story=require('../models/item');
const favModel=require('../models/favourite');
const offerModel = require("../models/offer");

const mongoose = require('mongoose');
exports.new = (req, res)=>{
    res.render('./user/new');
};

exports.create = (req, res, next)=>{
    //res.send('Created a new story');
    let user = new model(req.body);//create a new story document
    user.save()//insert the document to the database
    .then(user=> res.redirect('/users/login'))
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('/users/new');
        }

        if(err.code === 11000) {
            console.log("email already used");
            req.flash('error', 'Email has been already used');  
            return res.redirect('/users/new');
        }
        next(err);
    }); 
};

exports.getUserLogin = (req, res, next) => {
    res.render('./user/login');
}


exports.login = (req, res, next)=>{

    let email = req.body.email;
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            console.log('wrong email address');
            req.flash('error', 'Entered Wrong Email Address');  
            res.redirect('/users/login');
            } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/users/profile');
            } else {
                req.flash('error', 'Entered Wrong Password');      
                res.redirect('/users/login');
            }
            });     
        }     
    })
    .catch(err => next(err));
};

exports.profile = (req, res, next)=>{
    let id = req.session.user;  // Get the id of the user from the session

    Promise.all([model.findById(id),story.find({author: id}),
        favModel.find({user: req.session.user}),
        offerModel.find({offerCreated:id,status: true}).populate({path:'requested', select:['title','category','status','singer']})])
    .then(results=>{
        const [user,stories,wacthedTradeids,offersCreated]=results;
        let docmentids = []
        wacthedTradeids.forEach(id => {
            docmentids.push(mongoose.Types.ObjectId(id.trade));
        });
        story.find({'_id': { $in: docmentids}})
        .then(wacthedTrades => {
            res.render('./user/profile',{user,stories,wacthedTrades,offersCreated});
        })
        .catch(err=>next(err));
    })
    .catch(err=>next(err));
};

exports.unwatchTrade = (req,res,next) => {
    let id = req.params.id;
    favModel.findOneAndDelete({user: req.session.user,trade:id})
    .then(fav=>{
        if(fav) {
            req.flash('success', 'You have successfully unwatched the trade');
            res.redirect(`/users/profile`);
        }
    })
    .catch(err=> next(err));
  }


exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err)
            return next(err);
        else
            res.redirect('/');  
    });
   
 };

 exports.deletePoster = (req, res, next)=>{
    let id = req.params.id;
    story.findByIdAndDelete(id, {useFindAndModify: false})
   .then(deletestory=>{
    if(deletestory) {
        offerModel.findByIdAndDelete(deletestory.offerid)
        .then(offer => {
            let tradeAvailable;
            if(offer) {
                console.log(offer)
                if(offer.requested == deletestory.id) {
                    tradeAvailable = offer.tradingItem;
                } else {
                    tradeAvailable = offer.requested;
                }
            }
            console.log(tradeAvailable)
            story.findByIdAndUpdate(tradeAvailable,{status:"Available",offerid: null})
          .then(updstory => {
              res.redirect('/users/profile');
          })
          .catch(err=> next(err));
        })
       .catch(err=> next(err));
    } else{
        let err = new Error('Cannot find a story with id ' + id);
        err.status = 404;
        return next(err);
        }
    })
   .catch(err=> next(err));
};
