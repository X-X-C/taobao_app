import App from "../../App";

export default class ServiceManager {

    constructor(public app: App) {
    }

    services = [];

    /**
     * 实例化的service
     * @param service
     */
    register(service) {
        let s = this.services.find(v => v.constructor.name === service.constructor.name);
        if (!s) {
            s = service;
            this.services.push(s);
        }
        return s;
    }

    /**
     * 通过类获取service
     * @param target
     */
    getService<C extends { [prop: string]: any }>(target: (new (...args) => C)): C {
        let s = this.services.find(v => v.constructor.name === target.name);
        if (s) {
            return s;
        }
        //新实例注册到services
        return this.register(new target(this.app));
    }
}