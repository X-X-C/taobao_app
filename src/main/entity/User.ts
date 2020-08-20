export default class User {
    constructor(prototype: object = {}) {
        Object.assign(this, prototype);
    }

    //用户名
    nick: string;
    //用户MixNick
    mixNick: string;
    //用户OPENID
    openId: string;
    //活动ID
    activityId: string
    //创建时间
    creatTime: string;
}
