import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { City } from 'src/types'
import { CACHE_KEY_PREFIX, CACHE_DEFAULT_TIME, message } from 'src/utils'
import * as cityData from 'src/data/cities.json'

@Injectable()
export class CityService {
  @Inject(CACHE_MANAGER) private readonly cacheManager: Cache

  // Get all cities
  async getAllCities(): Promise<City[]> {
    return cityData.cities
  }

  // Get city by name match
  async getCityByMatch(name: string): Promise<City[]> {
    if (!name) throw new NotFoundException(message.Not_Found)

    const cacheKey = `${CACHE_KEY_PREFIX}${name.toLowerCase()}`
    const cachedResult = await this.cacheManager.get<City[]>(cacheKey)
    if (cachedResult) return cachedResult

    const filteredCities = cityData.cities.filter((city) => city.name.toLowerCase().includes(name.toLowerCase()))
    if (filteredCities.length === 0) throw new NotFoundException(message.Not_Found)

    await this.cacheManager.set(cacheKey, filteredCities, CACHE_DEFAULT_TIME)
    return filteredCities
  }
}
