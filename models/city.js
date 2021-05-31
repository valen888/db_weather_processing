const mongoose = require('mongoose');

const CityShema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: String, required: true },
    temperature: { type: String, required: true },
    pressure: { type: String, required: true },
    humidity: { type: String, required: true },
    windSpeed: { type: String, required: true },
});


const CityModel = mongoose.model('city_weather', CityShema);

class City
{
    constructor(name, date, temperature, pressure, humidity, windSpeed)
    {
        this.name = name;
        this.date = date;
        this.temperature = temperature;
        this.pressure = pressure;
        this.humidity = humidity;
        this.windSpeed = windSpeed;
    }

    static getById(id)
    {
        return CityModel.findById({ _id: id});
    }

    static getByName(name)
    {
        return CityModel.findOne({ name: name});
    }

    static getSomething(query)
    {
        return CityModel.find({}).select(query);
    }
    
    static getAllCities()
    {
        return CityModel.find();
    }

    static insert(city)
    {
        return new CityModel(city).save();
    }

    static findByDate(date)
    {
        return CityModel.find({ date: date });
    }

    static clearCities()
    {
        return CityModel.deleteMany({});
    }
}

module.exports = City;