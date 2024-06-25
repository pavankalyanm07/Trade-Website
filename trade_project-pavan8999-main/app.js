//require modules
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const mainroute = require('./routes/mainroute');

const traderoute = require('./routes/traderoute');
const userRoute = require('./routes/userRoute');


const app = express();

let port = 3500;
let host = 'localhost';
app.set('view engine', 'ejs');

//Integrating the database
mongoose.connect('mongodb://localhost:27017/maptrade',
    {useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
    //start the server
    app.listen(port,host,()=> {
        console.log('server is running on the port', port);
    });
})
.catch(err=>console.log(err.message));


//mount middleware
app.use(
    session({
        secret: "jhaskjdfhchldfnbhdabcnmlmkj",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/maptrade'}),
        cookie: {maxAge: 60*60*1000}
        })
);
app.use(flash());

app.use((req, res, next) => {
    //console.log(req.session);
    res.locals.user=req.session.user||null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});


app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));


//set up routes
app.get('/',(req,res)=> {
    res.render('index');
});


app.use('/',mainroute);
app.use('/trades',traderoute);
app.use('/users',userRoute);

app.use((req, res, next)=> {
    let err = new Error('The server cannot locate resource at ' + req.url);
    err.status = 404;
    next(err); 
});


app.use((err, req, res, next)=>{
    console.log(err.stack);
    if(!err.status){
    err.status = 500;
    err.message = ("Internal Server Error");
   }
   res.status(err.status);
   res.render('error', {error: err});
});