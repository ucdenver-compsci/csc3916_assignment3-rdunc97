/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */
require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'need user and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'created new user successfully.'})
        });
    }
});


router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});



router.post('/movies', authJwtController.isAuthenticated, function(req, res){
    if (!req.body.title || !req.body.releaseDate || !req.body.genre || !req.body.actors) {
        res.status(400).json({
            success: false,
            msg: "provide title, name, genre and 3 actors."
        });
    }
        else{
            var movie = new Movie();
            movie.title = req.body.title;
            movie.releaseDate = req.body.releaseDate;
            movie.genre = req.body.genre;
            movie.actors = req.body.actors;

            movie.save(function(err){
                if (err){
                    res.status(401).json({success: false, msg: "couldn't save movie."});
                }
                else{
                    res.json({success: true, msg: "Movie saved successfully."});
                }
            });
        }
});



router.get('/movies', authJwtController.isAuthenticated, function(req,res){
    Movie.find({}, function(err, movies){
        if (err) {
            return res.status(500).send(err);
        }else{
        res.json(movies);
        }
    });
});

router.get('/movies/:movieParameter',authJwtController.isAuthenticated, function(req, res){
    Movie.findOne({title: req.params.movieParameter}, function(err, movie){
        if (err) res.status(500).send(err);
        else if (!movie) res.status(404).json({msg:"Movie not found."});
        else res.json(movie);
    });
});



router.put('/movies/:movieParameter', authJwtController.isAuthenticated, function(req, res){
    Movie.findOneAndUpdate({title: req.params.movieParameter}, req.body,{new: true},function(err, movie){
        if(err) res.status(500).send(err);
        else if (!movie) res.status(404).json({msg: "Movie not found."});
        else res.json(movie);
    });
});



router.delete('/movies/:movieParameter', authJwtController.isAuthenticated, function(req, res){
    Movie.findOneAndDelete({title: req.params.movieParameter}, function(err, movie){
        if(err) res.status(500).send(err);
        else if (!movie) res.status(500).json({msg: "Movie not found."});
        else res.json({message: 'Movie successfully deleted.'});
    });
});

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only