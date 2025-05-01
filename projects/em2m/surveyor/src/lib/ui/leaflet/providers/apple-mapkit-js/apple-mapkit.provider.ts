import * as L from 'leaflet';
import {LayerDefinition, LayerProvider} from '../../leaflet.model';
import {Injectable} from '@angular/core';
import {AppConfig} from '../../../../core/config/config.service';
import 'apple-mapkit-js';
import 'leaflet.mapkitmutant';
import {ContextService} from '../../../../core/extension/context.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {AppleMapkitLoaderService} from './apple-mapkit-loader.service';
import {Surveyori18nService} from "../../../i18n/shared/i18n.service";

@Injectable()
export class AppleMapkitProvider extends LayerProvider {

  config: any;

  constructor(private appConfig: AppConfig,
              private ctx: ContextService,
              private i18nService: Surveyori18nService/*, private appleMaps: AppleMapkitLoaderService*/) {
    super();
  }

  provide(): Array<LayerDefinition> | Observable<Array<LayerDefinition>> {
    this.resolveProvider(this.appConfig, this.ctx);

    if (this.mapProvider === 'apple') {
      const accessToken = this.mapConfig.appleKey || this.mapConfig.token;

      //return this.appleMaps.loadApi().pipe(
      //  map(() => {
          const streetsLayer = {
            label: this.i18nService.translate('Streets'),
            enLabel: 'Streets',
            layer: (L as any).mapkitMutant({
              type: 'standard',
              minZoom: 3,
              authorizationCallback: (done) => done(accessToken)
            })
          } as LayerDefinition;
          /*
          const hybridLayer = {
            label: 'Hybrid',
            layer: (L as any).mapkitMutant({
              type: 'hybrid',
              minZoom: 3,
              authorizationCallback: (done) => done(accessToken)
            })
          } as LayerDefinition;
          */
          const satelliteLayer = {
            label: this.i18nService.translate('Satellite'),
            enLabel: 'Satellite',
            layer: (L as any).mapkitMutant({
              type: 'hybrid',
              minZoom: 3,
              authorizationCallback: (done) => done(accessToken)
            })
          } as LayerDefinition;

          return [satelliteLayer, streetsLayer];
      //  })
      //);
    } else {
      return [];
    }
  }
}
