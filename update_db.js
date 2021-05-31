const City = require("./models/city.js");
const fetch = require("node-fetch");
const sstatistics = require("simple-statistics");


function getJSONArray(cityList){
    let jsonList = [];
    cityList.forEach(city => {
        jsonList.push(fetch(`http://api.openweathermap.org/data/2.5/weather?q=`+ city +`&appid=a0707bdd2f93262f6af5a8368132fefa`)
        .then(json => json.text()))
    });
    return Promise.all(jsonList)
}

var getCitiesInfo = function()
{   
    City.clearCities()
    .then(() =>
    {
        return getJSONArray(['Kiev', 'Lviv', 'Zhytomyr', 'Pervomaisk', 'Zhashkiv', 'Odesa',
                         'Uman', 'Chop', 'Poltava', 'Sumy', 'Kharkov', 'Kherson', 'Dnipro', 'Zaporizhia', 'Mykolaiv']);
    })
    .then(jsonList =>
    {
        console.log("Update DATABASE"); 
        jsonList.forEach(json =>{
            let obj = JSON.parse(json);
            City.insert(new City(obj.name, Date.now(), (obj.main.temp - 273.15).toFixed(1), obj.main.pressure, 
                    obj.main.humidity, obj.wind.speed));
        });
    });
    
}

module.exports.getCitiesInfo = getCitiesInfo;