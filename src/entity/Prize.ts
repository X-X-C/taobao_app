import User from "./User";
import Time from "../../base/utils/Time";

export default class Prize {
    constructor(user: User, prize: any, type: string) {
        this.activityId = user.activityId;
        this.openId = user.openId;
        this.nick = user.nick;
        this.mixNick = user.mixNick;
        this.prize = prize;
        this.prizeName = prize.name;
        this.prizeId = prize.id;
        this.isShow = true;
        let time = new Time();
        this.time = time.common.base;
        this.date = time.format("YYYY-MM-DD");
        this.type = type;
    }

    _id;
    //活动ID
    activityId: string;
    //用户名
    nick: string;
    //是否展示奖品
    isShow: boolean;
    //mixNick
    mixNick: string;
    //奖品名称
    prizeName: string;
    //奖品ID
    prizeId: string;
    //openId
    openId: string;
    //获奖人的中奖产品
    prize: object;
    //获奖时间
    time;
    //获奖日期
    date;
    //获奖类型
    type: string;
    //领取时间
    receiveTime: string = "";
    //领取状态
    receiveStatus: boolean = false;
    //真实状态
    realReceiveStatus: boolean = false;
    //保存信息
    info: any = {}
    //额外说明
    ext: any = {}
}
