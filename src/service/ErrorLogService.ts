import ErrorLogDao from "../dao/ErrorLogDao";
import ErrorLog from "../entity/ErrorLog";
import BaseService from "./abstract/BaseService";
import App from "../App";

export default class ErrorLogService extends BaseService<ErrorLogDao<ErrorLog>, ErrorLog> {
    constructor(app: App) {
        super(ErrorLogDao, app);
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