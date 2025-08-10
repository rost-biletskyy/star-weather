import { FaCloud, FaLocationPin } from 'react-icons/fa6';
import type { Current } from '@/types/WeatherType';
import { FaClock, FaThermometerHalf } from 'react-icons/fa';
import { TbWorldLatitude, TbWorldLongitude } from 'react-icons/tb';
import type { City } from '@/types/CityType';
import { MdLocationPin } from 'react-icons/md';
import LocalDate from './LocalDate';

const OverView = ({ data, city }: { data: Current; city: City }) => {
    return (
        <div className="rounded-xl bg-gray-800 p-4 md:p-6">
            <div className="flex justify-between font-medium">
                <h3 className="text-sm md:text-base mb-3 text-gray-400">
                    <MdLocationPin className="inline-block" /> {city.name}, {city.country}
                </h3>
                <p className="text-xs md:text-sm uppercase text-gray-400">
                    <FaClock className="mr-1 inline-block" />
                    <LocalDate date={data.dt * 1000} />
                </p>
            </div>
            <div className="my-4 flex items-center justify-between">
                <div>
                    <h2 className="text-5xl font-medium md:text-6xl">{data.temp.toFixed(0)}°</h2>
                    <p className="mt-1 text-gray-400 text-sm md:text-base">
                        <FaThermometerHalf className="inline-block" /> Feels like: {data.feels_like.toFixed(1)}°
                    </p>
                </div>
                <img
                    src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`}
                    className="-my-8 size-28 md:-mx-4 md:size-36"
                />
            </div>
            <div className="mt-4 flex items-end gap-4 text-gray-400">
                <p className="mr-auto font-medium capitalize text-gray-300 text-sm md:text-xl">{data.weather[0].description}</p>
                <p className="text-xs hidden md:text-sm">Lat: {city.lat.toFixed(3)}°</p>

                <p className="text-xs hidden md:text-sm">Lon: {city.lon.toFixed(3)}°</p>
            </div>
        </div>
    );
};

export default OverView;
