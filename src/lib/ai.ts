import type { WardrobeItem } from './supabase';

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
}

const STYLE_RULES = {
  formal: ['dress-shirt', 'blazer', 'slacks', 'dress-shoes', 'suit'],
  casual: ['t-shirt', 'jeans', 'sneakers', 'hoodie', 'jacket'],
  business: ['button-up', 'slacks', 'blazer', 'loafers', 'dress'],
  sporty: ['athletic', 'joggers', 'sneakers', 'tank', 'shorts'],
  date: ['dress', 'blouse', 'nice-top', 'heels', 'dress-shoes'],
};

const WEATHER_RULES = {
  cold: { maxTemp: 50, preferredSeasons: ['fall', 'winter', 'all-season'] },
  mild: { minTemp: 50, maxTemp: 70, preferredSeasons: ['spring', 'fall', 'all-season'] },
  warm: { minTemp: 70, preferredSeasons: ['spring', 'summer', 'all-season'] },
  hot: { minTemp: 85, preferredSeasons: ['summer', 'all-season'] },
};

const COLOR_COMBINATIONS = {
  complementary: [
    ['blue', 'orange'],
    ['red', 'green'],
    ['yellow', 'purple'],
  ],
  analogous: [
    ['blue', 'green', 'teal'],
    ['red', 'orange', 'pink'],
    ['purple', 'pink', 'red'],
  ],
  neutral: ['black', 'white', 'gray', 'beige', 'navy', 'brown'],
};

function getWeatherCategory(temp: number): keyof typeof WEATHER_RULES {
  if (temp < 50) return 'cold';
  if (temp < 70) return 'mild';
  if (temp < 85) return 'warm';
  return 'hot';
}

function calculateColorScore(colors: string[]): number {
  const neutralCount = colors.filter(c => COLOR_COMBINATIONS.neutral.includes(c.toLowerCase())).length;

  if (neutralCount >= 2) return 0.9;

  for (const [color1, color2] of COLOR_COMBINATIONS.complementary) {
    if (colors.some(c => c.toLowerCase().includes(color1)) &&
        colors.some(c => c.toLowerCase().includes(color2))) {
      return 0.85;
    }
  }

  return 0.7;
}

function calculateStyleScore(items: WardrobeItem[], occasion: string): number {
  const occasionTags = STYLE_RULES[occasion as keyof typeof STYLE_RULES] || STYLE_RULES.casual;

  let matchCount = 0;
  items.forEach(item => {
    const itemTags = item.style_tags.map(t => t.toLowerCase());
    const nameWords = item.name.toLowerCase().split(' ');

    if (occasionTags.some(tag =>
      itemTags.includes(tag) || nameWords.some(word => word.includes(tag))
    )) {
      matchCount++;
    }
  });

  return matchCount / items.length;
}

function calculateWeatherScore(items: WardrobeItem[], weather: WeatherData): number {
  const category = getWeatherCategory(weather.temp);
  const weatherRule = WEATHER_RULES[category];

  const seasonMatches = items.filter(item =>
    weatherRule.preferredSeasons.includes(item.season)
  ).length;

  return seasonMatches / items.length;
}

function hasRequiredCategories(items: WardrobeItem[]): boolean {
  const categories = items.map(item => item.category);
  const hasTop = categories.includes('tops') || categories.includes('outerwear');
  const hasBottom = categories.includes('bottoms');

  return hasTop && hasBottom;
}

export function generateOutfitSuggestions(
  wardrobeItems: WardrobeItem[],
  occasion: string,
  weather?: WeatherData
): Array<{ items: WardrobeItem[]; score: number; reason: string }> {
  const suggestions: Array<{ items: WardrobeItem[]; score: number; reason: string }> = [];

  const tops = wardrobeItems.filter(item =>
    item.category === 'tops' || item.category === 'outerwear'
  );
  const bottoms = wardrobeItems.filter(item => item.category === 'bottoms');
  const shoes = wardrobeItems.filter(item => item.category === 'shoes');
  const accessories = wardrobeItems.filter(item => item.category === 'accessories');

  for (const top of tops) {
    for (const bottom of bottoms) {
      const outfit: WardrobeItem[] = [top, bottom];

      if (shoes.length > 0) {
        outfit.push(shoes[Math.floor(Math.random() * shoes.length)]);
      }

      if (accessories.length > 0 && Math.random() > 0.5) {
        outfit.push(accessories[Math.floor(Math.random() * accessories.length)]);
      }

      if (!hasRequiredCategories(outfit)) continue;

      const colors = outfit.map(item => item.color);
      const colorScore = calculateColorScore(colors);
      const styleScore = calculateStyleScore(outfit, occasion);
      const weatherScore = weather ? calculateWeatherScore(outfit, weather) : 0.8;

      const totalScore = (colorScore * 0.3 + styleScore * 0.4 + weatherScore * 0.3);

      const reasons: string[] = [];
      if (styleScore > 0.6) reasons.push(`Perfect for ${occasion}`);
      if (weatherScore > 0.7 && weather) reasons.push(`Suitable for ${Math.round(weather.temp)}°F`);
      if (colorScore > 0.8) reasons.push('Great color combination');

      suggestions.push({
        items: outfit,
        score: totalScore,
        reason: reasons.join(' • ') || 'Good outfit choice',
      });

      if (suggestions.length >= 20) break;
    }
    if (suggestions.length >= 20) break;
  }

  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

export async function fetchWeather(location: string): Promise<WeatherData | null> {
  try {
    const geocodeResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`
    );
    
    if (!geocodeResponse.ok) return null;
    
    const geocodeData = await geocodeResponse.json();
    
    if (!geocodeData.results || geocodeData.results.length === 0) return null;
    
    const { latitude, longitude } = geocodeData.results[0];

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit`
    );

    if (!response.ok) return null;

    const data = await response.json();
    const weatherCode = data.current_weather.weathercode;

    let condition = 'clear';
    if (weatherCode >= 61 && weatherCode <= 67) condition = 'rainy';
    else if (weatherCode >= 71 && weatherCode <= 77) condition = 'snowy';
    else if (weatherCode >= 80 && weatherCode <= 82) condition = 'stormy';
    else if (weatherCode >= 45 && weatherCode <= 48) condition = 'foggy';
    else if (weatherCode >= 51 && weatherCode <= 57) condition = 'drizzle';

    return {
      temp: data.current_weather.temperature,
      condition,
      humidity: 50,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}
