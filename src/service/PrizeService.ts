import BaseService from "./abstract/BaseService";
import PrizeDao from "../dao/PrizeDao";
import Prize from "../entity/Prize";
import App from "../App";
import {result} from "../utils/Type";
import TopService from "./TopService";
import Utils from "../utils/Utils";

export default class PrizeService extends BaseService<PrizeDao<Prize>, Prize> {
    constructor(app: App) {
        super(PrizeDao, app);
        return this.register(this);
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
                //尖货领取
                if (prize.type === "goods") {
                    let {skuId, itemId} = prize[prize.type];
                    r.data = await topService.opentradeSpecialUsersMark(skuId, itemId);
                    this.spm("mark");
                }
                //积分领取
                else if (prize.type === "point") {
                    let {addPointNum} = prize[prize.type];
                    r.data = await topService.taobaoCrmPointChange(addPointNum);
                    this.spm("point");
                }
                //权益领取
                else if (prize.type === "benefit") {
                    let {ename} = prize[prize.type];
                    r.data = await topService.sendBenefit(ename);
                    this.spm("benefit");
                }
            }
        }
        return r;
    }

    /**
     * 生成暗号
     */
    async generateCode() {
        while (true) {
            let code = Utils.getUniqueStr(20);
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