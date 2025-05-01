import {ActivatedRoute, Router, Routes, Route} from '@angular/router';
import {Injectable} from '@angular/core';
import {CardService} from '../card/card.service';
import {FilterUtils} from '../../core/extension/filters/filter.util';
import {Filter} from '../../core/extension/extension.model';
import {ContextService} from '../../core/extension/context.service';
import {Surveyori18nService} from "../i18n/shared/i18n.service";

@Injectable({ providedIn: 'root' })
export class TabsService {

  constructor(private router: Router,
              private contextService: ContextService,
              private cardService: CardService,
              private i18nService: Surveyori18nService) {
  }

  findTabs(activatedRoute: ActivatedRoute, routes: Routes, queryParams: any): Array<any> {
    const tabs = [];
    if (!routes) {
      // If custom routes were not provided, automatically use the child routes of the current route
      routes = activatedRoute.routeConfig.children;
    }

    if (routes) {
      routes.forEach((route: Route) => {
        if (!route.redirectTo) {
          if (!route.data) {
            route.data = {};
          }

          if (!route.data.hidden) {
            if (route.data.cardboardId) {
              const cards = this.cardService.findCards(route.data.cardboardId);
              if (cards.length === 0) {
                return;
              }
            }

            // Only add the tab if it passes all filter checks
            if (FilterUtils.isPermitted(this.contextService.getContext(), route.data.filters as Array<Filter>)) {
              tabs.push({
                title: this.i18nService.translate(route.data.title || route.path),
                path: `./${route.path}`,
                exact: route.path.trim().length === 0,
                queryParam: queryParams,
                icon: route.data.icon,
                id: route.data.id || null
              });
            }
          }
        }
      });
    }
    return tabs;
  }

  isTabActive(activatedRoute: ActivatedRoute, tab: any): boolean {
    /*
    let tabPath = tab.path.substring(1);
    if (tabPath.length === 1) {
      // Handle special case where route is simply "/"
      tabPath = "";
    }

    console.log("Active Route", this.router.routerState.snapshot.url);
    console.log("Ends With", activatedRoute.parent.snapshot.url.join('/') + tabPath);

    return this.router.routerState.snapshot.url.endsWith(activatedRoute.parent.snapshot.url.join('/') + tabPath);
    */
    return false;
  }
}
