import BaseEntity from "./abstract/BaseEntity";
import User from "./User";
import Time from "../utils/Time";

export default class Prize extends BaseEntity {
    constructor(props = {}) {
        super();
        Object.assign(this, props)
    }

    //完整的获奖人信息
    user: User;
    //获奖人的中奖产品
    prize: object;
    //获奖时间
    time: object = new Time();
    //获奖日期
    date = new Time().format("YYYY/MM/DD")
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