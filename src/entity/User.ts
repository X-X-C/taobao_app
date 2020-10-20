export default class User {
    constructor(user?) {
        Object.assign(this, user)
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
    avatar: string = "";
    //邀请人信息
    inviter: any;
    //上次初始化时间
    lastInitTime: string = "";
    /**
     * 通用字段
     */
        //分数
    score: number = 0;
    //上次获取分数时间
    lastGetScoreTime: string = "";
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
        //助力
        assist: {
            count: 0,
            day: ""
        }
    }

    baseInfo() {
        return {
            nick: this.nick,
            openId: this.openId,
            activityId: this.activityId,
            avatar: this.avatar
        }
    }
}
