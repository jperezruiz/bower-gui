import {SocketIO} from "@types/socket.io-client";
import {IOperationResult} from "../../backend/bower/BowerManager";
module bowergui {
    'use strict';
    /**
     * @module bowergui
     * @description Módulo principal
     */
    export let bowerguiModule = angular.module("bowergui",
        [
            'Localizer',
            'ngAnimate',
            'ngMessageFormat',
            'ui.router',
            'ngSanitize',
            'pascalprecht.translate',
            'ngMaterial',
            'Toast'
        ]);

    bowerguiModule.run(function ($rootScope,
                                 $state,
                                 $stateParams,
                                 $translate,
                                 $q,
                                 localizerSrv,
                                 ToastPrv) {
        let glToParams,
            glToState,
            removeStateChangeListener;
        //load user
        let langPromise = localizerSrv.use("es"),//se solicita el idioma
            processLangDeferred = $q.defer();//gestionamos los posibles errores en la obtención del idioma
        langPromise.then(function(result){
            removeStateChangeListener();//eliminar listener que impide la navegación
            $state.go(glToState.name,glToParams);
        },function(result){
            //si no se carga el idioma indicado mostramos un error
            ToastPrv.open({
                message:"Error"
            })
            $translate(["AUDIOVISUAL.COMMON.ERRORS.CAN_NOT_LOAD_LANGUAGES"]).then(function(messages){
            });
            //en caso de no poder cargarse el idioma seleccionado, se carga uno por defecto
            processLangDeferred.resolve(result.lang);
        });
        removeStateChangeListener = $rootScope.$on("$stateChangeStart",function(event, toState, toParams, fromState, fromParams){
            //wait for load user and language
            event.preventDefault();
            glToParams = toParams;
            glToState = toState;
        });

    });
    bowerguiModule.config(['$translateProvider', function($translateProvider) {
        $translateProvider.useLoader("localizerPrv",{});//se establece el provider para la carga de $translate
        $translateProvider.useSanitizeValueStrategy('escape');
    }]);
}