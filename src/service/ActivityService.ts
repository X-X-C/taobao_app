import ActivityDao from "../dao/ActivityDao";
import BaseService from "./abstract/BaseService";
import UserService from "./UserService";
import Prize from "../entity/Prize";
import PrizeService from "./PrizeService";

export default class ActivityService extends BaseService<ActivityDao, {}> {
    constructor(context) {
        super(new ActivityDao(context));
    }

    private activity: any;

    /**
     * 获取活动状态
     * @param id
     */
    async getStatus(id: string = this.activityId) {
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
        return this.getActivityStatus(activity);
    }

    /**
     * 查询活动
     * @param id 活动ID
     */
    async get(id: string = this.activityId) {
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
            result.code = this.getActivityStatus(activity);
            //带上活动返回
            result.data = activity;
            this.activity = result;
            return this.activity;
        }
    }

    getActivityStatus(activity) {
        //没有活动
        if (!activity) {
            return -1;
        }
        //活动未开始
        if (this.time().base < activity.startTime) {
            return 0;
        }
        //活动已结束
        else if (this.time().base > activity.endTime) {
            return 2
        }
        //活动正常
        else {
            return 1;
        }
    }

    /**
     * 初始化活动
     */
    async init(userService = new UserService(this.context)) {
        let activity = await this.get();
        let rs = {
            awardStatus: -1,
            ...activity
        };
        //活动已结束
        if (activity.code === 2) {
            activity = activity.data;
            //获取配置
            let {rankPrizeList, award} = activity.config;
            //如果没有开过奖
            if (award === false) {
                let rankList = await userService.rank();
                let winners = [];
                //排名索引
                let index = 1;
                for (let u of rankList) {
                    for (let p of rankPrizeList) {
                        //获取条件
                        let {startNum, endNum} = p.condition;
                        //如果在中奖范围
                        if (index >= startNum && index <= endNum) {
                            let prize = new Prize();
                            prize.prize = p;
                            prize.type = "rank";
                            prize.user = u;
                            winners.push(prize);
                        }
                    }
                    index += 1;
                }
                let filter = {
                    _id: this.activityId,
                    "config.award": false
                }
                let options = {
                    $set: {
                        "config.award": true
                    }
                }
                //更改开奖状态
                let status = await this.edit(filter, options);
                //成功更改开奖状态
                if (status === 1) {
                    if (winners.length > 0) {
                        let prizeService = new PrizeService(this.context);
                        await prizeService.add(winners);
                    }
                }
                //成功
                rs.awardStatus = 1;
            } else {
                rs.awardStatus = 0;
            }
        }
        return rs;
    }
}