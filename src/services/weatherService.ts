import type { WeatherKind, WeatherSnapshot } from "../types";

function mapCode(code: number): { kind: WeatherKind; description: string } {
  if (code === 0) return { kind: "clear", description: "맑음" };
  if ([1, 2, 3].includes(code)) return { kind: "cloudy", description: "구름" };
  if ([45, 48].includes(code)) return { kind: "fog", description: "안개" };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { kind: "rain", description: "비" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { kind: "snow", description: "눈" };
  if ([95, 96, 99].includes(code)) return { kind: "storm", description: "뇌우" };
  return { kind: "cloudy", description: "흐림" };
}

export async function fetchWeather(latitude: number, longitude: number, locationLabel: string): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m",
    hourly: "temperature_2m,weather_code,precipitation_probability",
    daily: "temperature_2m_max,temperature_2m_min,sunrise,sunset",
    timezone: "auto",
    forecast_days: "2",
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) throw new Error(`Weather API ${response.status}`);
  const data = await response.json();
  const currentTime = data.current?.time as string;
  const currentHour = typeof currentTime === "string" ? currentTime.slice(0, 13) : "";
  const currentIndex = Array.isArray(data.hourly?.time) ? Math.max(0, data.hourly.time.findIndex((value: string) => value.slice(0, 13) === currentHour)) : 0;
  const hourly = (data.hourly?.time ?? []).slice(currentIndex, currentIndex + 8).map((time: string, offset: number) => {
    const index = currentIndex + offset;
    return {
      time,
      temperature: Math.round(data.hourly.temperature_2m[index]),
      weatherCode: data.hourly.weather_code[index],
      precipitationProbability: data.hourly.precipitation_probability[index] ?? 0,
    };
  });
  const code = data.current.weather_code ?? 3;
  const mapped = mapCode(code);
  return {
    locationLabel,
    latitude,
    longitude,
    temperature: Math.round(data.current.temperature_2m),
    apparentTemperature: Math.round(data.current.apparent_temperature),
    high: Math.round(data.daily.temperature_2m_max[0]),
    low: Math.round(data.daily.temperature_2m_min[0]),
    humidity: Math.round(data.current.relative_humidity_2m),
    windSpeed: Math.round(data.current.wind_speed_10m),
    weatherCode: code,
    kind: mapped.kind,
    description: mapped.description,
    precipitationProbability: hourly[0]?.precipitationProbability ?? 0,
    hourly,
    updatedAt: new Date().toISOString(),
  };
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("이 기기에서는 위치 기능을 사용할 수 없습니다."));
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 });
  });
}
