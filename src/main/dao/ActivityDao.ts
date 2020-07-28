import BaseDao from "./abstract/BaseDao";

export default class ActivityDao extends BaseDao {
    constructor(context) {
        super(context, "activities");
    }
}