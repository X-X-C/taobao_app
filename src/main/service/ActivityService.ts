import ActivityDao from "../dao/ActivityDao";
import BaseService from "./abstract/BaseService";

export default class ActivityService extends BaseService<ActivityDao, {}> {
    constructor(context) {
        super(new ActivityDao(context));
    }

    private activity;

    /**
     * 查询活动
     * @param id 活动ID
     */
    async get(id: string = "") {
        //如果目标活动已经被实例化
        if (this.activity.code !== -1 && this.activity.data._id === id) {
            return this.activity;
        } else {
            //活动
            let activity = null;
            //返回值
            let result: any = {};
            //过滤参数
            let filter: any = {};
            if (id !== "") {
                filter._id = id;
            }
            //查询活动
            activity = await super.get(filter);
            //没有活动
            if (!activity) {
                result.code = -1;
                return result;
            }
            //活动未开始
            if (this.time.base < activity.startTime) {
                result.code = 0;
            }
            //活动已结束
            else if (this.time.base > activity.endTime) {
                result.code = 2;
            }
            //活动正常
            else {
                result.code = 1;
            }
            //带上活动返回
            result.data = activity;
            this.activity = result;
            return this.activity;
        }
    }
}