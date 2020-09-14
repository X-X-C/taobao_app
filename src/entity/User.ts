export default class User {
    //用户名
    nick: string;
    //用户MixNick
    mixNick: string;
    //用户OPENID
    openId: string;
    //活动ID
    activityId: string;
    //创建时间
    createTime: string;
    //头像
    avatar: string = "";
    //分数
    score: number = 0;
    //最后一次获取分数时间
    lastGetScoreTime: string = "";
    //邀请人
    inviter: any = {
        openId: false,
        time: "",
        nick: false
    };
    //任务
    task: any = {
        //入会任务是否完成
        vip: false,
        //预定、购买
        doneOrders: [],
    }
}
