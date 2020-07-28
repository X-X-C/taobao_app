import Top from "../utils/Top";

export default class TopService {
    constructor(public context) {
    }

    //TOP接口工具
    private top = new Top(this.context);

    /**
     * 查询当前用户VIP信息
     */
    async vipStatus() {
        let result = await this.top.vipStatus();
        try {
            return result.result.member_info || false;
        } catch (e) {
            return false;
        }
    }

    /**
     * 查询订单信息
     * @param startTime
     * @param endTime
     */
    async selectOrder(startTime = false, endTime = false) {
        let params: any = {};
        if (startTime) {
            params.start_created = startTime;
        }
        if (endTime) {
            params.end_created = endTime;
        }
        return await this.top.selectOrder(params);
    }

    /**
     * 发放奖品
     * @param ename
     */
    async sendBenefit(ename) {
        let result = await this.top.sendBenefit(ename);
        return result.result_code === "SEND_SUCCESS" && result.result_success === true;
    }
}

