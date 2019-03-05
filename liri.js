// Node Package
var dotenv = require('dotenv');
dotenv.config({path: './.env'});
var keys = require('./keys.js');
var fs = require('fs');
var axios = require('axios');
var moment = require('moment');
var inquirer = require('inquirer');
var Spotify = require('node-spotify-api');

// Spotify keys
var spotify = new Spotify(keys.spotify);
// =======================================================================================
var request;
var input;

// Runs immediately
inquirer
.prompt([
    {
        type: 'list',
        message: 'Hi! My name is Liri. Please choose one of the following:',
        choices: ['concert-this', 'spotify-this-song', 'movie-this', 'do-what-it-says'],
        name: 'request'
    }]
).then(function(inquirerResponse) {
    request = inquirerResponse.request;
    if (request === 'concert-this' || request === 'spotify-this-song' || request === 'movie-this') {
        promptSearchTerm();
    } else liri();
});

// Runs only if user selects to search 

function promptSearchTerm() {
    inquirer
    .prompt(
        {
            type: 'input',
            message: 'Enter search term:',
            name: 'searchTerm'
        }
    )
    .then(function(inquirerResponse){
        input = inquirerResponse.searchTerm;
        liri();
    });
}


function liri() {
    // Switch statement 
    switch (request) {
        case 'concert-this':
            getConcert();
        break;
        case 'spotify-this-song':
            getSong();
        break;
        case 'movie-this':
            getMovie();
        break;
        case 'do-what-it-says':
            random();
        break;
        case 'info-saved':
            getData();
        break;
        
        default:
            return;
        break;
    }
}

// Calls to BandsInTown API
function getConcert() {
    
    var queryURL = `https://rest.bandsintown.com/artists/${input}/events?app_id=codingbootcamp`;

    if (!input) queryURL = `https://rest.bandsintown.com/artists/Dada+Life/events?app_id=codingbootcamp`;

    axios.get(queryURL)
    .then(function(response){
        var concerts = response.data;
        if (!input) {
            console.log(`\nFuture concerts for Dada Life:\n`);
        } else {
            console.log(`\nFuture concerts for ${input}:\n`);
        }
        concerts.forEach(concert => {
            var artist = concert.lineup[0];
            var headline = `${artist} at ${concert.venue.name}`;
            console.log(headline);
            var location = '';
            if (concert.venue.region) {
                location = `Location: ${concert.venue.city} ~ ${concert.venue.region}`;
                console.log(location);
            } else {
                location = `Location: ${concert.venue.city}, ${concert.venue.country}`;
                console.log(location);
            }
            var date = moment(concert.datetime).format('MMM D YYYY h:mm a');
            console.log(`Date & Time (local): ${date}`);
            console.log(`${url}\n`);
            var concertDetails = [];
            concertDetails.push(artist);
            concertDetails.push(headline);
            concertDetails.push(location);
            concertDetails.push(date);
            concertDetails.push(`${url}\n`);

            fs.appendFile('./log.txt', ', ' + concertDetails, function(err){
                if (err) console.log(err);
            });
        });
    })
    .catch(function(error){
        console.log(`Error: ${error}`);
    });   
}
    
// Calls to Spotify API
function getSong() {


    if (!input) input = 'web developer';

   
    spotify.search({type: 'track', query: input})
    .then(function(response) {

        var title = response.tracks.items[0].name;
        var artist = `Artist: ${response.tracks.items[0].album.artists[0].name}`;
        var releaseDate = response.tracks.items[0].album.release_date;
        var album = `Album: ${response.tracks.items[0].album.name}`;
        var url = `URL: ${response.tracks.items[0].album.artists[0].external_urls.spotify}`;

        console.log(`\nThis is what I found about ${title}:\n`);   
        console.log(`Title: ${title}`);
        console.log(artist);
        if (releaseDate !== undefined) {
            var released = moment(releaseDate).format('MMM D YYYY');
            console.log(`Released: ${released}`);
        }
        console.log(album);
        console.log(`${url}\n`);

        // Array contents to be added to log.txt
        var songDetails = [title, artist, `Released: ${released}`, album, url];
        
        // adds input to log.txt
        fs.appendFile('./log.txt', ',' + songDetails, function(err){
            if (err) console.log(err);
        });
        })
        .catch(function(err) {
            console.log(err);
        });
}
     
// Calls to OMDB API
function getMovie() {

    var queryURL = `http://www.omdbapi.com/?apikey=trilogy&t=${input}`;

    if (!input) queryURL = "http://www.omdbapi.com/?apikey=trilogy&t=Mr.Nobody";
    
    // axios call to OMDB API
    axios.get(queryURL)
    .then(function(response){

        var title = response.data.Title;
        var year = `Released in: ${response.data.Year}`;
        var imdb = `${response.data.Ratings[0].Source} rating: ${response.data.Ratings[0].Value}`;
        var rottenTomato = `${response.data.Ratings[1].Source} rating: ${response.data.Ratings[1].Value}`;
        var country = `Produced in: ${response.data.Country}`;
        var language = `Language(s): ${response.data.Language}`;
        var plot = `Plot: ${response.data.Plot}`;
        var actors = `Featuring: ${response.data.Actors}\n`;

        console.log(`\nThis is what I found about ${title}:\n`);
        console.log(`Movie title: ${title}`);
        console.log(year);
        console.log(imdb);
        console.log(rottenTomato);
        console.log(country);
        console.log(language);
        console.log(plot);
        console.log(actors);
        var movieDetails = [title, year, imdb, rottenTomato, country, language, plot, actors];
 
        fs.appendFile('./log.txt', ',' + movieDetails, function(err){
            if (err) console.log(err);
        });
    })
    .catch(function(err){
        console.log(`Error: ${err}`);
    });   
}
    
function random() {
  
    fs.readFile('./random.txt', 'utf8', function(err, data) {
        if (err) throw err; // checking for error
   
        var dataArr = data.split(',');
 
        var randomNumIndex = Math.floor(Math.random() * 5);
     
        if (randomNumIndex % 2 !== 0 && randomNumIndex !== 4) {
            randomNumIndex++;
        }
       
        for (var i=0; i < dataArr.length; i++) {
            if (i === randomNumIndex) {
                request = dataArr[i];
                input = dataArr[i + 1];
            }
        }

        liri();
    });
}


function getData() {
    fs.readFile('./log.txt', 'utf8', function(err, data){
        if (err) throw err;
        if (!data) {
            console.log('\nSorry,I couldnt find anything.\n');
        } else {
            console.log('\nThis is your requested data:\n');
            var dataArr = data.split(',');
            dataArr.forEach(item => console.log(item));
        }
    });
}