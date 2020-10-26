import ErrorLogDao from "../dao/ErrorLogDao";
import ErrorLog from "../entity/ErrorLog";
import BaseService from "./abstract/BaseService";
import App from "../App";
import BaseResult from "../dto/BaseResult";

export default class ErrorLogService extends BaseService<ErrorLogDao<ErrorLog>, ErrorLog> {
    constructor(app: App) {
        super(ErrorLogDao, app);
    }

    async add(response: BaseResult): Promise<string> {
        let errorLog = new ErrorLog();
        errorLog.nick = this.nick;
        errorLog.api = response.api;
        errorLog.message = response.message;
        errorLog.openId = this.openId;
        errorLog.time = this.time().common.base;
        errorLog.params = response.params;
        return await super.insertOne(errorLog);
    }
}