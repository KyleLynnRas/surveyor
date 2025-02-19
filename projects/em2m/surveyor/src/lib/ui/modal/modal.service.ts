import {Injectable, Type, ComponentFactoryResolver, Injector, ViewContainerRef, ApplicationRef} from '@angular/core';
import {Modal} from './modal.component';
import {ModalOptions, ModalResult} from './modal.model';
import {CenterModalContainer} from './containers/center/center-modal-container.component';
import {Observable, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';
import {SideModalContainer} from './containers/side/side-modal-container.component';
import {InlineModalContainer} from './containers/inline/inline-modal-container.component';
import {ConfirmationModal} from './modals/confirmation-modal/confirmation-modal.component';
import {StatusModal} from './modals/status-modal/status-modal.component';
import {LoadingModal} from './modals/loading-modal/loading-modal.component';
import {FixedModalContainer} from './containers/fixed/fixed-modal-container.component';
import {AbsoluteModalContainer} from './containers/absolute/absolute-modal-container.component';
import {Surveyori18nService} from "../i18n/shared/i18n.service";

@Injectable()
export class ModalService {

  private rootViewContainerRef: ViewContainerRef = null;

  constructor(private resolver: ComponentFactoryResolver, private injector: Injector, private i18nService: Surveyori18nService) {
  }

  setRootViewContainerRef(rootViewContainerRef: ViewContainerRef) {
    this.rootViewContainerRef = rootViewContainerRef;
  }

  getRootViewContainerRef(): ViewContainerRef {
    return this.rootViewContainerRef;
  }

  open(modal: Type<Modal>, options?: ModalOptions): ModalResult {
    if (!options) {
      options = {};
    }

    let modalContainer = CenterModalContainer;
    if (options.type === 'side') {
      modalContainer = SideModalContainer;
    } else if (options.type === 'inline') {
      modalContainer = InlineModalContainer;
    } else if (options.type === 'fixed') {
      modalContainer = FixedModalContainer;
    } else if (options.type === 'absolute') {
      modalContainer = AbsoluteModalContainer;
    }
    let containerRef = options.elementRef;
    if (!containerRef) {
      containerRef = this.rootViewContainerRef;
    }
    if (!containerRef) {
      try {
        const applicationRef: ApplicationRef = this.injector.get(ApplicationRef);
        containerRef = applicationRef['_rootComponents'][0]['_hostElement'].vcRef;
      } catch (e) {
        throw new Error('RootViewContainerRef not initialized.  Call ModalService.setRootViewContainerRef() in AppComponent');
      }
    }

    let factory = this.resolver.resolveComponentFactory(modalContainer);
    let modalContainerRef = containerRef.createComponent(factory);
    modalContainerRef.instance.modal = modal;
    modalContainerRef.instance.options = options;

    // Automatically destroy the modal on a cancel action
    modalContainerRef.instance.onCancel.pipe(
      tap(() => {
        modalContainerRef.instance.dismiss();
        setTimeout(() => modalContainerRef.destroy(), 1000);
      })
    ).subscribe();

    return <ModalResult> {
      submit: modalContainerRef.instance.onSubmit,
      cancel: modalContainerRef.instance.onCancel,
      delete: modalContainerRef.instance.onDelete,
      dismiss: () => {
        modalContainerRef.instance.dismiss();
        setTimeout(() => modalContainerRef.destroy(), 1000);
      }
    };
  }

  confirm(message: string): Observable<boolean> {
    let options = <ModalOptions> {
      submitLabel: 'Yes',
      cancelLabel: 'No',
      params: { message: this.i18nService.translate(message) },
      type: 'center'
    };

    let confirmResponse = new Subject<boolean>();

    let modal = this.open(ConfirmationModal, options);
    modal.submit.subscribe((value: boolean) => {
      confirmResponse.next(value);
      modal.dismiss();
    });

    return confirmResponse.asObservable();
  }

  status(message: string): ModalResult {
    let options = <ModalOptions> {
      hideSubmit: true,
      hideCancel: true,
      params: { message: this.i18nService.translate(message) },
      type: 'center',
      width: 400
    };

    return this.open(StatusModal, options);
  }

  loading(message: string): ModalResult {
    let options = <ModalOptions> {
      hideSubmit: true,
      hideCancel: true,
      hideDelete: true,
      params: {
        message: this.i18nService.translate(message)
      },
      type: 'center',
      width: 450
    };

    return this.open(LoadingModal, options);
  }

  message(message: string) {
    let options = <ModalOptions> {
      hideSubmit: true,
      hideCancel: false,
      cancelLabel: 'OK',
      params: { message: this.i18nService.translate(message) },
      type: 'center'
    };

    let modal = this.open(ConfirmationModal, options);
    modal.submit.subscribe((value: boolean) => {
      modal.dismiss();
    });
  }
}
