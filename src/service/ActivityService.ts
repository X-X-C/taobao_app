import ActivityDao from "../dao/ActivityDao";
import BaseService from "../../base/service/abstract/BaseService";
import App from "../../base/App";

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
    constructor(app: App) {
        super(ActivityDao, app);
    }

    private activity: any;

    /**
     * 获取活动状态
     */
    async getActivityStatus(): Promise<activityData> {
        let activity;
        //如果当前活动存在
        if (this.activity) {
            activity = this.activity.data;
        }
        //否则查询活动
        else {
            let filter: any = {};
            !this.activityId || (filter._id = this.activityId);
            activity = await super.get(filter, {
                projection: {
                    _id: 0,
                    startTime: 1,
                    endTime: 1
                }
            });
        }
        return {
            code: this.status(activity),
            data: activity
        };
    }

    /**
     * 获取活动
     */
    async getActivity(
        //获取活动字段
        projection?: any
    ): Promise<activityData> {
        //如果目标活动已经被实例化
        if (this.activity && this.activity.code !== -1 && this.activity.data._id === this.activityId) {
            return this.activity;
        } else {
            //返回值
            let result: any = {};
            //过滤参数
            let filter: any = {};
            !this.activityId || (filter._id = this.activityId)
            let options: any = {};
            !projection || (options.projection = projection)
            //查询活动
            let activity = await super.get(filter, options);
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