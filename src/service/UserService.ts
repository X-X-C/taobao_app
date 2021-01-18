import User from "../entity/User";
import App from "../../base/App";
import ActivityService from "./ActivityService";
import TopService from "../../base/service/TopService";
import Utils from "../../base/utils/Utils";
import Time from "../../base/utils/Time";
import PrizeService from "./PrizeService";
import Prize from "../entity/Prize";
import MsgGenerate from "../utils/MsgGenerate";
import BaseUserService from "./abstract/BaseUserService";

export default class UserService extends BaseUserService {
    constructor(app: App) {
        super(app);
    }

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
     * 首次进入
     */
    async enter() {
        let activityService = this.services.activityService;
        //获取活动
        let activity = this.globalActivity;
        //获取用户
        let {user, _user} = await this.baseData();
        //获取会员状态
        let vip = await this.services.topService.vipStatus();
        //活动已结束,开奖
        if (activity.code === 2) {
            await activityService.award();
        }
        //活动进行中，初始化用户
        else if (activity.code === 1) {
            let time = this.time().common;
            //入会时间
            if (vip.code === 1 && !user.gmtCreate) {
                user.gmtCreate = vip.data.gmt_create;
                //如果是入会回调且是新会员
                if (this.data.urlback === true && user.createTime <= user.gmtCreate) {
                    await this.spm("newMember");
                }
            }
            let filter = <User>{};
            //如果今天没有初始化过用户
            if (user.lastInitTime !== time.YYYYMMDD) {
                filter.lastInitTime = _user.lastInitTime;
                //初始化用户信息
                this.init(user);
            }
            //比较用户更新信息
            let options = this.compareObj(_user, user);
            //更新用户
            await this.editUser(options, filter);
        }
        //会员状态
        user.vipStatus = vip.code;
        //返回
        this.response.data = {user};
    }

    /**
     * 初始化用户
     * @private
     */
    private init(user: User) {
        let time = this.time().common;
        //上次初始化时间
        if (user.lastInitTime !== time.YYYYMMDD) {
            user.lastInitTime = time.YYYYMMDD;
        }
    }

