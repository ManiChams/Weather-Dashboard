import fs from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';
// TODO: Define a City class with name and id properties
class City {
  name: string;
  id: string;

  constructor (
    name: string,
    id: string
  )
  {
    this.name = name;
    this.id = id;
  }
}
// TODO: Complete the HistoryService class
class HistoryService {
    // TODO: Define a read method that reads from the searchHistory.json file
  // private async read() {}
    private async read() {
    return await fs.readFile('api/weather/history/searchHistory.json', {
      flag: 'a+',
      encoding: 'utf8',
    });
  }

  // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]) { 
    return await fs.writeFile('db/db.json', JSON.stringify(cities, null, '\t'));
  }

  async getCities() {
      return await this.read().then((cities) => {
      let parsedCities: City[];
  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
      // If states isn't an array or can't be turned into one, send back a new empty array
      try {
        parsedCities = [].concat(JSON.parse(cities));
      } catch (err) {
        parsedCities = [];
      }
      
      return parsedCities;
    });
    }
  

  // TODO Define an addCity method that adds a city to the searchHistory.json file
  async addCity(city: string) {
    if (!city) {
      throw new Error('city cannot be blank');
    }
    const newCity: City = { name: city, id: uuidv4() };
    return await this.getCities()
      .then((cities: any) => {
        if (cities.find((index: any) => index.name === city)) {
          return cities;
        }
        return [...cities, newCity];
      })
      .then((updatedCities : any) => this.write(updatedCities))
      .then(() => newCity);
  }
  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  // async removeCity(id: string) {
  //       return await this.getCities()
  //     .then((cities: any) => cities.filter((city: any) => city.id !== id))
  //     .then((filteredStates: any) => this.write(filteredStates));
  // }
}

export default new HistoryService();