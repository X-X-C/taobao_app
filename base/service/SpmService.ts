import SpmDao from "../dao/SpmDao";
import BaseService from "./abstract/BaseService";
import Spm from "../entity/Spm";
import App from "../App";

export default class SpmService extends BaseService<SpmDao<Spm>, Spm> {
    constructor(app: App) {
        super(SpmDao, app);
    }

    /**
     * 获取spm bean
     * @param type
     * @param data
     * @param ext 新增或修改源spm数据
     */
    async bean(type: string, data?, ext?): Promise<Spm> {
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
        //天index
        spm.dayIndex = (await this.count({
            type,
            openId: spm.openId,
            activityId: this.activityId,
            date: spm.date,
        })) + 1;
        //总index
        spm.totalIndex = (await this.count({
            type,
            openId: spm.openId,
            activityId: this.activityId
        })) + 1;
        Object.assign(spm, ext);
        return spm;
    }

    /**
     * 新增统计
     * @param type
     * @param data
     */
    async addSpm(type: string, data?): Promise<string> {
        let spm = await this.bean(type, data);
        return await this.insertOne(spm);
    }
}