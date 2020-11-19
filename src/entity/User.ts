export default class User {
    constructor(user?) {
        Object.assign(this, user)
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
    createTime: string;
    //头像
    avatar: string = "";

    baseInfo() {
        return {
            nick: this.nick,
            openId: this.openId,
            activityId: this.activityId,
            avatar: this.avatar
        }
    }
}
