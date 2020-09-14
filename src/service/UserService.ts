import UserDao from "../dao/UserDao";
import User from "../entity/User";
import BaseService from "./abstract/BaseService";
import TopService from "./TopService";
import SpmService from "./SpmService";
import ActivityService from "./ActivityService";

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
                user.createTime = this.time.base;
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

    /**
     * 助力
     * @param inviterOpenId
     */
    async assist(inviterOpenId) {
        let rs: any = {
            code: 1,
            msg: ""
        }
        let spmBeans = [];
        let topService = new TopService(this.context);
        let spmService = new SpmService(this.context);
        //当前用户
        let user = await this.get();
        //邀请人
        let inviter = await this.get(inviterOpenId);
        //当前用户会员状态
        let vip = await topService.vipStatus();
        //如果邀请人不存在
        if (!inviter) {
            rs.code = -1;
            rs.msg = `用户【${inviterOpenId}】不存在`
        }
        //不能邀请自己
        else if (inviterOpenId === this.openId) {
            rs.code = -2;
            rs.msg = `【${user.nick}-${user.openId}】不能邀请自己`;
        }
        //如果已经被邀请过了
        else if (user.inviter.openId !== false) {
            rs.code = -3;
            rs.msg = `用户【${user.nick}-${user.openId}】在【${user.inviter.time}】已经被【${user.inviter.nick}-${user.inviter.openId}】邀请过了`;
        }
        //如果当前用户不是会员
        else if (vip === false) {
            rs.code = -4;
            rs.msg = `用户【${user.nick}-${user.openId}】不是会员`;
        }
        //如果当前用户不是首次入会
        else if (vip.gmt_create < user.createTime) {
            rs.code = -5;
            rs.msg = `用户【${user.nick}-${user.openId}】不是首次入会，入会时间【${vip.gmt_create}】，进入小程序时间【${user.createTime}】`;
        }
        //可以助力
        else {
            let userOptions: any = {
                $set: <User>{},
                $inc: <User>{}
            }
            let inviterOptions: any = {
                $set: <User>{},
                $inc: <User>{},
                $push: <User>{}
            }
            userOptions.$set.inviter = {
                openId: inviter.openId,
                nick: inviter.nick,
                time: this.time.base
            };
            //TODO 邀请成功
            //更新用户
            await this.edit(userOptions);
            await this.edit(inviterOptions, {openId: inviterOpenId})
            rs.msg = `【${inviter.nick}-${inviter.openId}】成功邀请【${user.nick}-${user.openId}】`;
        }
        spmBeans.push(spmService.bean("assist", {
            ...rs,
            user,
            inviter
        }));
        await spmService.add(spmBeans);
        return rs;
    }

    /**
     * 排行榜
     * @param opt
     */
    async rank(opt: {
        lessInfo?: boolean,  //简化用户昵称
        limit?: number  //限制取出条数，默认10条
    } = {}) {
        let options: any = {
            sort: {
                score: -1,
                lastGetScoreTime: 1
            },
            limit: opt.limit || 10
        }
        let data = await super.getAll(
            {
                activityId: this.data.activityId,
                score: {
                    $ne: 0
                },
                bot: {
                    $ne: true
                }
            },
            options
        );
        if (opt.lessInfo === true) {
        } else {
            return data;
        }
    }

    /**
     * 入口函数
     */
    async enter() {
        let rs: any = {};
        let options = {
            $push: <User>{},
            $set: <User>{},
            $inc: <User>{}
        }
        let services = {
            spmService: new SpmService(this.context),
            activityService: new ActivityService(this.context),
            topService: new TopService(this.context),
        }
        //埋点PV UV
        await services.spmService.addSpm("view");
        //当前用户
        rs.user = await this.get();
        //用户会员状态
        rs.vipStatus = !!(await services.topService.vipStatus());
        //获取活动状态
        rs.activity = await services.activityService.init(this);
        //检查订单
        rs.checkOrder = await this.checkOrder(services, options);
        //初始化用户
        await this.init(options);
        //更新用户
        await this.edit(options);
        return rs;
    }

    /**
     * 初始化用户
     */
    async init(options) {
        let user = await this.get();
    }

    /**
     * 检查订单
     * @param services
     * @param options
     */
    async checkOrder(services, options) {
        let rs = {
            buy: {
                num: 0,
                data: []
            },
            prepaid: {
                num: 0,
                data: []
            }
        }
        let activity = await services.activityService.get();
        let user = await this.get();
        activity = activity.data;
        let start = activity.startTime;
        let end = activity.endTime;
        let result = await services.topService.selectOrder(start, end);
        options.$push["task.doneOrders"] = {
            $each: []
        }
        if (result.total_results > 0) {
            //大订单
            let orders = result.trades.trade;
            for (let order of orders) {
                //如果订单已付款
                if (
                    (
                        order.status === "WAIT_SELLER_SEND_GOODS" ||
                        order.status === "WAIT_BUYER_CONFIRM_GOODS" ||
                        order.status === "TRADE_FINISHED" ||
                        order.step_trade_status === "FRONT_PAID_FINAL_NOPAID" ||
                        order.step_trade_status === "FRONT_PAID_FINAL_PAID"
                    ) &&
                    //没有通过此符合条件的订单加过分数
                    user.task.doneOrders.indexOf(order.tid) === -1
                ) {
                    //符合条件，用户已完成订单增加订单ID
                    options.$push["task.doneOrders"].$each.push(order.tid)
                    let prepaidOrder = false;
                    if (
                        //如果是下定
                        order.step_trade_status === "FRONT_PAID_FINAL_NOPAID" ||
                        order.step_trade_status === "FRONT_PAID_FINAL_PAID"
                    ) {
                        prepaidOrder = true;
                    }
                    for (let goods of order.orders.order) {
                        //如果是指定下定且没有被+过分
                        if (prepaidOrder) {
                            rs.prepaid.num += goods.num;
                            rs.prepaid.data.push(order);
                        }
                        //如果是指定购买
                        else {
                            rs.buy.num += goods.num;
                            rs.buy.data.push(order);
                        }
                    }
                }
            }
            //TODO 下定操作
            Object.assign(this.data, rs);
            if (rs.buy.num !== 0) {
                //埋点购买
                await services.spmService.addSpm("buy");
            } else if (rs.prepaid.num !== 0) {
                //埋点下定
                await services.spmService.addSpm("prepaid");
            }
        }
        return rs;
    }

    /**
     * 更新用户头像
     */
    async updateUser() {
        return await this.edit({
            $set: {
                avatar: this.data.avatar,
                nick: this.nick
            }
        })
    }

    /**
     * 我的排名
     */
    async selfRank() {
        //获取当前用户
        let user: User = await this.get();
        //如果用户没有分数，则没有排名
        if (user.score === 0) {
            return {
                rank: false
            }
        }
        let pipe = [
            {
                $match: {
                    score: {
                        $ne: 0,
                        $gte: user.score
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
                $group: {
                    _id: null,
                    rank: {
                        $push: "$openId"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    rank: {
                        $indexOfArray: ["$rank", user.openId]
                    }
                }
            }
        ]
        let rank = await this.dao.aggregate(pipe);
        rank = rank[0].rank + 1;
        return {
            rank,
            user
        }
    }

    /**
     * 入会
     */
    async enterMember() {
        let rs: any = {
            code: -1,
        }
        let topService = new TopService(this.context);
        let vip = await topService.vipStatus();
        let user = await this.get();
        //如果用户不是会员
        if (vip === false) {
            rs.code = -2;
            return rs;
        }
        //如果用户没有完成入会任务
        else if (user.task.vip === false) {
            let filter = {
                "task.vip": false
            }
            let options = {
                //TODO 入会奖励操作
                $set: {
                    "task.vip": true
                }
            }
            rs.code = await this.edit(options, filter);
            let spmService = new SpmService(this.context);
            // 新会员
            if (user.createTime <= vip.gmt_create) {
                await spmService.addSpm("enterMember");
            }
        }
        return rs;
    }

    /**
     * 修改用户
     * @param filter
     * @param options
     */
    async edit(options, filter: object = {}) {
        return await super.edit(
            {
                openId: this.openId,
                activityId: this.activityId,
                ...filter
            },
            options
        );
    }

    async add(user) {
        return await super.add(user);
    }
}