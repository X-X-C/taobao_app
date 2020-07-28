import ActivityDao from "../dao/ActivityDao";
import Utils from "../utils/Utils";
import BaseService from "./abstract/BaseService";

export default class ActivityService extends BaseService<ActivityDao, {}> {
    constructor(context) {
        super(new ActivityDao(context));
    }

    /**
     * 查询活动
     * @param id 活动ID
     */
    async get(id: string = "") {
        //活动
        let activity = null;
        //时间
        let time = Utils.time();
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
        if (time.base < activity.startTime) {
            result.code = 0;
        }
        //活动已结束
        else if (time.base > activity.endTime) {
            result.code = 2;
        }
        //活动正常
        else {
            result.code = 1;
        }
        //带上活动返回
        result.data = activity;
        return result;
    }
}