import ActivityDao from "../dao/ActivityDao";
import BaseService from "./abstract/BaseService";
import App from "../App";
import UserService from "./UserService";
import Prize from "../entity/Prize";
import PrizeService from "./PrizeService";

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

    pureFiled = {
        startTime: 1,
        endTime: 1,
        config: 1
    }

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
        }
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

    async award() {
        let code = -1;
        let activity = await this.getActivity();
        //如果活动结束，且还没有开过奖进入开奖逻辑
        if (activity.code === 2 && activity.data.data.award !== true) {
            //更改活动开奖状态
            let filter = {
                _id: this.activityId,
                "data.award": {
                    $ne: true
                }
            }
            let options = {
                "data.award": true
            }
            code = await this.edit(filter, options);
            //成功更改开奖状态
            if (code === 1) {
                let userService = this.getService(UserService);
                let rankPrizeList = activity.data.config.rankPrizeList;
                //需要开奖的数据
                let rankList = (await userService.rank()).list;
                //需要开奖的奖品
                let winners = [];
                for (let user of rankList) {
                    let prize = rankPrizeList.find(p => {
                        let {startNum, endNum} = p.condition;
                        if (user.rank >= startNum && user.rank <= endNum) {
                            return true;
                        }
                    });
                    //如果当前用户存在奖品
                    if (prize) {
                        let sendPrize = new Prize(user, prize, "rank");
                        sendPrize.ext.rank = user.rank;
                        winners.push(sendPrize);
                    }
                }
                let prizeService = this.getService(PrizeService);
                //开奖
                await prizeService.insertMany(winners);
            }
        }
    }
}