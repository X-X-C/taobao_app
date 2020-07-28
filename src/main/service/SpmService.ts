import SpmDao from "../dao/SpmDao";
import BaseService from "./abstract/BaseService";

export default class SpmService extends BaseService<SpmDao, {}> {
    constructor(context) {
        super(new SpmDao(context));
    }

    /**
     * 新增统计
     * @param type
     */
    async add(type) {
        return await this.dao.add(type);
    }
}