import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Hero } from '../models/hero';
import { Recipe } from '../models/recipe';

@Injectable({
  providedIn: 'root'
})
export class DataService implements InMemoryDbService {

  constructor() { }

  createDb() {
    const recipes: Recipe[] = [
      {
        id: 1,
        title: 'Seaman Cap',
        ingredients: "",
        tags: "",
        imageUrl: "",
        cookingTime: 1,
        prepTime: 20,
        yield: 1,
        steps: "string",
        rating: 4,
      },
      {
        id: 2,
        title: 'Seaman Cap',
        ingredients: "",
        tags: "",
        imageUrl: "",
        cookingTime: 1,
        prepTime: 20,
        yield: 1,
        steps: "string",
        rating: 4,
      },
      {
        id: 3,
        title: 'Seaman Cap',
        ingredients: "",
        tags: "",
        imageUrl: "",
        cookingTime: 1,
        prepTime: 20,
        yield: 1,
        steps: "string",
        rating: 4,
      }
    ];
    const heroes: Hero[] = [
      {
        id: 1,
        name: "Hero 1",
        type: "Common",
        level: 3,
        imageUrl: "",
      },
      {
        id: 2,
        name: "Hero 2",
        type: "Common",
        level: 3,
        imageUrl: "",
      }
    ];
    return {
      recipes,
      heroes,
    };
  }
}
