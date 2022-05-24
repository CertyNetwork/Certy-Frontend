import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Hero, HeroFilter } from '../models/hero';

@Injectable({
  providedIn: 'root'
})
export class HerosService {
  heros$ = this.http.get<Hero[]>(`${environment.basePath}/heros`);
  private filterSubject = new BehaviorSubject<HeroFilter>({ name: '' });
  private filterAction$ = this.filterSubject.asObservable();
  filteredHeroes$ = combineLatest([this.heros$, this.filterAction$]).pipe(
    map(([heroes, filter]) => {
      return heroes.filter(hero => (!filter.name || hero.name.indexOf(filter.name) >= 0) && (!filter.level || hero.level === filter.level))
    })
  );

  constructor(
    private http: HttpClient
  ) { }
}
