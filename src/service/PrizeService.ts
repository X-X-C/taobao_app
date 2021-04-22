import BaseService from "../../base/service/abstract/BaseService";
import Prize from "../entity/Prize";
import App from "../../base/App";
import TopService from "../../base/service/TopService";
import Utils from "../../base/utils/Utils";
import UserService from "./UserService";
import MsgGenerate from "../utils/MsgGenerate";
import XErrorLogService from "../../base/service/XErrorLogService";

export default class PrizeService extends BaseService<Prize> {
    constructor(app: App) {
        super(app, "prizes");
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
        let {prizeId} = this.data;
        let filter = {
            _id: id || prizeId,
            openId: this.openId,
            activityId: this.activityId
        }
        let prizeData = new Prize().init(await this.get(filter));
        if (!prizeData._id) {
            this.response.set222("您未获得该奖品，领取失败");
            return;
        }
        if (prizeData.receiveStatus !== false) {
            this.response.set222("您已领取过该奖品，领取失败");
            return;
        }
        prizeData.receiveStatus = true;
        prizeData.receiveTime = this.time().common.base;
        //更改领奖状态
        await this.edit({
            ...filter,
            receiveStatus: false
        }, prizeData.optionsEnd)
        //其他类型奖品开始尝试发奖
        let userService = this.getService(UserService);
        try {
            let user = await userService.getUser();
            await this.sendPrize(user, prizeData);
            //领取成功
            await this.loosen.edit({
                ...filter
            }, prizeData.optionsEnd)
        }
            //报错了...回滚状态
        catch (e) {
            await this.edit(filter, prizeData.optionsBack)
            await this.getService(XErrorLogService).add(e);
        }
    }

    async sendPrize(user, prizeBean: Prize, prize: configPrize = prizeBean.prize) {
        let topService = this.getService(TopService);
        let result = <result>{
            code: 1,
            data: "成功"
        };

        try {
//尖货领取
            if (prize.type === "goods") {
                let {skuId, itemId} = prize[prize.type];
                result = await topService.opentradeSpecialUsersMark({
                    skuId,
                    itemId
                });
            }
            //积分领取
            else if (prize.type === "point") {
                let {addPointNum} = prize[prize.type];
                result = await topService.taobaoCrmPointChange({
                    num: addPointNum
                });
            }
            //权益领取
            else if (prize.type === "benefit") {
                let {ename} = prize[prize.type];
                result = await topService.sendBenefit({
                    ename
                });
            }
            //实物奖品
            else if (prize.type === "item") {
                let {ext} = this.data;
                let baseInfo = this.baseInfo();
                Object.assign(baseInfo, ext)
                baseInfo.desc = baseInfo.province + baseInfo.city + baseInfo.district + baseInfo.address;
                prizeBean.info = baseInfo;
            }
        } catch (e) {
            result = {
                code: -1,
                data: e
            }
        } finally {
            await this.simpleSpm("_receivePrize", {
                desc: MsgGenerate.receiveDesc(user.nick, prize.name, result),
                topResult: result,
                prizeType: prize.type
            });
        }
        if (result.code === 1) {
            prizeBean.sendSuccess = true;
        }
        if (result.code === -1) {
            throw result.data;
        }
        return result;
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

    async allPrizeInfo(filter: Prize | other) {
        return await this.getAll({
            openId: this.openId,
            activityId: this.activityId,
            ...filter
        }, {
            project: {
                _id: 0,
                prizeId: 1,
                prizeType: "$prize.type"
            }
        });
    }
}
