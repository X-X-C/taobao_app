import UserDao from "../dao/UserDao";
import User from "../entity/User";
import BaseService from "./abstract/BaseService";
import App from "../App";
import Utils from "../utils/Utils";
import Time from "../utils/Time";
import ActivityService from "./ActivityService";

export default class UserService extends BaseService<UserDao<User>, User> {
    constructor(app: App) {
        super(UserDao, app);
    }

    private user: User;

    get services() {
        return {
            activityService: this.getService(ActivityService)
        }
    }

    /**
     * 获取用户
     * @param openId
     */
    async getUser(openId: string = this.openId): Promise<User> {
        //如果是获取当前用户,如果已经获取过了直接返回
        if (this.user && openId === this.openId) {
            return this.user;
        } else {
            let user = await super.get({
                openId: openId || this.openId,
                activityId: this.activityId
            })
            if (!user && openId === this.openId) {
                user = new User();
                user.activityId = this.activityId;
                user.createTime = this.time().common.base;
                user.nick = this.nick;
                user.mixNick = this.mixNick;
                user.openId = this.openId;
                await this.add(user);
            } else {
                user = new User(user);
            }
            //如果获取的是当前用户，保存
            if (openId === this.openId) {
                this.user = user;
            }
            return user;
        }
    }

    /**
     * 修改用户
     * @param options
     * @param filter
     */
    async editUser(options: any, filter: any = {}): Promise<number> {
        return await super.edit(
            {
                openId: this.openId,
                activityId: this.activityId,
                ...filter
            },
            options
        );
    }

    async add(user: User): Promise<string> {
        return await super.insertOne(user);
    }

    /**
     * 更新用户头像
     */
    async updateUser() {
        await this.editUser({
            $set: {
                avatar: this.data.avatar,
                nick: this.nick
            }
        });
    }

    /**
     * 首次进入
     */
    async enter() {
        //获取活动
        let activity = await this.services.activityService.getActivity();
        //返回信息
        let user = await this.getUser();
        //源用户信息
        let _user = Utils.deepClone(user);
        //初始化用户信息
        this.init(user);
        //比较用户更新信息
        let options = this.compareObj(_user, user);
        //更新用户
        await this.editUser(options);
        //返回
        return {
            user
        };
    }

    /**
     * 初始化用户
     * @private
     */
    private init(user: User) {
        let time = this.time().common;
        //上次初始化时间
        if (user.lastInitTime !== time.YYYYMMDD) {
            //do...
        }
    }

    /**
     * 从当前时间开始获取连续签到天数
     * @param data
     */
    getSuccessiveDay(data) {
        let day = data;
        let successiveDay = 0;
        while (day.length > successiveDay) {
            let time = this.time();
            let target = time.to(-successiveDay).YYYYMMDD;
            if (day.indexOf(target) !== -1) {
                successiveDay += 1;
            } else {
                break;
            }
        }
        return successiveDay;
    }

    /**
     * 获取所有天数里的最长连续天数
     * @param data
     */
    getMaxSuccessiveDay(data) {
        data = data.sort((a, b) => a > b ? 1 : -1);
        let max = 0;
        let tmpMax = 1;
        for (let v of data) {
            let time = new Time(v);
            time = time.to(1).format("YYYY-MM-DD");
            if (data.indexOf(time) !== -1) {
                tmpMax += 1;
            } else {
                if (tmpMax > max) {
                    max = tmpMax;
                }
                tmpMax = 1;
            }
        }
        return max;
    }

    async gameStart() {
        let user = await this.getUser();
        let _user = Utils.deepClone(user);
        let r = this.result;
        r.gameNum = _user.gameNum;
        //有游戏次数
        if (user.gameNum > 0) {
            //游戏状态改为游戏中
            user.gameStatus = 1;
            //游戏次数减一
            user.gameNum -= 1;
            let options = this.compareObj(_user, user);
            let filter = {
                gameNum: _user.gameNum
            }
            //减去游戏次数
            r.code = await this.editUser(options, filter);
            //成功减去游戏次数
            if (r.code > 0) {
                r.gameNum = user.gameNum;
            }
        }
        return r;
    }

    async gameEnd() {
        let user = await this.getUser();
        let _user = Utils.deepClone(user);
        let r = this.result;
        r.score = _user.score;
        //正常结算
        if (user.gameStatus === 1) {
            let {add} = this.data;
            let time = this.time();
            //加分
            user.score += add;
            //更新获取分数时间
            user.lastGetScoreTime = time.common.x;
            let options = this.compareObj(_user, user);
            let filter = {
                score: _user.score
            }
            r.code = await this.editUser(options, filter);
            if (r.code > 0) {
                r.score = user.score;
            }
        } else {
            //不是在游戏中状态结算
        }
        return r;
    }
}