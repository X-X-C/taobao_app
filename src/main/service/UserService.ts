import UserDao from "../dao/UserDao";
import User from "../entity/User";
import BaseService from "./abstract/BaseService";

export default class UserService extends BaseService<UserDao, User> {
    constructor(context) {
        super(new UserDao(context));
    }

    private user: User;

    /**
     * 获取用户
     * @param openId
     */
    async get(openId: string = this.openId) {
        //如果是获取当前用户,如果已经获取过了直接返回
        if (this.user && openId === this.openId) {
            return this.user;
        } else {
            let user: User = <User>await super.get({
                openId: openId || this.openId,
                activityId: this.activityId
            })
            if (!user && openId === this.openId) {
                user = new User();
                user.activityId = this.activityId;
                user.creatTime = this.time.base;
                user.nick = this.nick;
                user.mixNick = this.mixNick;
                user.openId = this.openId;
                await this.add(user);
            }
            //如果获取的是当前用户，保存
            if (openId === this.openId) {
                this.user = user;
            }
            return user;
        }
    }

    async edit(user: User) {
        let filter = {
            openId: user.openId || this.openId,
            activityId: this.activityId
        }
        return await super.edit(filter, {
            $set: user
        })
    }

    async add(user) {
        return await super.add(user);
    }
}