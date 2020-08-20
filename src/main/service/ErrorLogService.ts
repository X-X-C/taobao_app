import ErrorLogDao from "../dao/ErrorLogDao";
import ErrorLog from "../entity/ErrorLog";
import BaseService from "./abstract/BaseService";

export default class ErrorLogService extends BaseService<ErrorLogDao, ErrorLog> {
    constructor(context) {
        super(new ErrorLogDao(context));
    }

    async add(response) {
        let errorLog = new ErrorLog();
        errorLog.nick = this.nick;
        errorLog.api = response.data;
        errorLog.message = response.message;
        errorLog.openId = this.openId;
        errorLog.time = this.time.base;
        errorLog.params = response.params;
        return await super.add(errorLog);
    }
}