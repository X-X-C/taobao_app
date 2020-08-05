import BaseService from "./abstract/BaseService";
import PrizeDao from "../dao/PrizeDao";
import Prize from "../entity/Prize";
import SpmService from "./SpmService";
import Time from "../utils/Time";

export default class PrizeService extends BaseService<PrizeDao, Prize> {
    constructor(context) {
        super(new PrizeDao(context));
    }

    async my() {
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
    async receive(prizeId, ext) {
        let filter = {
            _id: prizeId
        }
        let options = {
            $set: {
                receiveTime: new Time(),
                receiveStatus: true,
                ext
            }
        }
        let spmService = new SpmService(this.context);
        await spmService.add("receive");
        return await this.edit(filter, options);
    }
}