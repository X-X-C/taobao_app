import BaseDao from "./abstract/BaseDao";

export default class ActivityDao<T extends object> extends BaseDao<T> {
    constructor(context) {
        super(context, "activities");
    }
}