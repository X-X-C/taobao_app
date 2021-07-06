import User from "../entity/User";
import ActivityService from "./ActivityService";
import TopService from "../../base/service/TopService";
import Utils from "../../base/utils/Utils";
import PrizeService from "./PrizeService";
import Prize from "../entity/Prize";
import MsgGenerate from "../utils/MsgGenerate";
import BaseUserService from "./abstract/BaseUserService";
import ActivityInfoService from "../../base/service/ActivityInfoService";
import {before, exp, ignoreGlobalParam} from "../../base/utils/Annotation";
import {Before} from "../config/Before";
import {taskConfig} from "../config/Config";
import {joinMsg, trulyMsg} from "../../base/utils/XMsgGenerate";

const {random} = Utils;

export default class UserService extends BaseUserService {

    get services() {
        return {
            activityService: this.getService(ActivityService),
            topService: this.getService(TopService)
        }
    }


    /**
     * @api {app} enter 获取初始信息
     * @apiDescription 获取初始信息
     * @apiSuccessExample
     * {}
     */
    @before(Before.prototype.globalActivityInfo)
    @ignoreGlobalParam()
    @exp()
    async enter() {
        let activityService = this.services.activityService;
        let activity = this.globalActivity;
        let user = await this.getUser();
        let vip = await this.services.topService.vipStatus().vipStatusInvoke();
        //活动进行中，初始化用户
        if (activity.code === 1) {
            let time = this.time().common;
            let filter = <User>{};
            //如果今天没有初始化过用户
            if (user.lastInitTime !== time.YYYYMMDD) {
                filter.lastInitTime = user._.lastInitTime;
                //初始化用户信息
                await this.init(user);
            }
            //更新用户
            await this.loosen.editUser(user.optionsEnd, filter);
        }
        //活动已结束
        else if (activity.code === 2) {
            await activityService.award();
        }
        //会员状态
        user.vipStatus = vip.code;
        user.isAuth = !!this.context.userNick;
        //返回
        this.response.data.user = user.showData;
        await this.spmPv();
    }

    async init(user: User) {
        let time = this.time().common;
        //上次初始化时间
        if (user.lastInitTime !== time.YYYYMMDD) {
            user.lastInitTime = time.YYYYMMDD;
        }
    }

