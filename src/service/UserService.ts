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
import BaseResult from "../../base/dto/BaseResult";

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

    async enter() {
        let activityService = this.services.activityService;
        //获取活动
        let activity = this.globalActivity;
        //获取用户
        let user = await this.getUser();
        user.optionsStart;
        //获取会员状态
        let vip = await this.services.topService.vipStatus();
        //活动已结束,开奖
        if (activity.code === 2) {
            try {
                await activityService.award();
            } catch (e) {

            }
        }
        //活动进行中，初始化用户
        else if (activity.code === 1) {
            let time = this.time().common;
            let filter = <User>{};
            //如果今天没有初始化过用户
            if (user.lastInitTime !== time.YYYYMMDD) {
                filter.lastInitTime = user._.lastInitTime;
                //初始化用户信息
                this.init(user);
            }
            try {
                //更新用户
                await this.editUser(user.optionsEnd, filter);
            } catch (e) {

            }
        }
        //会员状态
        user.vipStatus = vip.code;
        user.delete_;
        //返回
        this.response.data.user = user;
    }

    private init(user: User) {
        let time = this.time().common;
        //上次初始化时间
        if (user.lastInitTime !== time.YYYYMMDD) {
            user.lastInitTime = time.YYYYMMDD;
        }
    }

    async gameStart() {
        let user = await this.getUser();
        user.optionsStart;
        if (user.gameNum <= 0) {
            this.response.set222("没有游戏次数");
            return;
        }
        //游戏状态改为游戏中
        user.gameStatus = 1;
        //游戏次数减一
        user.gameNum -= 1;
        //减去游戏次数
        await this.editUser(user.optionsEnd, {
            gameNum: user._.gameNum
        });
        //成功减去游戏次数
        this.response.data.gameNum = user.gameNum;
    }

    async gameEnd() {
        let user = await this.getUser();
        user.optionsStart;
        if (user.gameStatus !== 1) {
            this.response.set222("结算失败");
            return;
        }
        let {add} = this.data;
        let time = this.time();
        //加分
        user.score += add;
        //更新获取分数时间
        user.lastGetScoreTime = time.common.x;
        //更新游戏状态
        user.gameStatus = 0;
        await this.editUser(user.optionsEnd, {
            score: user._.score
        });
        this.response.data.score = user.score;
    }

    async assist() {
        //当前用户信息
        let user = await this.getUser();
        user.optionsStart;
        //邀请人信息
        let inviter = await this.getUser(this.data.sopenId);
        inviter.optionsStart;
        //时间对象
        let time = this.time();
        //会员状态
        let vip = await this.services.topService.vipStatus();
        //记录值
        let spmData = {
            user: user.baseInfo(),
            inviter: inviter.baseInfo(),
            vip,
            code: 0,
            desc: "成功"
        }
        //邀请人不存在
        if (!inviter) {
            this.response.code = 202;
            this.response.message = "邀请人不存在";
        }
        //当前用户已经被其他用户邀请了
        else if (user.inviter) {
            this.response.code = 203;
            this.response.message = "已经被其他用户邀请";
        }
        //不能邀请自己
        else if (inviter.openId === this.openId) {
            this.response.code = 204;
            this.response.message = "不能邀请自己";
        }
        //不是会员
        else if (vip.code !== 1) {
            this.response.code = 205;
            this.response.message = "不是会员";
        }
        //不是新会员
        else if (user.createTime > vip.data.gmt_create || user.task.member === true) {
            this.response.code = 206;
            this.response.message = "不是新会员";
        }
        //已经是会员
        else if (this.data.urlback !== true) {
            this.response.code = 207;
            this.response.message = "已经是会员";
        }
        //超过限制
        else if (inviter.task.assist > 10) {
            this.response.code = 208;
            this.response.message = "超过邀请限制";
        }
        //条件满足
        else {
            inviter.task.assist += 1;
            await this.editUser(inviter.optionsEnd, {
                "task.assist.count": inviter._.task.assist,
                openId: inviter.openId
            });
            //成功
            user.inviter = {
                nick: inviter.nick,
                openId: inviter.openId,
                time: time.common.base
            }
            this.response.code = await this.editUser(user.optionsEnd);
            await this.spm("assist", spmData);
        }
        let msg = vip.code === 1 ? `首次入会时间【${vip.data.gmt_create}】` : "不是会员";
        spmData.desc = MsgGenerate.assistDesc(user.nick, inviter.nick, this.response.message + msg);
        spmData.code = this.response.code;
        await this.spm("assistAll", spmData);
    }

    async lottery() {
        //当前用户信息
        let user = await this.getUser();
        user.optionsStart;
        let activityService = this.services.activityService;
        //获取活动
        let activity = this.globalActivity;
        this.response.data.award = false;

        if (user.lotteryCount <= 0) {
            this.response.set222("没有抽奖次数");
            return;
        }
        //有抽奖次数
        user.lotteryCount -= 1;
        await this.editUser(user.optionsEnd, {
            lotteryCount: user._.lotteryCount
        });
        this.response.data.lotteryCount = user.lotteryCount;

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
                await activityService.updateStock(prize.id, grantDone, grantDone + 1);
                //成功扣减库存
                let prizeService = this.getService(PrizeService);
                let sendPrize = new Prize(user, prize, "lottery");
                if (prize.type === "code") {
                    sendPrize.ext.code = await prizeService.generateCode();
                }
                prize._id = await prizeService.insertOne(sendPrize);
                this.response.data.prize = prize;
                this.response.data.award = true;
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
        this.response.data = {
            openId: user.openId,
            avatar: user.avatar,
            activityId: user.activityId,
            score: user.score,
            nick: user.nick,
            rank: "-"
        }
        if (this.response.data.score <= 0) {
            return;
        }
        let rank = await this.count({
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
        rank = rank + (await this.aggregate(pipe))[0].rank + 1;
        this.response.data.rank = rank;
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
        let user = await this.getUser();
        user.vipStatus = (await this.services.topService.vipStatus()).code;
        this.response.data.user = user;
    }

    async normalTask(type) {
        let user = await this.getUser();
        user.optionsStart;
        let filter;
        switch (type) {
            case 'follow':
            case 'sign':
            case 'member':
                if (user.task[type] !== false) {
                    this.response.set222("已经完成过此任务");
                    return;
                }
                if (type === "member") {
                    let vipStatus = await this.services.topService.vipStatus();
                    //不是会员
                    if (vipStatus.code !== 1) {
                        this.response.set222("不是会员");
                        return;
                    } else {
                        //埋点新会员
                        if (user.gmtCreate <= vipStatus.data.gmt_create) {
                            await this.spm("member");
                        }
                    }
                }
                //更改所属任务完成状态
                user.task[type] = true;
                filter = {
                    ['task.' + type]: false
                }
                break;
            default:
                this.response.set222("无效的任务类型");
                return;
        }
        await this.editUser(user.optionsEnd, filter);
        //排除
        if (["member"].indexOf(type) === -1) {
            await this.spm(type);
        }
    }

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
