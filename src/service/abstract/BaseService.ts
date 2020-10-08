import BaseDao from "../../dao/abstract/BaseDao";
import Time from "../../utils/Time";
import Utils from "../../utils/Utils";
import {result} from "../../utils/Type";
import ServiceManager from "./ServiceManager";
import App from "../../App";

type listResult<T> = {
    data: T[];
    [other: string]: any;
}

type listOptions = {
    skip?: number,
    limit?: number,
    [other: string]: any
}

export default abstract class BaseService<T extends BaseDao<E>, E extends object> {
    protected constructor(Dao: T, app: App) {
        this.dao = Dao;
        this.app = app;
        this.context = this.dao.context;
        this.cloud = this.context.cloud;
        this.data = this.context.data;
        //处理未授权的用户名称
        this.context.userNick = this.context.userNick || this.context.mixNick.substr(0, 1) + "**";
        this.nick = this.context.userNick;
        this.openId = this.context.openId;
        this.mixNick = this.context.mixNick
        this.activityId = this.data.activityId;
    }

    protected app: App;
    protected dao: T;
    protected cloud: any;
    protected data: any;
    protected context: any;
    protected nick: string;
    protected openId: string;
    protected mixNick: string;
    protected activityId: string;
    protected time = (date: any = new Date()): Time => {
        return new Time(date);
    };


    register(service) {
        if (this.app.services instanceof ServiceManager) {
            return this.app.services.register(service);
        } else {
            return service;
        }
    }

    getService<C extends { [prop: string]: any }>(target: (new (...args) => C)): C {
        if (this.app.services instanceof ServiceManager) {
            return this.app.services.getService(target);
        } else {
            return new target(this.app);
        }
    }


    get result(): result {
        return {
            code: 0
        }
    }

    get options() {
        return {
            $push: <E>{},
            $set: <E>{},
            $inc: <E>{}
        }
    }

    /**
     * 新增一条数据
     * @param entity
     */
    async insertOne(entity: E): Promise<string> {
        return await this.dao.insertOne(entity);
    }

    /**
     * 新增多条数据
     * @param entity
     */
    async insertMany(entity: E[]): Promise<string[]> {
        if (entity.length > 0) {
            return await this.dao.insertMany(entity);
        }
        return [];
    }

    /**
     * 编辑
     * @param filter
     * @param options
     */
    async edit(filter: any, options: any): Promise<number> {
        if (Utils.cleanObj(options, false)) {
            return await this.dao.update(filter, options);
        }
        return 0;
    }

    /**
     * 删除
     * @param filter
     */
    async delete(filter: any): Promise<number> {
        return await this.dao.delete(filter);
    }

    /**
     * 统计查询
     * @param filter
     */
    async count(filter: any): Promise<number> {
        return await this.dao.count(filter);
    }

    async aggregate(pipe: Array<any>): Promise<any[]> {
        return await this.dao.aggregate(pipe);
    }

    /**
     * 分页查询带限制条件
     * 请求时可携带参数  page,size来分页
     * 返回分页数据
     * @param filter
     * @param options
     * @param dividePage    是否分页
     */
    async list(filter: any = {}, options: listOptions = {}, dividePage: boolean = true): Promise<listResult<E>> {
        let rs: listResult<E> = {
            data: null
        };
        if (dividePage === true) {
            let {size, page} = this.data;
            if (size && page) {
                options.skip = (page - 1) * size;
                options.limit = size;
                let count = await this.dao.count(filter);
                rs.total = Math.ceil(count / size);
            }
        }
        rs.data = await this.dao.find(filter, options);
        return rs;
    }

    /**
     * 获取单条数据
     * @param filter
     * @param options
     */
    async get(filter: any = {}, options: any = {}): Promise<E> {
        return await this.dao.get(filter, options);
    }

    /**
     * 获取所有数据
     * @param filter
     * @param options
     */
    async getAll(filter: any = {}, options: any = {}): Promise<E[]> {
        return await this.dao.find(filter, options);
    }

    spm(type, data) {
        this.app.addSpm(type, data);
    }
    
    /**
     * 从云端下载文件
     * @param fileId
     */
    async downloadFile(fileId: string): Promise<any> {
        return await this.dao.downloadFile(fileId);
    }

    /**
     * 上传文件到云端并返回可访问连接
     * @param buffer
     * @param fileName
     */
    async uploadFile(buffer: any, fileName: string): Promise<string> {
        return await this.dao.uploadFile(buffer, fileName);
    }
}