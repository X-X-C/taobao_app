import BaseEntity from "../../base/entity/abstract/BaseEntity";

export default class User extends BaseEntity {
    constructor() {
        super();
    }

    /**
     * 基础字段
     */
        //用户名
    nick: string;
    //用户MixNick
    mixNick: string;
    //用户OPENID
    openId: string;
    //活动ID
    activityId: string
    //创建时间
    createTime: string;
    //头像
    avatar: string | boolean = false;
    //邀请人信息
    inviter: any;
    //上次初始化时间
    lastInitTime: number | boolean = false;
    //会员状态
    vipStatus: number;
    /**
     * 通用字段
     */
        //分数
    score: number = 0;
    //上次获取分数时间
    lastGetScoreTime: number | string = "";
    /**
     * 游戏类字段
     */
        //游戏状态 0--未开始游戏 1--游戏中
    gameStatus: number = 0;
    //游戏次数
    gameNum: number = 0;

    /**
     * 任务类字段
     */
    task = {
        //关注店铺
        follow: false,
        //加入会员
        member: false,
        //邀请好友
        assist: 0,
        //已检查的订单
        doneOrders: []
    }

    /**
     * 抽奖字段
     */
        //剩余抽奖次数
    lotteryCount: number = 0;

    baseInfo() {
        return {
            nick: this.nick,
            openId: this.openId,
            activityId: this.activityId,
            avatar: this.avatar
        }
    }

    spmExt() {
        return {
            nick: this.nick,
            openId: this.openId,
            activityId: this.activityId,
            mixNick: this.mixNick
        }
    }
}

export function task(key, name, reward, type: "normal" | "other" = "normal"): taskConfigType {
    return {
        [key]: {
            name,
            reward,
            type
        }
    }
}
