import BaseService from "../../../base/service/abstract/BaseService";
import User from "../../entity/User";
import Utils from "../../../base/utils/Utils";
import MsgGenerate from "../../utils/MsgGenerate";
import {before, exp} from "../../../base/utils/Annotation";
import {Before} from "../../config/Before";
import App from "../../../App";

let {formatNum} = Utils;

export default class BaseUserService extends BaseService<User, App> {
    constructor(app: App) {
        super(app, "users");
    }

    protected user: User;

    /**
     * 获取用户
     * @param openId
     * @param project
     */
    async getUser(openId: string = this.openId, project?: any): Promise<User> {
        //如果是获取当前用户,如果已经获取过了直接返回
        if (this.user && openId === this.openId) {
            return this.user;
        } else {
            let user = await this.get({
                openId: openId || this.openId,
                activityId: this.activityId
            }, {
                project
            })
            if (!user && openId === this.openId) {
                user = new User();
                user.activityId = this.activityId;
                user.createTime = this.time().common.base;
                user.nick = this.nick;
                user.mixNick = this.mixNick;
                user.openId = this.openId;
                await this.insertOne(user.pure);
                user.optionsStart;
            } else {
                user = new User().init(user);
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
    async editUser(options, filter?: User | other): Promise<number> {
        return await super.edit(
            {
                openId: this.openId,
                activityId: this.activityId,
                ...filter
            },
            options
        );
    }


    /**
     * @api {app} updateUser 更新用户信息
     * @apiDescription 更新用户信息
     * @apiParam {string} [avatar] 用户头像
     * @apiSuccessExample
     * {
    "data": {
    },
    "success": true,
    "message": "成功",
    "code": 200
}
     */
    @before(Before.prototype.auth)
    @exp()
    async updateUser() {
        if (this.context.userNick) {
            let {avatar} = this.data;
            this.response.data.line = await this.loosen.editUser(
                {
                    $set: {
                        avatar,
                        nick: this.nick
                    }
                }
            );
        } else {
            this.response.message = "用户没有授权";
            this.response.success = false;
        }
    }

    spmFrom({type, who, what, target = "", desc = ""}) {
        return this.simpleSpm(type)
            .extData({
                desc: MsgGenerate.baseInfo(who, what, target, desc)
            })
    }

    spmNum(user: User | other, origin: string, filed: keyof User | string, filedName: string) {
        let oldValue = user.getValueFromKey("_tempThis." + filed);
        let newValue = user.getValueFromKey(filed);
        let changeNum = formatNum(newValue - oldValue);
        user.tempThisCommit;
        return this.spmFrom({
            type: "_" + filed,
            who: user.nick,
            what: origin,
            target: `${filedName}${changeNum}`,
            desc: `剩余${filedName}${newValue}`,
        }).extData({
            origin,
            changeNum,
        })
    }


    spmLotteryCount(user: User | other, origin: string) {
        return this.spmNum(user, origin, "lotteryCount", "抽奖次数");
    }

    spmGameNum(user: User | other, origin: string) {
        return this.spmNum(user, origin, "gameNum", "游戏次数");
    }

    spmScore(user: User | other, origin: string) {
        return this.spmNum(user, origin, "score", "分数");
    }

    spmLotteryResult(user: User | other, prize: configPrize, extSay?: string) {
        return this.spmFrom({
            type: "_lotteryResult",
            who: user.nick,
            what: "抽奖",
            target: `抽奖结果：${prize.name}${extSay ? "，" + extSay : ""}`,
            desc: `剩余抽奖次数${user.lotteryCount}`,
        });
    }

}
