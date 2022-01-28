
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring'); // Qs
var cookieParser = require('cookie-parser');

var client_id = ''; // Your client id
var client_secret = ''; // Your secret
var redirect_uri = ''; // Your redirect uri

var exec = require('child_process').exec, child;
var nodemailer = require('nodemailer');
var moveFile = require('move-file');
var fs = require('fs');
var fc = require('fs-extra');
var path = require('path');
var archiver = require('archiver');
var zipper = require('zip-local');
var lienUser;

/**
 *   Generates a random string containing numbers and letters
 *   @param  {number} length The length of the string
 *   @return {string} The generated string
 */
var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());


app.get('/login', function(req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});


app.get('/callback', function(req, res) {

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {

        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));

    } else {
        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function(error, response, body) {

            if (!error && response.statusCode === 200) {

                var access_token = body.access_token,
                    refresh_token = body.refresh_token;

                var options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };
                // use the access token to access the Spotify Web API
                request.get(options, function(error, response, body) {
                    console.log(body);
                });
                res.redirect('/#' +
                    querystring.stringify({
                        access_token: access_token,
                        refresh_token: refresh_token
                    }));

            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
    }
});

app.get('/refresh_token', function(req, res) {

    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {

        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }});
});

app.get('/dlplaylist', function(req, res) {

    var refresh_token = req.query.refresh_token;
    var authOptions = {

        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    var mail = req.query.mail;

    var urlSpotify = req.query.uri;

    var numPlaylist = generateRandomString(25);

    const { exec } = require('child_process');

    // Creation d'un fichier qui est dans le repertoire courant.
    // Le fichier contient la liste des musiques sous le format :
    // https://open.spotify.com/track/5csnxERQgKm1eAEvJI7NRw
    // La commande exec crée un processus fils et lance la commande spotdl.

    // Cretaion du repertoire

    exec('mkdir ./playlists/'+numPlaylist, (err, stdout, stderr) => {
        if (err) {
            //some err occurred
            console.error(err)
            // Gérer le cas ou il y a une erreur..
        } else {
            // the *entire* stdout and stderr (buffered)
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        }
    });

    exec('spotdl '+urlSpotify+' --output ./playlists/'+numPlaylist, (err, stdout, stderr) => {
        if (err) {

            console.error(err)
            // Traiter le cas avec une erreur.

        } else {
            console.log(urlSpotify)
            // the *entire* stdout and stderr (buffered)
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);

            reponseBash = `${stderr}`;
            console.log(reponseBash);

            createZip(numPlaylist);
            envoyerMail();


            const { exec } = require('child_process');
            exec('rm -rf ./playlists/'+numPlaylist, (err, stdout, stderr) => {

                if (err) {
                    //some err occurred
                    console.error(err)
                } else {
                    // the *entire* stdout and stderr (buffered)
                    console.log(`stdout: ${stdout}`);
                    console.log(`stderr: ${stderr}`);
                }
            });


        }

        function createZip(fileName){

            var nameZip = generateRandomString(25);

            zipper.sync.zip('./playlists/'+fileName).compress().save('./public/'+nameZip+'.zip');

            lienUser=nameZip;
        }

        function envoyerMail(){

            var transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: '',
                    pass: ''
                }
            });

            console.log(mail)

            var mailOptions = {
                from: 'spotifyappdl@gmail.com',
                to: mail,
                subject: 'spotifyappdl votre télèchargement est prêt ! ',
                text: 'Votre télèchargement est prêt ! Voici le lien ! localhost:8888/'+lienUser+'.zip',
            };

            transporter.sendMail(mailOptions, function(error, info){

                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                    console.log(lienUser);
                }
            })

            transporter.close();
        }

    });

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            res.send({
                'access_token': access_token,
                'urlSpotify':urlSpotify,
            });
        }});
});

console.log('Listening on 8888');
app.listen(8888);

