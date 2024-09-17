import { Router, Request, Response } from 'express';
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

const router = Router();
const weatherService = new WeatherService();

// POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response): Promise<Response | undefined> => { 
  
  const { city } = req.body;
  if (!city) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    // GET weather data from city name
    const weatherData = await weatherService.getWeatherForCity(city);

    // Save city to search history
    const savedCity = await HistoryService.addCity(city);

    // Send combined response
    return res.json({ message: 'Weather successfully retrieved', weatherData, savedCity });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err); // Return the response directly
  }
});

export default router;