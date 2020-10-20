import BaseDao from "./abstract/BaseDao";

export default class ErrorLogDao<T extends object> extends BaseDao<T> {
    constructor(context) {
        super(context, "errorLogs");
    }
}