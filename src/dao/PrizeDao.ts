import BaseDao from "./abstract/BaseDao";

export default class PrizeDao extends BaseDao {
    constructor(context) {
        super(context, "prizes");
    }
}