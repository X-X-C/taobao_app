import Utils from "./utils/Utils";
import BaseResult from "./dto/BaseResult";

export default class App {
    constructor(public context: any, public apiName: string) {
    }

    //APP配置
    static config = {
        //是否在请求结束后返回本次请求参数
        returnParams: false,
        needParams: {}
    }
    //异常后的操作
    static errorDo: Function = (e) => {
        console.log(e)
    }

    /**
     * 运行方法 可以捕获异常并处理
     * @param doSomething
     * @param needParams 所需参数 { name: "" }
     */
    async run(doSomething: Function, needParams: object = {}) {
        //初始化返回对象
        let response = BaseResult.success();
        //保存原始请求参数
        let params = {...this.context.data};
        //记录值
        let result = null;
        try {
            //全局所需参数
            Object.assign(needParams, App.config.needParams);
            //判断参数是否符合条件
            result = Utils.checkParams(needParams, params);
            //如果不符合条件直接返回
            if (result.success === false) return result;
            //符合条件进行下一步
            result = await doSomething.call(this.context.data);
            //如果用户操作过后没有返回值就默认返回成功
            !Utils.isBlank(result) ? response = result : false;
        } catch (e) {
            //发现异常 初始化返回参数
            response = BaseResult.fail(e.message, this.apiName);
            //如果异常为对象，将对象里的东西合并的返回中
            if (typeof e === "object") {
                Object.assign(response, e);
            }
            //如果为字符串，则设置信息，通常返回字符串异常不可能
            else if (typeof e === "string") {
                response.message = e;
            }
            //将本次请求异常的参数记录
            Object.assign(response, {params})
            try {
                //用户自行对异常对象进行操作
                await App.errorDo.call(this, response);
            } catch (e) {
                //...能异常到这里来基本上就是本质上的错误
            }
            //直接返回异常对象
            return response;
        }
        //成功过后是否返回请求参数
        if (App.config.returnParams === true) {
            Object.assign(response, {params})
        }
        return response;
    }

    /**
     * 清空指定的表
     * @param tbs
     */
    async cleanTable(tbs) {
        let result = null, data = [];
        for (let k in tbs) {
            result = await this.db(tbs[k]).deleteMany({_id: {$ne: 0}});
            data.push(`成功删除${tbs[k]}下的${result}条数据。`);
            result = null;
        }
        return BaseResult.success("成功", data);
    }

    /**
     * 获取数据库连接
     * @param tb 表名
     */
    db(tb: string) {
        return this.context.cloud.db.collection(tb);
    }

}