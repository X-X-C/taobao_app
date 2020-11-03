import BaseDao from "../../base/dao/abstract/BaseDao";

export default class PrizeDao<T extends object> extends BaseDao<T> {
    constructor(context) {
        super(context, "prizes");
    }
}