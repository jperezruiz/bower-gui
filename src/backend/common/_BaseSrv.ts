import * as socket from "@types/socket.io";
import {Logger}  from "./Logger";
export interface IServiceError {
    code:string;
    message:string;
}
export interface IServiceResult{
    error:boolean|IServiceError;
    result:any;
}
/**
 * @class BaseSrv
 * @abstract
 * @description Base for services
 */
export abstract class BaseSrv {
    protected connections: Map<string, SocketIO.Socket> = new Map();
    protected log;
    protected name;
    protected logger;
    /**
     * 
     * @param socket        Socket to use 
     * @param [namespace]   Optional namespace to manage events
     */
    constructor(protected name, protected socket:SocketIO.Socket, protected namespace?:string) {
        this.log = Logger.getLogger("server");
        this.log.trace(this.name,"Initializing...");
        this._init();
        if(!!namespace) {
            this.log.trace(this.name,`Namespace provided, using '${namespace}'`);
            this.socket= socket.of(`/${namespace}`);
        }
        this.socket.on("connect",this._onClientConnect.bind(this));
    }

    /**
     * @description Register events to manage
     * @abstract
     * @param socket
     * @private
     */
    protected abstract _registerEvents(socket:SocketIO.Socket);

    /**
     * @description Initialize
     * @private
     */
    protected _init(){}

    /**
     * @description Close all conections.
     */
    public disconnectAll() {
        this.log.trace(this.name, "Disconecting all...");
        let connectionItems = this.connections.values();
        for (let connection of connectionItems) {
            this.log.trace(this.name,`Disconecting '${connection.id}'`);
            connection.disconnect(true);
        }
        this.log.info(this.name, `Disconected ${this.connections.size}`);
        this.connections.clear();
    }

    /**
     * @description Invoked when a client connects. Perform custom operations before start to operate.
     * Once the operations are complete is necessary invoke _completeConnectionProcess to complete the connection process
     * and start the event listening
     * @param socket
     * @protected
     * @see _completeConnectionProcess
     */
    protected _onClientConnect(socket:SocketIO.Socket) {
        this.connections.set(socket.id,socket);
        this.log.info(this.name, `New client connected. Now there are ${this.connections.size} connection/s`);
        this.log.trace(this.name, `Client id '${socket.id}'`);
        socket.on("disconnect",this._wrapEventCallback(this._onClientDisconnect));
        this._registerEvents(socket);
        this._onCompleteConnectionProcess();
    }

    /**
     * @description Wraps callbacks for socket event allowing to access to socket
     * @param socket
     * @param callback
     * @returns {()=>undefined}
     * @private
     */
    protected _wrapEventCallback(callback){
        let that = this;
        return function(){
            let _arguments = Array.prototype.slice.call(arguments);
            _arguments.unshift(this);
            callback.apply(that,_arguments);
        }
    }
    /**
     * @description Invoked when the connection process is finished. Allow to implement custom operations like emit some event to notify client
     * @protected
     */
    protected _onCompleteConnectionProcess(){}
    /**
     * @description Invoked when the connection is closed. Update the state
     * @protected
     */
    protected _onClientDisconnect(socket) {
        this.log.info(this.name,`Client disconnected. Now there are ${this.connections.size} connection/s`);
        this.connections.delete(socket.id);
        this.log.trace(this.name,`Client disconnected id '${socket.id}'`);
    }
}
