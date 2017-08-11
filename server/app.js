var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var querystring = require('querystring');
var url = require('url');

// mysql connection
// var options = {
//     host: 'localhost',
//     port: 3306,
//     user: 'jjj',
//     password: '123456',
//     database: 'Security'
// };

// AWS RDS connection
var options = {
    host: 'facebook.ckpoq3z8cztf.us-west-2.rds.amazonaws.com',
    port: 3306,
    user: 'jjj',
    password: '22223333',
    database: 'Security',
    multipleStatements: true
};

var connection = mysql.createConnection(options);
var app = express();

connection.connect();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Constants
var InvalidInput = 'The input you provided is not valid';
var Success = 'The action was successful';


app.get('/', function (req, res) {
    res.send('GET request to the homepage')
});

/* Given the username and password, logs a user in */
app.post('/login', function (req, res) {
    //TODO
});

/* Logs a user out */
app.post('/logout', function (req, res) {
    //TODO
});

/* Given a new user's first name, last name, username, email address, relationship status, and password, adds the user to
 the system.
 */
app.post('/registerUser', function (req, res) {
    if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.username
        || !req.body.password) {
        res.json({
            message: InvalidInput
        });
    } else {
        connection.query('SELECT * FROM Users WHERE username = ?', req.body.username, function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.json({
                    message: err
                });
            } else if (rows.length > 0) {
                res.json({
                    message: "The username already exists, please enter another username."
                });
            } else {
                var user = [req.body.username, req.body.password, req.body.firstName, req.body.lastName, req.body.email];
                var sql = 'INSERT INTO Users (username, password, firstName, lastName, email) VALUES (?, ?, ?, ?, ?);';
                connection.query(sql, user, function (err, rows, fields) {
                    if (err) {
                        console.log(err);
                        res.json({
                            message: err
                        });
                    } else {
                        res.json({
                            message: Success
                        });
                    }
                })
            }
        });
    }
});

// Adds friendship relationship between username and friendName.
app.post('/addFriend', function (req, res) {
    if (!req.body.userName || !req.body.friendName) {
        res.json({message: InvalidInput});
    } else {
        var friendship = [req.body.userName, req.body.friendName];
        var sql = 'INSERT INTO Friends (username, friendName) VALUES(?, ?)';
        connection.query(sql, friendship, function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.json({
                    message: err
                });
            } else {
                res.json({
                    message: Success
                });
            }
        })
    }
});

// Removes friendship between user and friend //
app.post('/deleteFriend', function (req, res) {
    if (!req.body.userName || !req.body.friendName) {
        res.json({message: InvalidInput});
    } else {
        var friendship = [req.body.userName, req.body.friendName];
        var sql = 'DELETE FROM Friends WHERE username = ? AND friendName = ?;';
        connection.query(sql, friendship, function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.json({message: err});
            } else {
                friendship = [req.body.friendName, req.body.userName];
                connection.query(sql, friendship, function (err2, rows, fields) {
                    if (err2) {
                        console.log(err2);
                        res.json({message: err2});
                    } else {
                        res.json({message: Success});
                    }
                })

            }
        })
    }
});

// Given the username, deletes the user from the database
app.post('/deleteUser', function (req, res) {
    if (!req.body.username) {
        res.json({message: InvalidInput});
    } else {
        var sql = 'DELETE FROM Users WHERE username = ?';
        connection.query(sql, req.body.username, function (err, rows, fields) {
            if (err) {
                console.log(err);
                res.json({
                    message: err
                });
            } else {
                res.json({
                    message: Success
                });
            }
        })
    }
});


// Get all the users. Required admin privilege to run this function.
app.get('/getUser/:id', function (req, res) {
    var sql = 'SELECT * FROM Users where userID =' + req.params.id;
    console.log(sql);
    connection.query(sql, function(err, rows, fields) {
        if (err) {
            console.log(err);
            res.json({
                message: err
            });
        } else {
            res.json({
                message: Success,
                user: rows
            });
        }
    })
});

app.get('/test', function (req, res) {
    var sql = 'SELECT * FROM Users where userID = ' + req.params.id;
    console.log(sql);
    query= url.parse(req.url).query;
    //console.log('query' + query);
    var result = querystring.parse(query);
    console.log(result);
    res.send(result);
});

app.post('/getFriend', function (req, res) {
    if(!req.body.username) {
        res.json({message: InvalidInput});
    } else {
        var sql = 'SELECT friendName FROM Friends Where username = ?';
        connection.query(sql, req.body.username, function(err, rows, fields) {
            if (err) {
                console.log(err);
                res.json({
                    message: err
                });
            } else {
                res.json(rows);
            }
        })
    }
});

app.get('/getFriend/:username', function (req, res) {
    var sql = 'SELECT username, friendName FROM Friends Where username = \'' + req.params.username + '\'';
    connection.query(sql, function(err, rows, fields) {
        console.log(sql);
        if (err) {
            console.log(err);
            res.json({
                message: err
            });
        } else {
            res.send(rows);
        }
    })
})


module.exports = app;

app.listen(3000);
