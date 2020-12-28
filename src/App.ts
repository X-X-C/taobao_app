import BaseApp from "../base/App";
import {activityData} from "../base/service/ActivityService";
import ActivityService from "./service/ActivityService";

export default class App extends BaseApp {
    constructor(context, apiName) {
        super(context, apiName);
    }

    config = {
        //是否在请求结束后返回本次请求参数
        returnParams: true,
        //全局请求参数
        needParams: [],
        //是否启用全局活动
        globalActivity: false
    }

    globalActivity: activityData;
    activityService: ActivityService;

    //重写执行前方法
    async before() {
        //如果配置了全局活动，且没有获取过
        if (this.config.globalActivity === true && !this.globalActivity) {
            this.activityService = this.getService(ActivityService);
            //设置全局活动
            this.globalActivity = await this.activityService.getActivity(this.activityService.pureFiled);
        }
    }
}
