var common;
(function (common) {
    var services;
    (function (services) {
        class BaseSrv {
            /**
             * @param {angular.IHttpService}    $http
             * @param {string}                  name                    Nombre del servicio
             * @param {object}                  [config]                Configuración del servicio
             * @param {number}                  [config.timeout=120000] Timeout de las peticiones
             * @constructor
             */
            constructor($http, name, config = { timeout: 120000 }) {
                this.$http = $http;
                this.name = name;
                this.config = config;
            }
            /**
             * @description Parsea los datos tras recibirse y antes de resolverse la promesa
             * @param method        Nombre del método del servicio invocado
             * @param data          Datos recibidos del servidor
             * @returns {*}
             */
            _parseResult(method, params, data) {
                return data;
            }
            ;
            /**
             * @description Invocado al finalizarse satisfactoriamente la petición. Parsea los datos y resuelve la promesa
             * @param data
             * @param code
             * @param f
             * @param xhr
             * @protected
             */
            _onSuccess(response) {
                let { config, data, headers, status, statusText } = response;
                let _data = config._data, instance = _data.instance;
                data = instance._parseResult(_data.method, (_data.params || _data.data), data);
                if (_data.context) {
                    _data.deferred.resolveWith(_data.context, [data, _data.shared]);
                }
                else {
                    _data.deferred.resolve(data, _data.shared);
                }
            }
            ;
            /**
             * @description Invocado al finalizarse la petición con error. Resuelve la promesa
             * @param message
             * @param error
             * @param f
             * @param xhr
             * @protected
             */
            _onError(response) {
                let { config, data, headers, status, statusText } = response;
                let _data = config._data, instance = _data.instance;
                if (_data.context) {
                    _data.deferred.rejectWith(_data.context, [{ message: statusText, error: status }, _data.shared]);
                }
                else {
                    _data.deferred.reject({ message: statusText, error: status }, _data.shared);
                }
            }
            ;
            /**
             * @description Genera una petición delete
             * @param method                Nombre dado al método del servicio
             * @param url                   Url a invocar
             * @param data                  Datos a enviar al servidor
             * @param [config]              Configuración para la petición. Acepta
             * @param [config.context]      Contexto con el que resolver la promsea. Dentro del callback el contexto se podrá acceder mediante el uso de this
             * @param [config.share]       Datos a pasar al callback
             * @returns {*}
             * @protected
             */
            _makeDelete(method, url, data, config) {
                return this._makeRequest(method, "DELETE", url, data, config);
            }
            ;
            /**
             * @description Genera una petición post
             * @param method                Nombre dado al método del servicio
             * @param url                   Url a invocar
             * @param data                  Datos a enviar al servidor
             * @param [config]              Configuración para la petición. Acepta
             * @param [config.context]      Contexto con el que resolver la promsea. Dentro del callback el contexto se podrá acceder mediante el uso de this
             * @param [config.share]       Datos a pasar al callback
             * @returns {*}
             * @protected
             */
            _makePost(method, url, data, config) {
                return this._makeRequest(method, "POST", url, data, config);
            }
            ;
            /**
             * @description Genera una petición put
             * @param method                Nombre dado al método del servicio
             * @param url                   Url a invocar
             * @param data                  Datos a enviar al servidor
             * @param [config]              Configuración para la petición. Acepta
             * @param [config.context]      Contexto con el que resolver la promsea. Dentro del callback el contexto se podrá acceder mediante el uso de this
             * @param [config.share]       Datos a pasar al callback
             * @returns {*}
             * @protected
             */
            _makePut(method, url, data, config) {
                return this._makeRequest(method, "PUT", url, data, config);
            }
            ;
            /**
             * @description Genera una petición get
             * @param method                Nombre dado al método del servicio
             * @param url                   Url a invocar
             * @param data                  Datos a enviar al servidor
             * @param [config]              Configuración para la petición. Acepta
             * @param [config.context]      Contexto con el que resolver la promsea. Dentro del callback el contexto se podrá acceder mediante el uso de this
             * @param [config.share]       Datos a pasar al callback
             * @returns {*}
             * @protected
             */
            _makeGet(method, url, data, config) {
                return this._makeRequest(method, "GET", url, data, config);
            }
            ;
            /**
             * @description Genera una petición del tipo indicado
             * @param method                Nombre dado al método del servicio
             * @param type                  Tipo de petición entre GET, POST, PUT, DELETE
             * @param url                   Url a invocar
             * @param data                  Datos a enviar al servidor
             * @param [config]              Configuración para la petición. Acepta
             * @param [config.context]      Contexto con el que resolver la promsea. Dentro del callback el contexto se podrá acceder mediante el uso de this
             * @param [config.share]       Datos a pasar al callback
             * @returns {*}
             * @protected
             */
            _makeRequest(method, type, url, data, config) {
                config = config || {};
                let deferred = $.Deferred();
                let req = {
                    method: type,
                    url: url,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    _data: null
                };
                if (type == "GET") {
                    req.params = data;
                }
                else {
                    req.data = data;
                }
                req._data = {
                    method: method,
                    instance: this,
                    params: data,
                    context: config.context,
                    deferred: deferred,
                    shared: config.share
                };
                //noinspection TypeScriptValidateTypes
                this.$http(req).then(this._onSuccess, this._onError);
                return deferred.promise();
            }
            ;
        }
        BaseSrv.ERROR_CODES = {
            "invalid": 0,
            "resourceNotFound": 10,
            "unknow": 20,
            "badRequest": 400,
            "notAuthorized": 401,
            "notFound": 404,
            "timeout": 408,
            "entityToLarge": 413,
            "methodNotAllowed": 415,
            "tooManyRequests": 429,
            "error": 500,
            "notAvailable": 503
        };
        services.BaseSrv = BaseSrv;
    })(services = common.services || (common.services = {}));
})(common || (common = {}));
