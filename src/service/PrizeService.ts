import BaseService from "../../base/service/abstract/BaseService";
import Prize from "../entity/Prize";
import App from "../../base/App";
import TopService from "../../base/service/TopService";
import Utils from "../../base/utils/Utils";
import UserService from "./UserService";
import MsgGenerate from "../utils/MsgGenerate";
import ErrorLogService from "../../base/service/ErrorLogService";

export default class PrizeService extends BaseService<Prize> {
    constructor(app: App) {
        super("prizes", app);
    }

    baseInfo() {
        return {
            province: "",
            city: "",
            district: "",
            name: "",
            tel: "",
            address: "",
            desc: ""
        }
    }

    async my() {
        let filter = {
            openId: this.openId,
            activityId: this.activityId,
            isShow: true
        }
        let list = await this.getAll(filter);
        this.response.data = {list};
    }

    /**
     * 领取奖品
     */
    async receive(id?) {
        let {prizeId, ext} = this.data;
        let filter = {
            _id: id || prizeId,
            openId: this.openId,
            activityId: this.activityId
        }
        let prizeData = await this.get(filter);
        if (!prizeData) {
            this.response.set222("您未获得该奖品，领取失败");
            return;
        }
        if (prizeData.receiveStatus !== false) {
            this.response.set222("您已领取过该奖品，领取失败");
            return;
        }
        let prize = prizeData.prize;
        //更改领奖状态
        let line = await this.edit({
            ...filter,
            receiveStatus: false
        }, {
            $set: {
                receiveStatus: true,
            }
        })
        //其他类型奖品开始尝试发奖
        let topService = this.getService(TopService);
        let userService = this.getService(UserService);
        let user = await userService.getUser();
        let result;
        let baseInfo = this.baseInfo();
        try {
            //实物奖品填写信息
            if (prize.type === "item") {
                Object.assign(baseInfo, ext)
                baseInfo.desc = baseInfo.province + baseInfo.city + baseInfo.district + baseInfo.address;
            }
            //尖货领取
            if (prize.type === "goods") {
                let {skuId, itemId} = prize[prize.type];
                result = await topService.opentradeSpecialUsersMark(skuId, itemId);
                await this.simpleSpm("_mark", {
                    desc: MsgGenerate.receiveDesc(user.nick, prize.name, result),
                    topResult: result
                });
            }
            //积分领取
            else if (prize.type === "point") {
                let {addPointNum} = prize[prize.type];
                result = await topService.taobaoCrmPointChange(addPointNum);
                await this.simpleSpm("_point", {
                    desc: MsgGenerate.receiveDesc(user.nick, prize.name, result),
                    topResult: result
                });
            }
            //权益领取
            else if (prize.type === "benefit") {
                let {ename} = prize[prize.type];
                result = await topService.sendBenefit(ename);
                await this.simpleSpm("_benefit", {
                    desc: MsgGenerate.receiveDesc(user.nick, prize.name, result),
                    topResult: result
                });
            }
            //其他情况
            else {
                result = {
                    code: line,
                    data: `修改了${line}条数据`
                }
                await this.simpleSpm("_receive", {
                    desc: MsgGenerate.receiveDesc(user.nick, prize.name, result),
                })
            }
        } catch (e) {
            await this.getService(ErrorLogService).add(e);
        }
        //领取成功
        if (result?.code >= 1) {
            await this.edit({
                ...filter,
                receiveStatus: true
            }, {
                $set: {
                    receiveTime: this.time().common.base,
                    info: baseInfo
                }
            })
        }
        //BACK
        else {
            await this.edit({
                ...filter,
                receiveStatus: true
            }, {
                $set: {
                    receiveStatus: false
                }
            })
        }
    }

    /**
     * 生成暗号
     */
    async generateCode(repeat = 10, type = "") {
        while (true) {
            let code = Utils.randomStr({repeat, type});
            //查询是否已有暗号
            let count = await this.count({
                activityId: this.activityId,
                code: code
            })
            //如果此暗号还没有被使用
            if (count <= 0) {
                return code;
            }
        }
    }
}
