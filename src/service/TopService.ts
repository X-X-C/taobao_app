import Top from "../utils/Top";
import Utils from "../utils/Utils";
import {result} from "../utils/Type";

type orderExt = {
    use_has_next?: boolean,
    buyer_open_id?: string,
    page_no?: number,
    [other: string]: any
}

export default class TopService {
    constructor(public context) {
    }

    //TOP接口工具
    private top = new Top(this.context);


    getResult(): result {
        return {
            code: 0,
            data: {}
        }
    }

    /**
     * 查询当前用户VIP信息
     */
    async vipStatus(): Promise<result> {
        let r = this.getResult();
        r.data = await this.top.vipStatus();
        r.data = r.data.result.member_info;
        r.code = Number(!!r.data);
        return r;
    }

    /**
     * 查找所有订单
     * @param start
     * @param end
     * @param ext
     * @param page
     */
    async selectAllOrder(start: any = false, end: any = false, ext: orderExt = {}, page = 1) {
        let result = await this.selectOrder(start, end, {
            use_has_next: true,
            page_no: page,
            ...ext
        });
        //如果有下一页
        if (result.has_next === true) {
            let rs: any = await this.selectAllOrder(start, end, ext, page + 1);
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
     * @param ext  {
     *     use_has_next: false  --使用has_next判断是否有下一页
     *     buyer_open_id:   --匹配openId用户的订单
     *     page_no:     --页码
     * }
     */
    async selectOrder(startTime: any = false, endTime: any = false, ext: orderExt = {}) {
        let params: any = {
            buyer_open_id: this.context.openId,
            page_no: 1,
            ...ext
        };
        if (startTime) {
            params.start_created = startTime;
        }
        if (endTime) {
            params.end_created = endTime;
        }
        Utils.cleanObj(params);
        return await this.top.selectOrder(params);
    }

    /**
     * 发放奖品
     * @param ename
     */
    async sendBenefit(ename) {
        let r = this.getResult();
        r.data = await this.top.sendBenefit(ename);
        r.code = Number((r.data.result_code === "SEND_SUCCESS") && (r.data.result_success === true));
        return r;
    }
}

