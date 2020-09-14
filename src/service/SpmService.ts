import SpmDao from "../dao/SpmDao";
import BaseService from "./abstract/BaseService";
import Spm from "../entity/Spm";

export default class SpmService extends BaseService<SpmDao, Spm> {
    constructor(context) {
        super(new SpmDao(context));
    }

    /**
     * 获取spm bean
     * @param type
     * @param data
     */
    bean(type, data: any = false): Spm {
        let spm = new Spm();
        spm.activityId = this.activityId;
        spm.date = this.time().format("YYYY-MM-DD");
        spm.nick = this.nick;
        spm.type = type;
        spm.data = data || this.data;
        spm.openId = this.openId;
        spm.time = this.time().base;
        spm.timestamp = this.time().x;
        return spm;
    }

    /**
     * 新增统计
     * @param type
     * @param data
     */
    async addSpm(type: string, data: any = false) {
        let spm = this.bean(type, data);
        await this.add(spm);
    }
}