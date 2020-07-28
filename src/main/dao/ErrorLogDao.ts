import BaseDao from "./abstract/BaseDao";

export default class ErrorLogDao extends BaseDao {
    constructor(context) {
        super(context, "errorLog");
    }
}