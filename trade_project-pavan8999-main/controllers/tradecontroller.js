const model = require('../models/item');
const favModel = require("../models/favourite");
const offerModel = require("../models/offer");
const { redirect } = require('express/lib/response');

exports.newPoster = (req,res)=>{
res.render('./trades/newTrade');
  };

exports.tradesList=(req,res,next)=>{
  model.find()
  .then(stories=>res.render('./trades/trades',{stories}))
  .catch(err=>next(err));
};


    exports.editPoster = (req, res, next)=>{
      let id = req.params.id;
      model.findById(id)
      .then(story=>{
          if(story) {
             return res.render('./trades/tradeEditForm', {story});
          } else {
              let err = new Error('Cannot find a story with id ' + id);
              err.status = 404;
              next(err);
          }
      })
      .catch(err=>next(err));  
  };






      exports.show = (req, res, next)=>{
      let id = req.params.id;
      model.findById(id).populate('author', 'firstName lastName')
      .then(story=>{
          if(story) {
            let watchStatus = false;
            favModel.find({user: req.session.user,trade: id})
            .then(fav => {
                console.log("fdff",fav)
                if(fav.length) {
                    watchStatus = true;
                    return res.render('./trades/trade', {story,watchStatus});

                } else {
                    watchStatus = false;
                }
            return res.render('./trades/trade', {story,watchStatus});
            })
            .catch(err=>next(err));
          } else {
              let err = new Error('Cannot find a story with id ' + id);
              err.status = 404;
              next(err);
          }
      })
      .catch(err=>next(err));  
  };



   /* exports.update = (req,res,next)=>{
      let story = req.body;
        let id = req.params.id;
        if(model.updateById(id, story)) {
            res.redirect('/trades/'+id);
      } else{
        let err = new Error('Cannot locate the trade id you have requested : ' + id);
        err.status = 404;
        next(err);
      }
        };*/

        exports.updatePoster = (req, res, next)=>{
          let story = req.body;
          let id = req.params.id; 
          model.findByIdAndUpdate(id, story, {useFindAndModify: false, runValidators: true})
          .then(story=> {
              if(story){
                  res.redirect('/trades/'+id);
              }
              else {
                  let err = new Error('Cannot find a story with id ' + id);
                  err.status = 404;
                  next(err);
              }
          }
              )
          .catch(err=> {
              if(err.name === 'ValidationError')
                  err.status = 400;
              next(err);
           });
      };



    
   /* exports.delete = (req,res,next) => {
      let id = req.params.id
      if(model.deleteById(id)){
          res.redirect('/trades');
      }
      else{
        let err = new Error('Cannot locate the trade id you have requested : ' + id);
        err.status = 404;
        next(err);
      }
    }*/
    exports.deletePoster = (req, res, next)=>{
      let id = req.params.id;
      model.findByIdAndDelete(id, {useFindAndModify: false})
     .then(story=>{
      if(story) {
          offerModel.findByIdAndDelete(story.offerid)
          .then(offer => {
            let tradeAvailable;
            if(offer) {
                if(offer.requested == story.id) {
                    tradeAvailable = offer.tradingItem;
                } else {
                    tradeAvailable = offer.requested;
                }
            }
            model.findByIdAndUpdate(tradeAvailable,{status:"Available",offerid: null})
            .then(updstory => {
                res.redirect('/trades');
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



        exports.createPoster = (req, res, next)=>{
          //res.send('Created a new story');
          let story = new model(req.body); //create a new story document
          story.author = req.session.user;
          story.save()//insert the document to the database
          .then((story)=> {
              //console.log(story);
              req.flash('success', 'Trade Created Successfully');
              res.redirect('/trades');
          } )
          .catch(err=>{
              if(err.name ==='ValidationError') {
                  err.status = 400;
                  req.flash('error',err.message);
                  res.redirect('back');
              }
              next(err);
          });
      };

exports.watchTrade = (req,res,next) => {
    let id = req.params.id;
    let favobj = new favModel();
    favobj.user = req.session.user;
    favobj.trade = id;
    favobj.save()
    .then((favobj)=> {
        res.redirect(`/trades/${id}`);
    } )
    .catch(err=>{
        err.status = 400;
        next(err);
    });
}

exports.unwatchTrade = (req,res,next) => {
    let id = req.params.id;
    favModel.findOneAndDelete({user: req.session.user,trade:id})
    .then(fav=>{
        if(fav) {
            res.redirect(`/trades/${id}`);
        }
    })
    .catch(err=> next(err));
}

exports.tradeItemPage = (req,res,next) => {
    let trade_req = req.params.id;
    model.find({status:"Available",author: req.session.user})
    .then((usertrades) => {
        res.render('./trades/intiateTrade',{usertrades,trade_req});
    })
    .catch(err=>next(err));
}

exports.tradeOffer = (req,res,next) => {
    console.log(req.body);
    let offerObj = new offerModel()
    offerObj.requested = req.params.id;
    offerObj.tradingItem = req.body.offerproduct;
    offerObj.status = true
    offerObj.offerCreated = req.session.user;
    offerObj
     .save()
    .then(results=>{
        Promise.all([model.findByIdAndUpdate(req.params.id,{status:'Pending',offerid:results.id},{useFindAndModify: false}),
        model.findByIdAndUpdate(req.body.offerproduct,{status:'Pending',offerid:results.id},{useFindAndModify: false})])
        .then(results=>{
            res.redirect('/users/profile');
        })
        .catch(err=>next(err));
    })
    .catch(err=>next(err));
}

exports.canceloffer = (req,res,next) => {
    offerModel.findByIdAndDelete(req.params.id)
    .then(offer => {
        Promise.all([model.findByIdAndUpdate(offer.requested,{status:'Available',offerid:null},{useFindAndModify: false}),
        model.findByIdAndUpdate(offer.tradingItem,{status:'Available',offerid:null},{useFindAndModify: false})])
        .then(results=>{
            res.redirect('/users/profile');
        })
        .catch(err=>next(err));
    })
    .catch(err=>next(err));
}

exports.manageoffer = (req,res,next) => {
    let offerid = req.params.id;
    offerModel.findById(offerid).populate({path:'requested'}).populate({path:'tradingItem'})
    .then(offer => {
        res.render("./trades/manageOffer",{offer})
    })
    .catch(err=>next(err));
}

exports.acceptoffer = (req,res,next) => {
    let offerid = req.params.id;
    offerModel.findByIdAndUpdate(offerid,{status:false},{useFindAndModify: false})
    .then(offer => {
        Promise.all([model.findByIdAndUpdate(offer.requested,{status:'Traded'},{useFindAndModify: false}),
        model.findByIdAndUpdate(offer.tradingItem,{status:'Traded'},{useFindAndModify: false})])
        .then(results=>{
            res.redirect('/users/profile');
        })
        .catch(err=>next(err));
    })
    .catch(err=>next(err));
}