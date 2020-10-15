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
     */
    bean(type: string, data?): Spm {
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