    /**
     * @api {app} gameStart 开始游戏
     * @apiDescription 开始游戏
     * @apiSuccessExample
     * {
   	//200-成功
    //201-不在活动时间内
    //222-失败
    "code": 200,
    "data": {
        //剩余游戏次数
        "gameNum": 0
    },
    "success": true,
    "message": "成功"
}
     */
    @before(Before.prototype.inspectionActivity)
    @exp()
    async gameStart() {
        let user = await this.getUser();
        if (!(user.gameNum > 0)) {
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
        this.spmGameNum(user, "开始游戏");
        //成功减去游戏次数
        this.response.data.gameNum = user.gameNum;
    }

    /**
     * @api {app} gameEnd 结束游戏
     * @apiDescription 结束游戏
     * @apiParam {number} add 新增分数
     * @apiSuccessExample
     * {
    //200-成功
    //201-不在活动时间内
    //222-失败
    "code": 200,
    "data": {
        //剩余分数
        "score": 10000
    },
    "success": true,
    "message": "成功"
}
     */
    @before(Before.prototype.inspectionActivity)
    @exp({add: "number"})
    async gameEnd() {
        let user = await this.getUser();
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
        this.spmScore(user, "游戏结算");
        this.response.data.score = user.score;
    }

    /**
     * @api {app} assist 助力
     * @apiDescription 助力
     * @apiParam {string} sopenId 邀请者openId
     * @apiSuccessExample
     * {
    //200 成功
    //201 不在活动时间内
    //202 邀请人不存在
    //203 已经被其他用户邀请
    //204 不能邀请自己
    //205 不是会员
    //206 不是新会员
    //208 超过邀请限制
    "code": 202,
    "data": {},
    //是否成功邀请
    "success": true,
    "message": "邀请人不存在"
}
     */
    @before(Before.prototype.inspectionActivity)
    @exp({sopenId: "string"})
    async assist() {
        let {sopenId} = this.data;
        let user = await this.getUser();
        let inviter = await this.getUser(sopenId);
        let time = this.time().common.base;
        let vip = await this.services.topService.vipStatus().vipStatusInvoke();
        if (!inviter.openId) {
            this.response.code = 202;
            this.response.message = "邀请人不存在";
        } else if (user.inviter) {
            this.response.code = 203;
            this.response.message = "已经被其他用户邀请";
        } else if (inviter.openId === this.openId) {
            this.response.code = 204;
            this.response.message = "不能邀请自己";
        } else if (vip.code !== 1) {
            this.response.code = 205;
            this.response.message = "不是会员";
        } else if (user.createTime > vip.data.gmt_create) {
            this.response.code = 206;
            this.response.message = "不是新会员";
        } else if (!(inviter.task.assist < 10)) {
            this.response.code = 208;
            this.response.message = "超过邀请限制";
        } else {
            inviter.task.assist += 1;
            // inviter.gameNum += taskConfig.assist.reward;
            await this.editUser(inviter.optionsEnd, {
                "task.assist": inviter._.task.assist,
                openId: inviter.openId
            });
            // this.spmGameNum(inviter, `成功邀请好友【${user.nick}】`).cover(inviter.baseInfo);
            //成功
            user.inviter = {
                nick: inviter.nick,
                openId: inviter.openId,
                time: time
            }
            await this.editUser(user.optionsEnd);
            await this.spm("assist");
        }
        let msg = vip.code === 1 ? `，首次入会时间【${vip.data.gmt_create}】。` : "，不是会员。";
        this.simpleSpm("assistAll").extData({
            vip,
            user: user.baseInfo,
            inviter: inviter.baseInfo,
            code: this.response.code,
            desc: MsgGenerate.assistDesc(user.nick, inviter.nick, this.response.message + msg + `首次进入小程序时间【${user.createTime}】`)
        });
    }

    /**
     * @api {app} lottery 抽奖
     * @apiDescription 抽奖
     * @apiSuccessExample
     * {
    //200-成功
    //201-不在活动时间内
    "code": 200,
    "data": {
        //是否中奖
        "award": true,
        //与我的奖品里的单个奖品格式相同
        "prize": {
        },
        //剩余抽奖次数
        "lotteryCount": 1
    },
    "success": true,
    "message": "成功"
}
     */
    @before(
        Before.prototype.inspectionActivity,
        Before.prototype.globalActivityInfo
    )
    @exp()
    async lottery() {
        let user = await this.getUser();
        let activity = this.globalActivity;
        this.response.data.award = false;
        if (!(user.lotteryCount > 0)) {
            this.response.set222("没有抽奖次数");
            return;
        }
        user.lotteryCount -= 1;
        await this.editUser(user.optionsEnd, {
            lotteryCount: user._.lotteryCount
        });
        this.spmLotteryCount(user, "抽奖");
        let prizeList = activity.data.config.lotteryPrize.prizeList;
        let awardIndex = random(prizeList.map(v => parseFloat(v.probability)));
        let prize = prizeList[awardIndex];
        this.response.data.lotteryCount = user.lotteryCount;
        this.response.data.prize = new Prize(user, prizeList.find(v => v.type === "noprize"), "lottery");
        this.response.message = "成功抽奖";
        let prizeService = this.getService(PrizeService);
        if (prize && prize.type !== "noprize") {
            let stockInfo = this.stockInfo(prize);
            if (!stockInfo.restStock) {
                this.response.message = joinMsg([
                    `无库存，未中奖，已发库存：${stockInfo.done}`,
                    trulyMsg(stockInfo.dayDone, `当日已发库存：${stockInfo.dayDone}`)
                ])
            } else {
                let line = await this.getService(ActivityInfoService).loosen.updateStock(stockInfo, 1);
                if (line !== 1) {
                    this.response.message = "网络繁忙，未中奖";
                } else {
                    //成功扣减库存
                    let sendPrize = new Prize(user, prize, "lottery");
                    if (prize.type === "code") {
                        sendPrize.ext.code = await prizeService.generateCode();
                    }
                    sendPrize._id = await prizeService.insertOne(sendPrize);
                    this.response.data.prize = sendPrize;
                    this.response.data.award = true;
                }
            }
        }
        if (!prize) {
            prize = {
                name: "没有奖品可中，未中奖"
            } as configPrize;
        }
        this.spmLotteryResult(user, prize, this.response.message);
    }

    async rankData(size: number = this.data.size || 50, page: number = this.data.page || 1) {
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

    /**
     * @api {app} rank 排行榜
     * @apiDescription 排行榜
     * @apiParam {number} [page] 页数
     * @apiParam {number} [size] 每页显示条数
     * @apiSuccessExample
     *{
    "code": 200,
    "data": {
        "list": [
            {
                "nick": "牧**",
                //分数
                "score": 10000,
                "activityId": "608775329897b453554c72fe",
                "openId": "AAHvNcpFANgOFJhVCORYvt7O",
                //排名
                "rank": 1,
                //头像
                "avatar": false
            }
        ]
    },
    "success": true,
    "message": "成功"
}
     */
    @exp()
    async rank(page = this.data.page, size = this.data.size) {
        let list = await this.rankData(size, page);
        this.response.data.list = list.map(v => v);
    }

    /**
     * @api {app} meRank 我的排名
     * @apiDescription 我的排名
     * @apiSuccessExample
     * {
    "code": 200,
    "data": {
        "nick": "牧**",
        "activityId": "608775329897b453554c72fe",
        "score": 10000,
        "openId": "AAHvNcpFANgOFJhVCORYvt7O",
        "rank": 1,
        "avatar": false
    },
    "success": true,
    "message": "成功"
}
     */
    @exp()
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
        if (user.score <= 0) {
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
            let result = await this.services.topService.selectOrder({
                startTime,
                endTime
            }).invoke();
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
                        this.simpleSpm("_order").extData({order});
                        user.task.doneOrders.push(order.tid);
                        //如果是下定
                        if (order.step_trade_status === "FRONT_PAID_FINAL_NOPAID" ||
                            order.step_trade_status === "FRONT_PAID_FINAL_PAID") {
                            prepaid = true;
                        }
                        for (let goods of order.orders.order) {
                            if (prepaid) {
                                //预定商品
                            } else {
                                //其他商品
                            }
                        }
                    }
                }
            }
        }
    }


    /**
     * @api {app} userInfo 获取用户信息
     * @apiDescription 获取用户信息
     * @apiSuccessExample
     * //同enter里的用户信息
     */
    @exp()
    async userInfo() {
        let user = await this.getUser();
        user.vipStatus = (await this.services.topService.vipStatus().vipStatusInvoke()).code;
        user.isAuth = !!this.context.userNick;
        this.response.data.user = user.showData;
    }

    /**
     * @api {app} task 完成任务
     * @apiDescription 完成任务
     * @apiParam {string} type 任务类型，可选值`follow`关注店铺,`member`加入会员
     * @apiSuccessExample
     * {
    //200-成功
    //201-不在活动时间内
    //222-失败
    "code": 200,
    "data": {
    },
    "success": true,
    "message": "成功"
}
     */
    @before(Before.prototype.inspectionActivity)
    @exp()
    async task() {
        let {type} = this.data;
        let user = await this.getUser();
        let task = taskConfig[type];
        if (!task || task.type !== "normal") {
            this.response.set222("无效的任务类型");
            return;
        }
        switch (type) {
            case "follow":
                if (user.task[type] !== false) {
                    this.response.set222("已经完成过此任务");
                    return;
                }
                //完成任务
                user.task[type] = true;
                break;
        }
        await this.editUser(user.optionsEnd, {});
        await this.spm(type);
        //  this.spmGameNum(user, task.name);
    }

    /**
     * @api {app} spmMember 埋点会员
     * @apiDescription 埋点会员
     * @apiParam {string} type 埋点会员类型，可选值`self`自主入会，`assist`助力入会。
     * @apiSuccessExample
     * {
    "data": {
    },
    "success": true,
    "message": "成功",
    "code": 200
}
     */
    @exp({type: "string"})
    async spmMember() {
        let user = await this.getUser();
        let {type} = this.data;
        let vip = await this.services.topService.vipStatus().vipStatusInvoke();
        if (vip.code === 1 && vip.data.gmt_create >= user.createTime) {
            if (user.memberType === 0) {
                if (type === "self") {
                    user.memberType = 1;
                } else if (type === "assist") {
                    user.memberType = 2;
                }
                await this.editUser(user.optionsEnd);
            }
            if (user.memberType === 1) {
                //new member
                await this.spm("newMember");
            } else if (user.memberType === 2) {
                //assist member
                await this.spm("assistMember");
            }
        }
    }

    /**
     * @api {app} getTime 获取服务器时间
     * @apiDescription 获取服务器时间
     * @apiSuccessExample
     * {
    "code": 200,
    "data": {
        //时间戳
        "x": 1622170025121,
        //时间
        "base": "2021-05-28 10:47:05"
    },
    "success": true,
    "message": "成功",
    "params": {}
}
     */
    @ignoreGlobalParam()
    @exp()
    getTime() {
        this.response.data = this.time().common;
    }

}
