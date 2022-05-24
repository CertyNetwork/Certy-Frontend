import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Recipe } from '../models/recipe';

const BASE_PATH = environment.basePath;

@Injectable({
  providedIn: 'root'
})
export class RecipesService {

  recipes$ = this.http.get<Recipe[]>(`${BASE_PATH}/recipes`);

  constructor(
    private http: HttpClient
  ) {
    console.log(`${BASE_PATH}/recipes`);
  }
}
