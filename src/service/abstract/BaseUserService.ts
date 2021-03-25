import BaseService from "../../../base/service/abstract/BaseService";
import User from "../../entity/User";
import App from "../../../base/App";
import MsgGenerate, {formatNum} from "../../utils/MsgGenerate";

export default abstract class BaseUserService extends BaseService<User> {
    protected constructor(app: App) {
        super(app, "users");
    }

    protected user: User;

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
                user.activityId = this.activityId || this.globalActivity.data._id;
                user.createTime = this.time().common.base;
                user.nick = this.nick;
                user.mixNick = this.mixNick;
                user.openId = this.openId;
                await this.insertOne(user.pure);
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
     * @param ignore
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
     * 更新用户头像
     */
    async updateUser() {
        this.response.data = await this.loosen.editUser(
            {
                $set: {
                    avatar: this.data.avatar,
                    nick: this.nick
                }
            },
            {
                avatar: false
            }
        );
    }

    async spmFrom(type, who, what, target?, desc?, ext?) {
        await this.simpleSpm(type, {
            desc: MsgGenerate.baseInfo(who, what, target, desc)
        }, ext);
    }

    async spmNum(user: User | other, origin: string, filed: keyof User | string, filedName: string, ext?) {
        let changeNum = formatNum(user[filed] - user._[filed]);
        await this.spmFrom("_" + filed, user.nick, origin, `${filedName}${changeNum}`, `剩余${filedName}${user[filed]}`, ext);
    }


    async spmLotteryCount(user: User | other, origin: string, ext?) {
        await this.spmNum(user, origin, "lotteryCount", "抽奖次数", ext);
    }

    async spmGameNum(user: User | other, origin: string, ext?) {
        await this.spmNum(user, origin, "gameNum", "游戏次数", ext);
    }

    async spmScore(user: User | other, origin: string, ext?) {
        await this.spmNum(user, origin, "score", "分数", ext);
    }

    async spmLotteryResult(user: User | other, prize: configPrize, extSay?: string, ext?) {
        await this.spmFrom("_lotteryResult", user.nick, "抽奖", `抽奖结果：${prize.name}${extSay ? "," + extSay : ""}`, `剩余抽奖次数${user.lotteryCount}`, ext);
    }

}
