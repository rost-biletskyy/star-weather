import OpenWeather from '@/lib/OpenWeather';
import type { WeatherType } from '@/types/WeatherType';
import { isAxiosError } from 'axios';
interface Params {
    lat: number;
    lon: number;
}

const fetchWeather = async ({ lat, lon }: Params): Promise<WeatherType> => {
    try {
        const [current, forecast] = await Promise.all([
            OpenWeather.get('data/2.5/weather', { params: { lat, lon } }),
            OpenWeather.get('data/2.5/forecast', { params: { lat, lon } }),
        ]);

        const getDewPoint = (temp: number, humidity: number): number => {
            const a = 17.27,
                b = 237.7;
            const alpha = (a * temp) / (b + temp) + Math.log(humidity / 100);
            return (b * alpha) / (a - alpha);
        };

        const currentData = current.data;
        const processedCurrent = {
            ...currentData,
            ...currentData.sys,
            ...currentData.main,
            uvi: 0,
            clouds: currentData.clouds.all,
            wind_deg: currentData.wind.deg,
            wind_speed: currentData.wind.speed,
            dew_point: getDewPoint(currentData.main.temp, currentData.main.humidity),
        };

        const hourlyData = forecast.data.list.slice(0, 24).map((item: any) => ({
            dt: item.dt,
            temp: item.main.temp,
            weather: item.weather,
        }));

        const dailyData = processDailyForecast(forecast.data.list, currentData);

        return {
            lat,
            lon,
            timezone: currentData.name,
            timezone_offset: currentData.timezone,
            current: processedCurrent,
            hourly: hourlyData,
            // @ts-ignore
            daily: dailyData,
        };
    } catch (error) {
        if (isAxiosError(error) && error?.response?.status === 404) {
            throw new Error('Weather not found for this city!');
        }
        throw new Error('Something went wrong! Please try again later.');
    }
};

const processDailyForecast = (forecastList: any[], currentWeather: any) => {
    const dailyMap = forecastList.reduce((acc: Record<string, any[]>, item: any) => {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
    }, {});

    const avg = (arr: number[]) => (arr.length ? arr.reduce((sum, val) => sum + val, 0) / arr.length : 0);

    return Object.entries(dailyMap).map(([date, items]) => {
        const temps = items.map(i => i.main.temp);
        const dayHours = items.filter(i => {
            const hour = new Date(i.dt * 1000).getHours();
            return hour >= 8 && hour <= 18;
        });
        const nightHours = items.filter(i => {
            const hour = new Date(i.dt * 1000).getHours();
            return hour < 8 || hour > 18;
        });

        const weatherMap = items.reduce((acc: Record<number, number>, i: any) => {
            const id = i.weather[0].id;
            acc[id] = (acc[id] || 0) + 1;
            return acc;
        }, {});
        const mainWeatherId = Object.entries(weatherMap).sort((a, b) => b[1] - a[1])[0][0];
        const mainWeather = items.find(i => i.weather[0].id === Number(mainWeatherId))?.weather[0];

        return {
            dt: new Date(date).getTime() / 1000,
            sunrise: currentWeather.sys.sunrise,
            sunset: currentWeather.sys.sunset,
            temp: {
                day: avg(dayHours.map(i => i.main.temp)),
                min: Math.min(...temps),
                max: Math.max(...temps),
                night: avg(nightHours.map(i => i.main.temp)),
            },
            wind_speed: avg(items.map(i => i.wind.speed)),
            wind_deg: currentWeather.wind.deg,
            wind_gust: Math.max(...items.map(i => i.wind.gust || 0)),
            weather: [mainWeather],
        };
    });
};

export default fetchWeather;
