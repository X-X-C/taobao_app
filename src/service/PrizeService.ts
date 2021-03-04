import BaseService from "../../base/service/abstract/BaseService";
import Prize from "../entity/Prize";
import App from "../../base/App";
import TopService from "../../base/service/TopService";
import Utils from "../../base/utils/Utils";
import UserService from "./UserService";
import MsgGenerate from "../utils/MsgGenerate";

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
    async receive() {
        let {prizeId, ext} = this.data;
        let filter = {
            _id: prizeId,
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
        let baseInfo = this.baseInfo();
        //实物奖品填写信息
        if (prize.type === "item") {
            Object.assign(baseInfo, ext)
            baseInfo.desc = baseInfo.province + baseInfo.city + baseInfo.district + baseInfo.address;
        }
        //更改领奖状态
        let line = await this.edit({
            ...filter,
            receiveStatus: false
        }, {
            $set: {
                receiveTime: this.time().common.base,
                receiveStatus: true,
                info: baseInfo
            }
        })
        //其他类型奖品开始尝试发奖
        let topService = this.getService(TopService);
        let userService = this.getService(UserService);
        let user = await userService.getUser();
        //尖货领取
        if (prize.type === "goods") {
            let {skuId, itemId} = prize[prize.type];
            let data = await topService.opentradeSpecialUsersMark(skuId, itemId);
            await this.simpleSpm("_mark", {
                desc: MsgGenerate.receiveDesc(user.nick, prize.name, data),
                topResult: data
            });
        }
        //积分领取
        else if (prize.type === "point") {
            let {addPointNum} = prize[prize.type];
            let data = await topService.taobaoCrmPointChange(addPointNum);
            await this.simpleSpm("_point", {
                desc: MsgGenerate.receiveDesc(user.nick, prize.name, data),
                topResult: data
            });
        }
        //权益领取
        else if (prize.type === "benefit") {
            let {ename} = prize[prize.type];
            let data = await topService.sendBenefit(ename);
            await this.simpleSpm("_benefit", {
                desc: MsgGenerate.receiveDesc(user.nick, prize.name, data),
                topResult: data
            });
        }
        //其他情况
        else {
            let data = {
                code: line,
                data: `修改了${line}条数据`
            }
            await this.simpleSpm("_receive", {
                desc: MsgGenerate.receiveDesc(user.nick, prize.name, data),
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
