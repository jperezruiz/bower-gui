import * as logger from "../utils/Logger";
import * as q from "q";
import * as fs from "fs";
export interface IError {
    code:string;
    message:string;
}
export interface IResult{
    error:boolean|IError;
    result:any;
}
export interface IUninstall{
    save?:boolean;
    saveDev?:boolean;
}
export interface IInstall{
    save?:boolean;
    saveDev?:boolean;
    forceLatest?:boolean;
    production?:boolean;
    saveExact?:boolean;

}
/**
 * @class BowerManager
 * @description Servicios de bower que otorgan la api rest
 */
export class BowerManager {
    protected logger;

    constructor(protected bower, protected fs) {
        this.logger = logger.getLogger("server");
    }
    public installAll(options){
        let defer = q.defer(),
            logger = this.logger,
            continueLog = this.logger.info("BowerManager",`attempting to install all packages...`);
        this.bower.commands.install([],options)
            .on("log",function (log) {
                logger.trace("BowerManager", "^cINSTALL^:", `id: ${log.id}, message: ${log.message}`);
                if(log.id == "cached"){
                    logger.trace("BowerManager", "^cINSTALL^:", `Found cache, package: ${log.data.resolver.name}, source: ${log.data.resolver.source}, target: ${log.data.resolver.target}`);
                }
                logger.file.info("BowerManager", "^cINSTALL^:", `id: ${log.id}, message: ${log.message}`,log);
            })
            .on("error",function(e){
                debugger;
                logger.error("BowerManager", "^rfail^:", `on uninstall all packages. Code: ${e.code}, details: ${e.message}`);
                defer.reject(e);
            })
            .on("end",function(result){
                debugger;
                if(continueLog) {
                    continueLog("^gok^:");
                }
                defer.resolve(result);
            });
        return defer.promise;
    }
    public install(name,options:IInstall){
        let defer = q.defer(),
            logger = this.logger,
            continueLog = this.logger.info("BowerManager",`attempting to install the package '${name}'...`);
        this.bower.commands.install([name],options)
            .on("log",function (log) {
                debugger;
            })
            .on("error",function(e){
                debugger;
                logger.error("BowerManager", "^rfail^:", `on uninstall '${name}'. Code: ${e.code}, details: ${e.message}`);
                defer.reject(e);
            })
            .on("end",function(result){
                debugger;
                if(continueLog) {
                    continueLog("^gok^:");
                }
                defer.resolve(result);
            });
        return defer.promise;
    }
    /**
     * @description Desinstala un paquete
     * @param name                  Nombre del paquete a desinstalar
     * @param [options]             Opciones para la desinstalación. Acepta:
     * @param [options.save]        Elimina el paquete del registro de dependencias(bower.json)
     * @param [options.saveDev]     Elimina el paquete del registro de dependencias de desarrollo(bower.json)
     * @returns {Promise<T>}
     */
    public uninstall(name,options:IUninstall){
        let defer = q.defer(),
            logger = this.logger,
            continueLog = this.logger.info("BowerManager", `attempting to uninstall the package '${name}'...`);
        this.bower.commands.uninstall([name],options)
            .on("log", function (log) {
                debugger;
                if(log.id=="not-installed"){
                    continueLog("^gok^:");
                    logger.warn("BowerManager",`'${name}' is not installed. Any change done`);
                    continueLog = null;
                    defer.resolve(null);
                }
            })
            .on("error", function (e) {
                debugger;
                logger.error("BowerManager", "^rfail^:", `on uninstall '${name}'. Code: ${e.code}, details: ${e.message}`);
                defer.reject(e);
            })
            .on("end", function (result) {
                debugger;
                if(continueLog) {
                    continueLog("^gok^:");
                }
                defer.resolve(result);
            });
        return defer.promise;
    }
    /**
     * @description Busca paquetes cuyo nombre coincida con el término indicado
     * @param term
     * @returns {Promise<T>}
     */
    public info(name) {
        let defer = q.defer(),
            logger = this.logger,
            continueLog = this.logger.info("BowerManager", `retriving package info for '${name}'...`);
        this.bower.commands.info(name)
            .on("log", function () {
                debugger;
            })
            .on("error", function (e) {
                debugger;
                switch(e.code){
                    case "ENOTFOUND":
                        continueLog("^gok^:",`but not found info for '${name}'`);
                        defer.resolve(null);
                        break;
                    default:
                        logger.error("BowerManager", "^rfail^:", `on get info for '${name}'. Code: ${e.code}, details: ${e.message}`);
                        defer.reject(e);
                        break;
                }
            })
            .on("end", function (result) {
                continueLog("^gok^:");
                defer.resolve(result);
            });
        return defer.promise;
    }
    /**
     * @description Busca paquetes cuyo nombre coincida con el término indicado
     * @param term
     * @returns {Promise<T>}
     */
    public search(query){
        let defer = q.defer(),
            logger = this.logger,
            continueLog = this.logger.info("BowerManager", `search packages for '${query}'...`);
        this.bower.commands.search(query)
            .on("log",function(){
                debugger;
            })
            .on("error",function(e){
                debugger;
                logger.error("BowerManager","^cfail^:",`on search packages. Term: ${query}. Code: ${e.code}, details: ${e.message}`);
                defer.reject(e);
            })
            .on("end",function(results){
                continueLog("^gok^:");
                defer.resolve(results);
            });
        return defer.promise;
    }
    /**
     * @description Obtiene los paquetes de bower
     * @param done  Callback a invocar si el proceso es satisfactorio
     * @param fail  Callback a invocar si el proceso falla
     */
    public listPackages() {
        let continueLog = this.logger.info("BowerManager", "retriving packages..."),
            logger = this.logger,
            defer = q.defer();
        this.bower.commands.list()
            .on("log",function(e){
                debugger;
                logger.trace("BowerManager",`${e.id}: ${e.message}`);
            })
            .on("error",function(e){
                debugger;
                logger.error("BowerManager","^rfail^:","on retriving packages. Code:",e.code,",details:",e.message);
                defer.reject(e);
            })
            .on("end", function (info) {
                continueLog("^gok^:");
                defer.resolve(info);
            });
        return defer.promise;
    }

