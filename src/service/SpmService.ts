import SpmDao from "../dao/SpmDao";
import BaseService from "./abstract/BaseService";
import Spm from "../entity/Spm";
import App from "../App";

export default class SpmService extends BaseService<SpmDao<Spm>, Spm> {
    constructor(app: App) {
        super(SpmDao, app);
        return this.register(this);
    }

    /**
     * 获取spm bean
     * @param type
     * @param data
     * @param ext 新增或修改源spm数据
     */
    bean(type: string, data?, ext?): Spm {
        let spm = new Spm();
        spm.activityId = this.activityId;
        spm.date = this.time().format("YYYY-MM-DD");
        spm.nick = this.nick;
        spm.type = type;
        spm.data = {
            ...this.data,
            ...data
        }
        spm.openId = this.openId;
        spm.time = this.time().common.base;
        spm.timestamp = this.time().common.x;
        Object.assign(ext);
        return spm;
    }

    /**
     * 新增统计
     * @param type
     * @param data
     */
    async addSpm(type: string, data?): Promise<string> {
        let spm = this.bean(type, data);
        return await this.insertOne(spm);
    }
}