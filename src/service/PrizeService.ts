import BaseService from "./abstract/BaseService";
import PrizeDao from "../dao/PrizeDao";
import Prize from "../entity/Prize";
import SpmService from "./SpmService";
import Time from "../utils/Time";
import {obj} from "../utils/Type";

export default class PrizeService extends BaseService<PrizeDao<Prize>, Prize> {
    constructor(context) {
        super(new PrizeDao(context));
    }

    async my(): Promise<Prize[]> {
        let filter = {
            "user.openId": this.openId,
            "user.activityId": this.activityId
        }
        return await this.getAll(filter);
    }

    /**
     * 领取奖品
     * @param prizeId
     * @param ext
     */
    async receive(prizeId: string, ext: obj): Promise<number> {
        let filter = {
            _id: prizeId,
            "user.openId": this.openId
        }
        let options = {
            $set: {
                receiveTime: new Time(),
                receiveStatus: true,
                ext
            }
        }
        let spmService = new SpmService(this.context);
        await spmService.addSpm("receive");
        return await this.edit(filter, options);
    }
}