    /**
     * @description Sobreescribe el fichero bower.json con el contenido indicado
     * @param config
     * @returns {IResult}
     */
    public setConfigFile(config):IResult{
        let defer = q.defer(),
            continueLog = this.logger.info("BowerManager", "writting config file...");
        try{
            if(typeof config != "string"){
                config = JSON.stringify(config,null,2);//stringify and prettify
            }
            this.fs.writeFile("bower.json",config,function(err){
                if(!err){
                    continueLog("^gok^:");
                    defer.resolve(true);
                }else{
                    this.logger.error("BowerManager","^rfail^:","on writting bower.json file:",err.details);
                    defer.reject(err);
                }
            }.bind(this));
        }catch(e){
            defer.reject(e);
            this.logger.error("BowerManager","^rfail^:","on writting bower.json file:",e.details);
        }
        return defer.promise;
    }
    /**
     * @description Verifica la existencia del fichero de configuración de bower
     */
    public getConfigFile():IResult {
        let defer = q.defer(),
            continueLog = this.logger.info("BowerManager", "retriving config file...");
        this.fs.readFile("bower.json", {encoding: "utf8"},function(error,data){
            if(!error){
                try{
                    let result = JSON.parse(data);
                    continueLog("^gok^:");
                    defer.resolve(data);
                }catch(e){
                    defer.reject(error);
                    this.logger.error("BowerManager", "^rfail^:", "on get bower.json file:", error.message);
                }
            }else{
                switch(error.code) {
                    case "ENOENT":
                        defer.resolve(null);
                        continueLog("^gok^:", "but not config file found");
                        break;
                    default:
                        defer.reject(error);
                        this.logger.error("BowerManager", "^rfail^:", "on get bower.json file:", error.message);
                        break;
                }
            }
        }.bind(this));
        return defer.promise;
    }
}