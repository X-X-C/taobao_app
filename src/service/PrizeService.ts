import BaseService from "../../base/service/abstract/BaseService";
import PrizeDao from "../dao/PrizeDao";
import Prize from "../entity/Prize";
import App from "../../base/App";
import TopService from "../../base/service/TopService";
import Utils from "../../base/utils/Utils";
import UserService from "./UserService";
import MsgGenerate from "../utils/MsgGenerate";
import BaseResult from "../../base/dto/BaseResult";

export default class PrizeService extends BaseService<PrizeDao<Prize>, Prize> {
    constructor(app: App) {
        super(PrizeDao, app);
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
        let prize: any = await this.get(filter);
        if (prize && prize.receiveStatus === false) {
            prize = prize.prize;
            let baseInfo = this.baseInfo();
            //实物奖品填写信息
            if (prize.type === "item") {
                Object.assign(baseInfo, ext)
                baseInfo.desc = baseInfo.province + baseInfo.city + baseInfo.district + baseInfo.address;
            }
            let options = {
                $set: {
                    receiveTime: this.time().common,
                    receiveStatus: true,
                    ext: baseInfo
                }
            }
            this.response.code = await this.edit(filter, options);
            //成功领取
            if (this.response.code >= 1) {
                let topService = this.getService(TopService);
                let userService = this.getService(UserService);
                let user = await userService.getUser();
                //尖货领取
                if (prize.type === "goods") {
                    let {skuId, itemId} = prize[prize.type];
                    this.response.data = await topService.opentradeSpecialUsersMark(skuId, itemId);
                    await this.simpleSpm("_mark", {
                        desc: MsgGenerate.receiveDesc(user.nick, prize.name, this.response.data),
                        topResult: this.response.data.data
                    });
                }
                //积分领取
                else if (prize.type === "point") {
                    let {addPointNum} = prize[prize.type];
                    this.response.data = await topService.taobaoCrmPointChange(addPointNum);
                    await this.simpleSpm("_point", {
                        desc: MsgGenerate.receiveDesc(user.nick, prize.name, this.response.data),
                        topResult: this.response.data.data
                    });
                }
                //权益领取
                else if (prize.type === "benefit") {
                    let {ename} = prize[prize.type];
                    this.response.data = await topService.sendBenefit(ename);
                    await this.simpleSpm("_benefit", {
                        desc: MsgGenerate.receiveDesc(user.nick, prize.name, this.response.data),
                        topResult: this.response.data.data
                    });
                }
                //其他情况
                else {
                    let data = {
                        code: this.response.code,
                        data: `修改了${this.response.code}条数据`
                    }
                    await this.simpleSpm("_receive", {
                        desc: MsgGenerate.receiveDesc(user.nick, prize.name, data),
                    })
                }
            }
        } else {
            this.response.set222("领取失败");
        }
    }

    /**
     * 生成暗号
     */
    async generateCode(length = 10) {
        while (true) {
            let code = Utils.getUniqueStr(length);
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
