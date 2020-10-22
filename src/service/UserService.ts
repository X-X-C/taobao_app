import UserDao from "../dao/UserDao";
import User from "../entity/User";
import BaseService from "./abstract/BaseService";
import App from "../App";
import Utils from "../utils/Utils";
import Time from "../utils/Time";
import ActivityService from "./ActivityService";
import TopService from "./TopService";
import Prize from "../entity/Prize";
import PrizeService from "./PrizeService";

export default class UserService extends BaseService<UserDao<User>, User> {
    constructor(app: App) {
        super(UserDao, app);
    }

    private user: User;

    get services() {
        return {
            activityService: this.getService(ActivityService),
            topService: this.getService(TopService)
        }
    }

    async baseData(openId = this.openId) {
        let user = await this.getUser(openId);
        let _user = Utils.deepClone(user);
        return {
            user,
            _user
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
        let {user, _user} = await this.baseData();
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

    /**
     * 游戏开奖
     */
    async gameStart() {
        let {user, _user} = await this.baseData();
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

    /**
     * 游戏结算
     */
    async gameEnd() {
        let {user, _user} = await this.baseData();
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
            //更新游戏状态
            user.gameStatus = 0;
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


    async follow() {
        let {user, _user} = await this.baseData();
        let r = this.result;
        //没有关注过店铺
        if (user.task.follow === false) {
            user.task.follow = true;
            let options = this.compareObj(_user, user);
            let filter = <User>{
                task: {
                    follow: true
                }
            }
            r.code = await this.editUser(options, filter);
        }
        return r;
    }

    async assist() {
        //当前用户信息
        let {user, _user} = await this.baseData();
        //邀请人信息
        let inviterData = await this.baseData(this.data.inviterOpenId);
        let inviter = inviterData.user;
        let _inviter = inviterData._user;
        //时间对象
        let time = this.time();
        //会员状态
        let vip = await this.services.topService.vipStatus();
        //获取活动
        let status = await this.services.activityService.getActivityStatus();
        //返回值
        let r = this.result;
        //记录值
        let spmData = {
            user,
            inviter: inviter || this.data.inviterOpenId,
            vip
        }
        //不在活动时间内
        if (status.code !== 1) {
            r.code = -1;
            r.message = "不在活动时间内"
        }
        //邀请人不存在
        else if (!inviter) {
            r.code = -2;
            r.message = "邀请人不存在"
        }
        //当前用户已经被其他用户邀请了
        else if (user.inviter) {
            r.code = -3;
            r.message = "已经被其他用户邀请"
        }
        //不能邀请自己
        else if (this.data.inviterOpenId === this.openId) {
            r.code = -4;
            r.message = "不能邀请自己"
        }
        //不是会员
        else if (vip.code !== 1) {
            r.code = -5;
            r.message = "不是会员"
        }
        //不是新会员
        else if (user.createTime > vip.data.gmt_create || user.task.member === true) {
            r.code = -6;
            r.message = "不是新会员"
        }
        //已经是会员
        else if (this.data.urlBack !== true) {
            r.code = -7;
            r.message = "已经是会员"
        }
        //超过限制
        else if (inviter.task.assist.count > 10) {
            r.code = -8;
            r.message = "超过邀请限制"
        }
        //条件满足
        else {
            //todo 邀请人操作
            inviter.task.assist.count += 1;
            let inviterOptions = this.compareObj(_inviter, inviter);
            let inviterFilter = {
                "task.assist.count": _inviter.task.assist.count,
                openId: inviter.openId
            }
            r.code = await this.editUser(inviterOptions, inviterFilter);
            //成功
            if (r.code > 0) {
                user.inviter = {
                    nick: inviter.nick,
                    openId: inviter.openId,
                    time: time.common.base
                }
                let options = this.compareObj(_user, user);
                r.code = await this.editUser(options);
                this.spm("assist", spmData, {
                    openId: inviter.openId,
                    nick: inviter.nick
                });
            }
        }
        this.spm("assistAll", spmData, {
            openId: inviter.openId,
            nick: inviter.nick
        });
        Object.assign(spmData, r);
        return r;
    }

    async lottery() {
        //当前用户信息
        let {user, _user} = await this.baseData();
        let activityService = this.services.activityService;
        //获取活动
        let activity = await activityService.getActivity({
            startTime: 1,
            endTime: 1,
            config: 1
        })
        //返回值
        let r = this.result;
        r.award = false;
        //活动进行中
        if (activity.code === 1) {
            //有抽奖次数
            if (user.lotteryCount > 0) {
                user.lotteryCount -= 1;
                let options = this.compareObj(_user, user);
                let filter: any = {
                    lotteryCount: _user.lotteryCount
                }
                r.code = await this.editUser(options, filter);
                //抽奖成功
                if (r.code > 0) {
                    let prizeList = activity.data.config.lotteryPrize.prizeList;
                    let awardIndex = Utils.random(prizeList.map(v => parseFloat(v.probability)));
                    //抽中的奖品
                    let prize = prizeList[awardIndex];
                    //不是未中奖
                    if (prize.type !== "noprize") {
                        //查询库存
                        let grantDone = activity.data.data.grantTotal[prize.id] || 0;
                        //有剩余库存
                        if (grantDone < prize.stock) {
                            filter = {
                                _id: this.activityId,
                                $or: [
                                    {
                                        ["data.grantTotal." + prize.id]: {
                                            $exists: false
                                        },
                                    },
                                    {
                                        ["data.grantTotal." + prize.id]: grantDone
                                    }
                                ]
                            }
                            options = {
                                $inc: {
                                    ["data.grantTotal." + prize.id]: 1
                                }
                            }
                            r.code = await activityService.edit(filter, options);
                            //成功扣减库存
                            if (r.code >= 1) {
                                let prizeService = this.getService(PrizeService);
                                let sendPrize = new Prize(user, prize, "lottery");
                                if (prize.type === "code") {
                                    sendPrize.code = await prizeService.generateCode();
                                }
                                sendPrize._id = await prizeService.insertOne(sendPrize);
                                r.prize = sendPrize;
                                r.award = true;
                            }
                        }
                    }
                }
            }
        }
    }

    async rank(size: number = this.data.size || 50, page: number = this.data.page || 1) {
        let pipe = [
            {
                $match: {
                    activityId: this.activityId,
                    score: {
                        $gt: 0
                    }
                }
            },
            {
                $sort: {
                    score: -1,
                    lastGetScoreTime: 1
                }
            },
            {
                $skip: (page - 1) * size
            },
            {
                $limit: size
            },
            {
                $project: {
                    _id: 0,
                    openId: 1,
                    avatar: 1,
                    activityId: 1,
                    score: 1,
                    nick: 1
                }
            }
        ]
        let list = await this.aggregate(pipe);
        let index = 1;
        list = list.map(v => {
            return {
                ...v,
                rank: index++
            }
        });
        return {
            list
        }
    }

    async meRank() {
        let user = await this.getUser();
        let r: any = {
            openId: user.openId,
            avatar: user.avatar,
            activityId: user.activityId,
            score: user.score,
            nick: user.nick,
            rank: false
        }
        if (r.score <= 0) {
            return r;
        }
        r.rank = await this.count({
            activityId: this.activityId,
            score: {
                $gt: user.score
            }
        });
        let pipe = [
            {
                $match: {
                    activityId: this.activityId,
                    score: user.score
                }
            },
            {
                $sort: {
                    score: -1,
                    lastGetScoreTime: 1
                }
            },
            {
                $group: {
                    _id: null,
                    ids: {
                        $push: "$openId"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    rank: {
                        $indexOfArray: ["$ids", user.openId]
                    }
                }
            }
        ]
        r.rank = r.rank + (await this.aggregate(pipe))[0].rank + 1;
        return r;
    }


}