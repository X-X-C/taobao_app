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
     * 查找所有订单
     * @param start
     * @param end
     * @param page
     */
    async selectAllOrder(start, end, page = 1) {
        let result = await this.selectOrder(start, end, page);
        //如果有下一页
        if (result.total_results > 0 && result.has_next === true) {
            let rs: any = await this.selectAllOrder(start, end, page + 1);
            result.trades.trade = result.trades.trade.concat(rs.trades.trade);
            return result;
        } else {
            return result;
        }
    }

    /**
     * 查询一页订单信息
     * @param startTime
     * @param endTime
     * @param page  多少页 默认查询第一页
     */
    async selectOrder(startTime = false, endTime = false, page = 1) {
        let params: any = {};
        if (startTime) {
            params.start_created = startTime;
        }
        if (endTime) {
            params.end_created = endTime;
        }
        params.page_no = page;
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

