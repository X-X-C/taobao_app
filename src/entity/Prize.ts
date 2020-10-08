import User from "./User";
import Time from "../utils/Time";

export default class Prize {
    constructor(user: User, prize: any, type: string) {
        this.activityId = user.activityId;
        this.openId = user.openId
        this.nick = user.nick
        this.prize = prize;
        let time = new Time();
        this.time = time.common;
        this.date = time.format("YYYY/MM/DD");
        this.type = type;
    }

    //活动ID
    activityId: string;
    //用户名
    nick: string;
    //openId
    openId: string;
    //获奖人的中奖产品
    prize: object;
    //获奖时间
    time;
    //暗号
    code;
    //获奖日期
    date;
    //获奖类型
    type: string;
    //领取时间
    receiveTime: string = "";
    //领取状态
    receiveStatus: boolean = false;
    //额外参数
    ext: any = {
        name: "",
        phone: "",
        address: ""
    }
}