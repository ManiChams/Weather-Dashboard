import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
class Weather {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;

  constructor(temperature: number, description: string, humidity: number, windSpeed: number) {
    this.temperature = temperature;
    this.description = description;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
  }
}

// Helper function to make HTTP requests using https
const httpsGet = (url: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      // A chunk of data has been received.
      res.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received.
      res.on('end', () => {
        resolve(JSON.parse(data));
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

// Complete the WeatherService class
class WeatherService {
  private baseURL: string;
  private apiKey: string;
  private cityName: string;

  constructor() {
    this.baseURL = 'https://api.openweathermap.org/data/2.5';
    this.apiKey = process.env.WEATHER_API_KEY || '';
    this.cityName = '';
  }

  private async fetchLocationData(query: string): Promise<any> {
    const url = `${this.baseURL}/weather?q=${query}&appid=${this.apiKey}`;
    return httpsGet(url);
  }

  private destructureLocationData(locationData: any): Coordinates {
    return {
      lat: locationData.coord.lat,
      lon: locationData.coord.lon,
    };
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,hourly,alerts&appid=${this.apiKey}`;
  }

  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(this.cityName);
    return this.destructureLocationData(locationData);
  }

  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const url = this.buildWeatherQuery(coordinates);
    return httpsGet(url);
  }

  private parseCurrentWeather(response: any): Weather {
    const current = response.current;
    return new Weather(
      current.temp,
      current.weather[0].description,
      current.humidity,
      current.wind_speed
    );
  }

  private buildForecastArray(weatherData: any[]): Weather[] {
    return weatherData.map((data: any) => new Weather(
      data.temp.day,
      data.weather[0].description,
      data.humidity,
      data.wind_speed
    ));
  }

  async getWeatherForCity(city: string): Promise<{ current: Weather, forecast: Weather[] }> {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecast = this.buildForecastArray(weatherData.daily);
    return { current: currentWeather, forecast };
  }
}

export default WeatherService;