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

export default abstract class BaseService<T extends BaseDao<E>, E extends object> {
    protected constructor(Dao: new(...args) => T, app: App) {
        this.dao = new Dao(app.context);
        this.app = app;
        this.context = this.app.context;
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


    getService<C extends { [prop: string]: any }>(target: (new (...args) => C)): C {
        if (this.app.services instanceof ServiceManager) {
            return this.app.services.getService(target);
        } else {
            return new target(this.app);
        }
    }


    get result(): result | any {
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
     * 返回分页数据
     * @param filter
     * @param options
     */
    async pageList(
        filter: any = {},
        options: {
            page?: number,
            size?: number,
            projection?: any
        } = {
            page: 1,
            size: 500
        }
    ) {
        let rs: listResult<E> = {
            data: []
        };
        let count = await this.dao.count(filter);
        rs.total = Math.ceil(count / options.size);
        let pipe: any = [
            {
                $match: filter
            },
            {
                $skip: (options.page - 1) * options.size
            },
            {
                $limit: options.size
            }
        ]
        if (options.projection) pipe.push({$project: options.projection});
        rs.data = await this.aggregate(pipe);
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


    /**
     * 比较两个对象，返回两个比较后的修改option
     * !!!!!!慎用!!!!!!
     * @param origin
     * @param target
     * @param extKey
     * @param compareRs
     */
    compareObj(origin, target, extKey = "", compareRs: any = {
        $inc: {},
        $push: {},
        $set: {}
    }) {
        let type = Utils.type;
        for (let targetKey in target) {
            let targetV = target[targetKey];
            let originV = origin[targetKey];
            let key = targetKey;
            if (extKey !== "") {
                key = extKey + "." + key;
            }
            //如果两个对象不相同
            if (JSON.stringify(targetV) !== JSON.stringify(originV)) {
                let originType = Utils.getType(originV);
                let targetType = Utils.getType(targetV);
                //如果目标的对象类型相同
                if (originType === targetType && [type.object, type.number, type.array].indexOf(originType) !== -1) {
                    //如果是对象
                    if (originType === type.object) {
                        //继续往下匹配
                        this.compareObj(originV, targetV, key, compareRs)
                    } else if (originType === type.number) {
                        //数值相加
                        compareRs.$inc[key] = targetV - originV;
                    } else if (originType === type.array) {
                        compareRs.$push[key] = {
                            $each: []
                        }
                        let index = 0;
                        //如果是数组
                        for (let targetVElement of targetV) {
                            let originArrayV = originV[index];
                            //如果两个值是不相等的
                            if (JSON.stringify(originArrayV) !== JSON.stringify(targetVElement)) {
                                let targetVElementType = Utils.getType(targetVElement);
                                let originArrayVType = Utils.getType(originArrayV);
                                //如果目标不存在
                                if (originArrayVType === Utils.getType(undefined)) {
                                    compareRs.$push[key].$each.push(targetVElement);
                                }
                                //如果类型为对象
                                else if (targetVElementType === originArrayVType && originArrayVType === type.object) {
                                    //继续往下匹配
                                    this.compareObj(originArrayV, targetVElement, key + "." + index, compareRs)
                                }
                                //如果类型不为对象
                                else {
                                    compareRs.$set[key + "." + index] = targetVElementType;
                                }
                            }
                            ++index;
                        }
                        if (compareRs.$push[key].$each.length <= 0) {
                            delete compareRs.$push[key];
                        }
                    }
                } else {
                    //如果类型不同直接设置
                    compareRs.$set[key] = targetV;
                }
            }
        }
        return compareRs;
    }

    spm(type, data?, ext?) {
        this.app.addSpm(type, data, ext);
    }

}