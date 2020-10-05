import ActivityDao from "../dao/ActivityDao";
import BaseService from "./abstract/BaseService";
import ServiceManager from "./abstract/ServiceManager";

/**
 * @param code
 * -1-->没有此活动
 * 0-->活动未开始
 * 1-->活动进行中
 * 2-->活动已结束
 * @param data 活动数据
 */
type activityData = {
    code: number,
    data: any
}

export default class ActivityService extends BaseService<ActivityDao<any>, any> {
    constructor(app: ServiceManager) {
        super(new ActivityDao(app.context), app);
        return this.register(this);
    }

    private activity: any;

    /**
     * 获取活动状态
     * @param id
     */
    async getActivityStatus(id: string = this.activityId): Promise<number> {
        let activity;
        //如果当前活动存在
        if (this.activity) {
            activity = this.activity.data;
        }
        //否则查询活动
        else {
            let filter: any = {};
            !id || (filter._id = id);
            activity = await super.get(filter, {
                projection: {
                    _id: 0,
                    startTime: 1,
                    endTime: 1
                }
            });
        }
        return this.status(activity);
    }

    /**
     * 获取活动
     * @param id 活动ID
     */
    async getActivity(id: string = this.activityId): Promise<activityData> {
        //如果目标活动已经被实例化
        if (this.activity && this.activity.code !== -1 && this.activity.data._id === id) {
            return this.activity;
        } else {
            //返回值
            let result: any = {};
            //过滤参数
            let filter: any = {};
            if (id) {
                filter._id = id;
            }
            //查询活动
            let activity = await super.get(filter);
            result.code = this.status(activity);
            //带上活动返回
            result.data = activity;
            this.activity = result;
            return this.activity;
        }
    }

    private status(activity: any): number {
        //没有活动
        if (!activity) {
            return -1;
        }
        //活动未开始
        if (this.time().common.base < activity.startTime) {
            return 0;
        }
        //活动已结束
        else if (this.time().common.base > activity.endTime) {
            return 2
        }
        //活动正常
        else {
            return 1;
        }
    }
}