import Utils from "./utils/Utils";
import BaseResult from "./dto/BaseResult";
import ErrorLogService from "./service/ErrorLogService";
import ServiceManager from "./service/abstract/ServiceManager";
import SpmService from "./service/SpmService";

export default class App {

    constructor(public context: any, public apiName: string) {
        //创建一个服务管理
        this.services = new ServiceManager(this);
        //创建埋点对象
        this.spmService = this.services.getService(SpmService);
    }

    //服务管理
    services: ServiceManager;

    //APP配置
    config = {
        //是否在请求结束后返回本次请求参数
        returnParams: true,
        //全局请求参数
        needParams: []
    }

    //埋点对象
    spmService: SpmService;
    //埋点数组
    spmBeans = [];

    /**
     * 运行方法 可以捕获异常并处理
     * @param doSomething
     * @param needParams 所需参数 { name: "" }
     */
    async run(doSomething: Function, needParams: string[] = []): Promise<BaseResult> {
        //初始化返回对象
        let response = BaseResult.success();
        //保存原始请求参数
        let params = Utils.deepClone(this.context.data);
        //是否返回请求参数
        if (this.config.returnParams === true) {
            response.params = params;
        }
        //记录值
        let result = null;
        try {
            needParams = needParams.concat(this.config.needParams);
            //判断参数是否符合条件
            result = Utils.checkParams(needParams, params);
            //如果不符合条件直接返回
            if (result.success === false) return result;
            //符合条件进行下一步
            result = await doSomething.call(this.context.data);
            //如果用户操作过后没有返回值就默认返回成功
            !Utils.isBlank(result) ? response.data = result : false;
        } catch (e) {
            //发现异常 初始化返回参数
            response = BaseResult.fail(e.message, e);
            response.api = this.apiName;
            try {
                let errorLogService = this.services.getService(ErrorLogService)
                await errorLogService.add(response);
            } catch (e) {
                //...
            }
        }
        //运行结束添加本次埋点
        await this.spmService.insertMany(this.spmBeans);
        //清空埋点
        this.spmBeans = [];
        return response;
    }

    addSpm(type, data?, ext?) {
        this.spmBeans.push(this.spmService.bean(type, data, ext));
    }

    /**
     * 清空指定的表
     * @param tbs
     */
    async cleanTable(tbs): Promise<Array<string>> {
        let result = null, data = [];
        for (let k in tbs) {
            result = await this.db(tbs[k]).deleteMany({_id: {$ne: 0}});
            data.push(`成功删除${tbs[k]}下的${result}条数据`);
            result = null;
        }
        return data;
    }

    /**
     * 获取数据库连接
     * @param tb 表名
     */
    db(tb: string) {
        return this.context.cloud.db.collection(tb);
    }

    getService<T>(clazz: new(...args: any) => T): T {
        return this.services.getService(clazz);
    }
}
