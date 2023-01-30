var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var flash = require('express-flash');
var session = require('express-session');
var db = require('./database');

// Initial express instance 
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: '123456',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

// used to send notifications 
app.use(flash());

/* GET home page. */
// first endpoint to be called when loading the app
// renders the view apply 
app.get('/', function (req, res, next) {
    res.render('apply', { title: 'Apply' });
});
app.get('/login', function (request, res) {
    // Render login template
    res.render('login', { title: 'Admin' });
});

app.get('/registration', function (request, res) {
    // Render login template
    res.render('registration', { title: 'Registration' });
});

// This endpoint is used to store form data to the dabase
app.post('/apply', function (req, res, next) {
    var email = req.body.email;
    var name = req.body.name;
    var number = req.body.number;
    var expertise = req.body.expertise;
    var years_of_experience = req.body.years_of_experience;
    var apps_proficient = req.body.apps_proficient;
    var has_portfolio = req.body.has_portfolio;
    var portfolio_link = req.body.portfolio_link;

    //TODO Validate the incoming data 

    if (
        !email ||
        !name ||
        !number
    ) {
        throw Error('Invalid details')
    }

    // store the information

    var sql = `INSERT INTO interview_requests (email, name, number, expertise,years_of_experience, apps_proficient,has_portfolio, created_at) VALUES ("${email}", "${name}", "${number}", "${expertise}", "${years_of_experience}","${apps_proficient}",  "${has_portfolio}", NOW())`;
    //using the connection we initialzed here we execute the above sql
    db.query(sql, function (err, result) {
        if (err) throw err;
        console.log('record inserted');
        req.flash('success', 'Data added successfully!');
        res.redirect('/');
    });
});

app.post('/login', function (request, response) {
    // Capture the input fields
    let username = request.body.username;
    let password = request.body.password;
    // Ensure the input fields exists and are not empty
    if (username && password) {
        // Execute SQL query that'll select the account from the database based on the specified username and password
        db.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) throw error;
            // If the account exists
            if (results.length > 0) {
                // Authenticate the user
                request.session.loggedin = true;
                request.session.username = username;
                // Redirect to home page
                response.redirect('/users');
            } else {
                response.send('Incorrect Username and/or Password!');
            }
            response.end();
        });
    } else {
        response.send('6Please enter Username and Password!');
        response.end();
    }
});

app.post('/registration', function (request, response) {
    // Capture the input fields
    let username = request.body.username;
    let password = request.body.password;
    let email = request.body.email;
    // Ensure the input fields exists and are not empty
    if (!username || !password || !email) {
        response.send('Please enter Username, Password and email!');
        response.end();
    }
    // Execute SQL query that'll select the account from the database based on the specified username and password
    db.query('INSERT INTO admin (username, password, email) VALUES (?, ?, ?)', [username, password, email], function (error, results, fields) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        // If the account exists
            // Authenticate the user
            request.session.loggedin = true;
            request.session.username = username;
            // Redirect to home page
            response.redirect('/login');
    });
});

app.get('/users', function (req, res, next) {
    db.query('SELECT * FROM interview_requests ORDER BY created_at desc', function (err, rows) {
        if (err) {
            req.flash('error', err)
            res.render('user_list', { data: '' })
        } else {
            res.render('user_list', { data: rows })
        }
    })
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// port must be set to 3000 because incoming http requests are routed from port 80 to port 8080
app.listen(5000, function () {
    console.log('Node app is running on port 5000');
});

module.exports = app;