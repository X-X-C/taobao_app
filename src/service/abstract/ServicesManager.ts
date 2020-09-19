let services = [];

type Constructor<T> = new(...args: any[]) => T;

export default abstract class servicesManager {
    protected constructor(public context: any) {
    }

    /**
     * 实例化的service
     * @param service
     */
    register(service) {
        let s = services.find(v => v.id === service.id);
        if (!s) {
            s = service;
            services.push(s);
        }
        return s;
    }

    /**
     * 通过类获取service
     * @param target
     */
    getService(target) {
        let t = new target(this.context);
        let s = services.find(v => v.id === t.id);
        if (s) {
            return s;
        }
        //新实例注册到services
        return this.register(target);
    }
}