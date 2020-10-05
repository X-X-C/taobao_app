import ErrorLogDao from "../dao/ErrorLogDao";
import ErrorLog from "../entity/ErrorLog";
import BaseService from "./abstract/BaseService";
import ServiceManager from "./abstract/ServiceManager";

export default class ErrorLogService extends BaseService<ErrorLogDao<ErrorLog>, ErrorLog> {
    constructor(app: ServiceManager) {
        super(new ErrorLogDao(app.context), app);
        return this.register(this);
    }

    async add(response): Promise<string> {
        let errorLog = new ErrorLog();
        errorLog.nick = this.nick;
        errorLog.api = response.data;
        errorLog.message = response.message;
        errorLog.openId = this.openId;
        errorLog.time = this.time().common.base;
        errorLog.params = response.params;
        errorLog.desc = response;
        return await super.insertOne(errorLog);
    }
}