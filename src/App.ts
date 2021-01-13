import BaseApp from "../base/App";
import ActivityService from "./service/ActivityService";

export default class App extends BaseApp {
    constructor(context, apiName) {
        super(context, apiName);
    }

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
