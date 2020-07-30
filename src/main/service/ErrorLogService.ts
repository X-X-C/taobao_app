import ErrorLogDao from "../dao/ErrorLogDao";
import ErrorLog from "../entity/ErrorLog";
import Utils from "../utils/Utils";
import BaseService from "./abstract/BaseService";

export default class ErrorLogService extends BaseService<ErrorLogDao, ErrorLog> {
    constructor(context) {
        super(new ErrorLogDao(context));
    }

    async add(errorLog) {
        Object.assign(errorLog, {
            time: this.time.base,
            date: this.time.YYYYMMDD,
            mixNick: this.mixNick,
            userNick: this.nick
        });
        return await super.add(errorLog);
    }
}