    /**
     * 游戏开奖
     */
    async gameStart() {
        //活动进行中
        if (this.globalActivity.code === 1) {
            let {user, _user} = await this.baseData();
            this.response.data.gameNum = _user.gameNum;
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
                this.response.success = !!await this.editUser(options, filter);
                //成功减去游戏次数
                if (this.response.success) {
                    this.response.data.gameNum = user.gameNum;
                }
            }
        } else {
            this.response.set201();
        }
    }

    /**
     * 游戏结算
     */
    async gameEnd() {
        if (this.globalActivity.code === 1) {
            let {user, _user} = await this.baseData();
            this.response.data.score = _user.score;
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
                this.response.success = !!await this.editUser(options, filter);
                if (this.response.success) {
                    this.response.data.score = user.score;
                }
            } else {
                //不是在游戏中状态结算
            }
        } else {
            this.response.set201();
        }
    }

    async assist() {
        //当前用户信息
        let {user, _user} = await this.baseData();
        //邀请人信息
        let inviterData = await this.baseData(this.data.sopenId);
        let inviter = inviterData.user;
        let _inviter = inviterData._user;
        //时间对象
        let time = this.time();
        //会员状态
        let vip = await this.services.topService.vipStatus();
        //获取活动
        let status = this.globalActivity;
        //记录值
        let spmData = {
            user: user.baseInfo(),
            inviter: inviter.baseInfo(),
            vip,
            desc: "成功"
        }
        //不在活动时间内
        if (status.code !== 1) {
            this.response.set201();
        }
        //邀请人不存在
        else if (!inviter) {
            this.response.set222("邀请人不存在");
        }
        //当前用户已经被其他用户邀请了
        else if (user.inviter) {
            this.response.set222("已经被其他用户邀请");
        }
        //不能邀请自己
        else if (this.data.inviterOpenId === this.openId) {
            this.response.set222("不能邀请自己");
        }
        //不是会员
        else if (vip.code !== 1) {
            this.response.set222("不是会员");
        }
        //不是新会员
        else if (user.createTime > vip.data.gmt_create || user.task.member === true) {
            this.response.set222("不是新会员");
        }
        //已经是会员
        else if (this.data.urlBack !== true) {
            this.response.set222("已经是会员");
        }
        //超过限制
        else if (inviter.task.assist > 10) {
            this.response.set222("超过邀请限制");
        }
        //条件满足
        else {
            inviter.task.assist += 1;
            let inviterOptions = this.compareObj(_inviter, inviter);
            let inviterFilter = {
                "task.assist.count": _inviter.task.assist,
                openId: inviter.openId
            }
            this.response.success = !!await this.editUser(inviterOptions, inviterFilter);
            //成功
            if (this.response.success) {
                user.inviter = {
                    nick: inviter.nick,
                    openId: inviter.openId,
                    time: time.common.base
                }
                let options = this.compareObj(_user, user);
                this.response.code = await this.editUser(options);
                await this.spm("assist", spmData);
            } else {
                this.response.set501();
            }
        }
        await this.spm("assistAll", spmData);
        let msg = vip.code === 1 ? `首次入会时间【${vip.data.gmt_create}】` : "不是会员";
        spmData.desc = MsgGenerate.assistDesc(user.nick, inviter.nick, this.response.message + msg);
    }

    async lottery() {
        //当前用户信息
        let {user, _user} = await this.baseData();
        let activityService = this.services.activityService;
        //获取活动
        let activity = this.globalActivity;
        this.response.data.award = false;
        //活动进行中
        if (activity.code === 1) {
            //有抽奖次数
            if (user.lotteryCount > 0) {
                user.lotteryCount -= 1;
                let options = this.compareObj(_user, user);
                let filter: any = {
                    lotteryCount: _user.lotteryCount
                }
                this.response.success = !!await this.editUser(options, filter);
                //抽奖成功
                if (this.response.success) {
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
                                $set: {
                                    ["data.grantTotal." + prize.id]: grantDone + 1
                                }
                            }
                            this.response.success = !!await activityService.edit(filter, options);
                            //成功扣减库存
                            if (this.response.success) {
                                let prizeService = this.getService(PrizeService);
                                let sendPrize = new Prize(user, prize, "lottery");
                                if (prize.type === "code") {
                                    sendPrize.code = await prizeService.generateCode();
                                }
                                prize._id = await prizeService.insertOne(sendPrize);
                                this.response.data.prize = prize;
                                this.response.data.award = true;
                            } else {
                                this.response.set501();
                            }
                        }
                    }
                } else {
                    this.response.set501();
                }
            } else {
                this.response.set222("没有抽奖次数");
            }
        } else {
            this.response.set201();
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
        let index = 1 + (page - 1) * size;
        list = list.map(v => {
            return {
                ...v,
                rank: index++
            }
        });
        return list;
    }

    async meRank() {
        let user = await this.getUser();
        let data: any = {
            openId: user.openId,
            avatar: user.avatar,
            activityId: user.activityId,
            score: user.score,
            nick: user.nick,
            rank: false
        }
        if (this.response.data.score <= 0) {
            return this.response.data;
        }
        data.rank = await this.count({
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
        data.rank = data.rank + (await this.aggregate(pipe))[0].rank + 1;
        return data;
    }

    async checkOrder(user: User) {
        let activity = this.globalActivity;
        //如果活动进行中
        if (activity.code === 1) {
            let {startTime, endTime} = activity.data;
            //检查订单
            let result = await this.services.topService.selectOrder(startTime, endTime);
            //结果
            let r = {
                prepaid: {
                    num: 0,
                    data: []
                },
                buy: {
                    num: 0,
                    data: []
                }
            }
            if (result.total_results > 0) {
                //大订单
                let orders = result.trades.trade;
                for (let order of orders) {
                    //是否是预定商品
                    let prepaid = false;
                    //如果订单已付款
                    if (
                        (
                            order.status === "WAIT_SELLER_SEND_GOODS" ||
                            order.status === "WAIT_BUYER_CONFIRM_GOODS" ||
                            order.status === "TRADE_FINISHED" ||
                            order.step_trade_status === "FRONT_PAID_FINAL_NOPAID" ||
                            order.step_trade_status === "FRONT_PAID_FINAL_PAID"
                        ) &&
                        (user.task.doneOrders.indexOf(order.tid) === -1)
                    ) {
                        user.task.doneOrders.push(order.tid);
                        //如果是下定
                        if (order.step_trade_status === "FRONT_PAID_FINAL_NOPAID" ||
                            order.step_trade_status === "FRONT_PAID_FINAL_PAID") {
                            prepaid = true;
                        }
                        for (let goods of order.orders.order) {
                            if (prepaid) {
                                r.prepaid.num += goods.num;
                                r.prepaid.data.push(goods);
                            } else {
                                r.buy.num += goods.num;
                                r.buy.data.push(goods);
                            }
                        }
                    }
                }
            }
        }
    }

    async userInfo() {
        this.response.data = {
            user: await this.getUser()
        }
    }

    async normalTask(type) {
        let activity = this.globalActivity;
        if (activity.code !== 1) {
            this.response.set201();
        } else {
            let {user, _user} = await this.baseData();
            let filter;
            switch (type) {
                case 'follow':
                case 'sign':
                case 'member':
                    if (user.task[type] === false) {
                        if (type === "member") {
                            let vipStatus = await this.services.topService.vipStatus();
                            //不是会员
                            if (vipStatus.code !== 1) {
                                this.response.set222("不是会员");
                                break;
                            }
                        }
                        //更改所属任务完成状态
                        user.task[type] = true;
                        filter = {
                            ['task.' + type]: false
                        }
                    } else {
                        this.response.set222("已经完成过此任务");
                    }
                    break;
                default:
                    this.response.set222("无效的任务类型");
            }
            if (filter) {
                this.response.success = !!(await this.editUser(this.compareObj(_user, user), filter));
                if (this.response.success) {
                    await this.spm(type);
                } else {
                    this.response.set501();
                }
            }
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
}
