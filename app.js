const express = require('express');
const mustache = require('mustache-express');
const path = require('path');
const child_process = require('child_process');
const bodyParser = require('body-parser');
const busboyBodyParser = require('busboy-body-parser');
const mongoose = require('mongoose');
const sstatistics = require("simple-statistics")

const app = express();

const config = require('./config');

const cookieParser = require('cookie-parser');
const session = require('express-session');

const City = require("./models/city.js");

const viewsDir = path.join(__dirname, 'views');
app.engine("mst", mustache(path.join(viewsDir, "partials")));
app.set('views', viewsDir);
app.set('view engine', 'mst');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(busboyBodyParser({ limit: '5mb' }));

app.use(express.static('public'));

// new middleware
app.use(cookieParser());
app.use(session({
	secret: config.SecretString,
	resave: false,
	saveUninitialized: true
}));

const PORT = config.ServerPort;
const databaseUrl = config.DatabaseUrl;
const connectOptions = { useNewUrlParser: true};

mongoose.connect(databaseUrl, connectOptions)
    .then(() => console.log(`Database connected: ${databaseUrl}`))
    .then(() => app.listen(PORT, function() { console.log('Server is ready'); }))
    .catch(err => console.log(`Start error ${err}`));

const dbUpdate = require('./update_db');
dbUpdate.getCitiesInfo();
setInterval(dbUpdate.getCitiesInfo, 5000);

app.get('/backup', function(req, res)
{
    const pathToSave = path.join(__dirname, `./backup/backup.bson`);
    const command = `cd C:\\Program Files\\MongoDB\\Tools\\100\\bin & mongodump --host localhost:27017 -u "user" -pwd "user"  --db mydb --out ${pathToSave} `;
    child_process.exec(command);
    console.log(pathToSave)

    res.redirect('/peps?backup=successful');
});

app.get('/restore', function(req, res)
{
    City.clearCities()
    .then(() =>
    {
        const pathToRestore = path.join(__dirname, `./backup/backup.bson`);
        const command = `cd C:\\Program Files\\MongoDB\\Server\\4.4\\bin & mongorestore --host localhost:27017 -u "user" -pwd "user"  --db mydb ${pathToRestore} `;
        console.log(child_process.exec(command));
        res.redirect('/peps?restore=successful');
    });
});
app.get('/', function(req, res)
{
    res.redirect('/cities');
});

app.get('/peps', function(req, res)
{
    res.render('index', {});
});

app.get('/cities', function(req, res)
{
    City.getAllCities()
    .then(cities =>
    {
        cities.sort(function(a, b) {
            return (a.temperature).localeCompare(b.temperature);
        });

        let idx = 1;
        res.render('cities', { cities, "index": function() {return idx++;} });
    })
    .catch(err => res.status(500).send(err.toString()));
});

app.get('/data', function(req, res)
{
    City.getAllCities()
    .then(cities => 
    {
        let citiesArray = [];
        cities.map(value => citiesArray.push(value));
        citiesArray = [].concat.apply([], citiesArray);

        let weatherData = {temperature: [], humidity: [], pressure: [], windSpeed: []};
        for(let i = 0; i < citiesArray.length; i++)
        {
            let city = citiesArray[i];
            
            weatherData.temperature.push(parseFloat(city.temperature));
            weatherData.humidity.push(parseFloat(city.humidity));
            weatherData.pressure.push(parseFloat(city.pressure));
            weatherData.windSpeed.push(parseFloat(city.windSpeed));
        }

        let mode = { temperature: sstatistics.mode(weatherData.temperature), humidity: sstatistics.mode(weatherData.humidity), 
            pressure: sstatistics.mode(weatherData.pressure), windSpeed: sstatistics.mode(weatherData.windSpeed)};
        let median = { temperature: sstatistics.median(weatherData.temperature), humidity: sstatistics.median(weatherData.humidity), 
            pressure: sstatistics.median(weatherData.pressure), windSpeed: sstatistics.median(weatherData.windSpeed)};
        let idx = 1;
        res.render('charts', {mode, median, "index": function() {return idx++;}});
    })
    .catch(err => res.status(500).send(err.toString()));});

app.get('/allcities', function(req, res)
{
    City.getAllCities()
    .then(cities => 
    {
        res.send(cities);
    });
});
