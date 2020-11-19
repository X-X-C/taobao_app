import BaseService from "../../base/service/abstract/BaseService";
import PrizeDao from "../dao/PrizeDao";
import Prize from "../entity/Prize";
import App from "../../base/App";
import {result} from "../../base/utils/Type";
import TopService from "../../base/service/TopService";
import Utils from "../../base/utils/Utils";
import UserService from "./UserService";
import MsgGenerate from "../Utils/MsgGenerate";

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

    async my(): Promise<Prize[]> {
        let filter = {
            openId: this.openId,
            activityId: this.activityId
        }
        return await this.getAll(filter);
    }

    /**
     * 领取奖品
     */
    async receive(): Promise<result> {
        let {prizeId, ext} = this.data;
        let r = this.result;
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
            r.code = await this.edit(filter, options);
            //成功领取
            if (r.code >= 1) {
                let topService = this.getService(TopService);
                let userService = this.getService(UserService);
                let user = await userService.getUser();
                let time = this.time().common.base;
                //尖货领取
                if (prize.type === "goods") {
                    let {skuId, itemId} = prize[prize.type];
                    r.data = await topService.opentradeSpecialUsersMark(skuId, itemId);
                    this.simpleSpm("_mark", {
                        desc: MsgGenerate.receiveDesc(user, time, prize, r.data),
                        topResult: r.data.data
                    });
                }
                //积分领取
                else if (prize.type === "point") {
                    let {addPointNum} = prize[prize.type];
                    r.data = await topService.taobaoCrmPointChange(addPointNum);
                    this.simpleSpm("_point", {
                        desc: MsgGenerate.receiveDesc(user, time, prize, r.data),
                        topResult: r.data.data
                    });
                }
                //权益领取
                else if (prize.type === "benefit") {
                    let {ename} = prize[prize.type];
                    r.data = await topService.sendBenefit(ename);
                    this.simpleSpm("_benefit", {
                        desc: MsgGenerate.receiveDesc(user, time, prize, r.data),
                        topResult: r.data.data
                    });
                }
                //其他情况
                else {
                    let data = {
                        code: r.code,
                        data: `修改了${r.code}条数据`
                    }
                    this.simpleSpm("_receive", {
                        desc: MsgGenerate.receiveDesc(user, time, prize, data)
                    })
                }
            }
        }
        return r;
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