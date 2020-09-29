import Top from "../utils/Top";
import Utils from "../utils/Utils";
import {result} from "../utils/Type";
import ServiceManager from "./abstract/ServiceManager";
import App from "../App";

type orderExt = {
    use_has_next?: boolean,
    buyer_open_id?: string,
    page_no?: number,
    [other: string]: any
}

export default class TopService {
    constructor(public context) {
        if (App.services instanceof ServiceManager) {
            return App.services.register(this);
        }
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
    async sendBenefit(ename): Promise<result> {
        let r = this.getResult();
        r.data = await this.top.sendBenefit(ename);
        r.code = Number(r.data.result_success === true);
        return r;
    }


    /**
     * 为当前用户标记指定商品
     * @param sku_id
     * @param item_id
     * @param ext
     */
    async opentradeSpecialUsersMark(sku_id, item_id, ext: any = {}): Promise<result> {
        let r = this.getResult();
        r.data = await this.top.opentradeSpecialUsersMark(sku_id, item_id, ext)
        r.code = Number(r.data.result && (r.data.code !== 50));
        return r;
    }

    /**
     * 绑定打标商品到小程序
     * @param miniapp_id
     * @param item_ids
     * @param ext
     */
    async taobaoOpentradeSpecialItemsBind(miniapp_id, item_ids, ext: any = {}): Promise<result> {
        let r = this.getResult();
        r.data = await this.top.taobaoOpentradeSpecialItemsBind(miniapp_id, item_ids, ext)
        r.code = Number(r.data.results && (r.data.results.bind_ok === true));
        return r;
    }

    /**
     * 查询已经绑定的打标商品
     * @param miniapp_id
     * @param ext
     */
    async taobaoOpentradeSpecialItemsQuery(miniapp_id, ext: any = {}): Promise<result> {
        let r = this.getResult();
        r.data = await this.top.taobaoOpentradeSpecialItemsQuery(miniapp_id, ext)
        r.code = Number(r.data.items && r.data.items.number);
        return r;
    }

    /**
     * 获取商品信息
     * @param num_iid
     * @param ext
     */
    async taobaoItemSellerGet(num_iid, ext: any = {}): Promise<result> {
        let r = this.getResult();
        r.data = await this.top.taobaoItemSellerGet(num_iid, ext);
        r.code = Number(r.data.item && true);
        return r;
    }

}

