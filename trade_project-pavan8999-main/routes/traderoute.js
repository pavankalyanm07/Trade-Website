const express = require('express');
const tradecontroller = require('../controllers/tradecontroller');
const traderouter = express.Router();
const {isLoggedIn,isAuthor} = require('../middlewares/auth');
const {validateId,validateTrade,validateResult}=require('../middlewares/validator');


traderouter.get('/newTrade',isLoggedIn, tradecontroller.newPoster);

traderouter.get('/',tradecontroller.tradesList);

traderouter.get('/:id',validateId, tradecontroller.show);

traderouter.get('/:id/edit',validateId, isLoggedIn, isAuthor, tradecontroller.editPoster);

traderouter.put('/:id',validateId, isLoggedIn, isAuthor,validateTrade,validateResult, tradecontroller.updatePoster);

traderouter.delete('/:id',validateId, isLoggedIn, isAuthor, tradecontroller.deletePoster);

traderouter.post('/',isLoggedIn,validateTrade,validateResult, tradecontroller.createPoster);

traderouter.post("/:id/watch",validateId, isLoggedIn,tradecontroller.watchTrade)

traderouter.delete('/:id/unwatch',validateId, isLoggedIn,tradecontroller.unwatchTrade)

traderouter.get("/:id/trade",validateId,isLoggedIn,tradecontroller.tradeItemPage)

traderouter.post("/:id/offer",validateId,isLoggedIn,tradecontroller.tradeOffer)

traderouter.delete("/:id/canceloffer",validateId,isLoggedIn,tradecontroller.canceloffer);

traderouter.get("/:id/manageoffer",validateId,isLoggedIn,tradecontroller.manageoffer);

traderouter.put("/:id/acceptoffer",validateId,isLoggedIn,tradecontroller.acceptoffer);

module.exports = traderouter;