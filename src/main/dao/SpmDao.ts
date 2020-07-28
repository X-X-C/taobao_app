import BaseDao from "./abstract/BaseDao";
// @ts-ignore
import * as gm from "gmtaobao";

export default class SpmDao extends BaseDao {
    constructor(context) {
        super(context, "spms");
    }

    /**
     * 新增统计
     * @param type 类型
     */
    async add(type) {
        await gm.spm.spm(this.context, type);
    }
}