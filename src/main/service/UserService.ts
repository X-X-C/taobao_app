import UserDao from "../dao/UserDao";
import User from "../entity/User";
import BaseService from "./abstract/BaseService";
import Utils from "../utils/Utils";

export default class UserService extends BaseService<UserDao, User> {
    constructor(context) {
        super(new UserDao(context));
    }

    /**
     * 获取单个用户
     */
    async get() {
        let user: User = <User>await super.get({
            openId: this.openId,
            activityId: this.activityId
        })
        if (!user) {
            user = new User();
            user.activityId = this.activityId;
            user.creatTime = Utils.time().base;
            user.nick = this.nick;
            user.mixNick = this.mixNick;
            user.openId = this.openId;
            await this.add(user);
        }
        return user;
    }

    async add(user) {
        return await super.add(user);
    }
}