import Utils from "./Utils";

export default class Top {
    constructor(public context) {
    }

    /**
     * 调用top接口
     * @param api
     * @param data  参数
     * @param ext   额外参数
     */
    async invoke(api: string, data, ext: any = {}) {
        return await this.context.cloud.topApi.invoke({
            api,
            data,
            autoSession: true,
            ...ext
        });
    }


    /**
     * 查询订单
     * @param data {
     *     start_created:查询三个月内交易创建时间开始。格式:yyyy-MM-dd HH:mm:ss
     *     end_created:查询交易创建时间结束。格式:yyyy-MM-dd HH:mm:ss
     * }
     * @param ext
     * @return 参考：https://open.taobao.com/api.htm?docId=45011&docType=2&scopeId=16730
     */
    async selectOrder(data: any, ext: any = {}) {
        let params = {
            fields: "tid,type,status,payment,orders,rx_audit_status",
            page_size: 100,
            ...data
        }
        return await this.invoke("taobao.open.trades.sold.get", params, ext);
    }

    /**
     * 查询当前用户vip信息
     * @return 参考：https://open.taobao.com/api.htm?docId=34436&docType=2&scopeId=13840
     */
    async vipStatus(data: any = {}, ext: any = {}) {
        let params = {
            extra_info: '{"source":"paiyangji","deviceId":"testId","itemId":565058963761}', //固定写法
            mix_nick: this.context.mixNick,
            ...data
        }
        return await this.invoke("taobao.crm.member.identity.get", params, ext);
    }

    /**
     * 发放权益
     * @param ename
     * @param ext
     * @return 参考：https://open.taobao.com/api.htm?docId=45573&docType=2&scopeId=16997
     */
    async sendBenefit(ename, ext: any = {}) {
        let params = {
            right_ename: ename,
            receiver_id: this.context.openId,//用户openid
            user_type: "taobao",//固定参数
            unique_id: Utils.getUniqueStr(20),
            app_name: "mtop"
        }
        return await this.invoke("alibaba.benefit.send", params, ext);
    }

    /**
     * 打标
     * @param sku_id
     * @param item_id
     * @param ext
     * @return 参考：https://open.taobao.com/api.htm?spm=a219a.7386797.0.0.6344669azYA9UM&source=search&docId=51296&docType=2
     */
    async opentradeSpecialUsersMark(sku_id, item_id, ext: any = {}) {
        return await this.invoke(
            "taobao.opentrade.special.users.mark",
            {
                status: "MARK",
                sku_id: String(sku_id),
                item_id: String(item_id),
                open_user_ids: this.context.openId,
                hit: "true",
            },
            ext
        );
    }


    /**
     * 打标商品绑定到小程序
     * @param miniapp_id    小程序C端ID
     * @param item_ids  商品ID 字符串，用，分开
     * @param ext
     * @return 参考：https://open.taobao.com/api.htm?spm=a219a.7386797.0.0.7f2c669ahs9Hif&source=search&docId=51714&docType=2
     */
    async taobaoOpentradeSpecialItemsBind(miniapp_id, item_ids, ext: any = {}) {
        return await this.invoke(
            "taobao.opentrade.special.items.bind",
            {
                miniapp_id,
                item_ids
            },
            ext
        );
    }

    /**
     * 查询当前小程序绑定打标的商品
     * @param miniapp_id    小程序C端ID
     * @param ext
     * @return 参考：https://open.taobao.com/api.htm?docId=51716&docType=2&source=search
     */
    async taobaoOpentradeSpecialItemsQuery(miniapp_id, ext: any = {}) {
        return await this.invoke(
            "taobao.opentrade.special.items.query",
            {
                miniapp_id
            },
            ext
        );
    }


    /**
     * 获取商品信息
     * @param num_iid  商品ID
     * @param ext
     * @return 参考：https://open.taobao.com/api.htm?spm=a219a.7386797.0.0.1b14669agpX3MB&source=search&docId=24625&docType=2
     */
    async taobaoItemSellerGet(num_iid, ext: any = {}) {
        return await this.invoke(
            "taobao.item.seller.get",
            {
                fields: "num_iid,title,nick,price,approve_status,sku",
                num_iid
            },
            ext
        );
    }
}