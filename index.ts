import App from "./src/main/App";
import ErrorLogService from "./src/main/service/ErrorLogService";
import ErrorLog from "./src/main/entity/ErrorLog";
//请求成功是否返回参数
App.config.returnParams = true;
//每次请求都必须要的参数
App.config.needParams = {};
//发生异常后的处理
App.errorDo = async function (rs) {
    let errorLogService = new ErrorLogService(this.context);
    let errorLog = new ErrorLog(rs);
    await errorLogService.add(errorLog);
}

// @ts-ignore
exports.main = async (context) => {
    const app = new App(context, "main");
    // App.config.needParams = {};
    return await app.run(async function () {
        // do...
    });
}

/**
 * 后期检查数据
 * @param context
 */
// @ts-ignore
exports.aggregate = async (context) => {
    const app = new App(context, "aggregate");
    let need = {tb: "", pipe: []};
    return await app.run(async function () {
        return await app.db(this.tb).aggregate(this.pipe);
    }, need);
}