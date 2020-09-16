import Utils from "./Utils";
import {obj} from "./Type";

export default class Top {
    constructor(public context) {
    }

    /**
     * 调用top接口
     * @param api
     * @param data  参数
     * @param ext   额外参数
     */
    async invoke(api: string, data, ext: obj = {}) {
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
    async selectOrder(data: obj, ext: obj = {}) {
        let params = {
            fields: "tid,type,status,payment,orders,rx_audit_status",
            page_size: 100,
            ...data
        }
        return await this.invoke("taobao.open.trades.sold.get", params, {});
    }

    /**
     * 查询当前用户vip信息
     * @return 参考：https://open.taobao.com/api.htm?docId=34436&docType=2&scopeId=13840
     */
    async vipStatus(data: obj = {}, ext: obj = {}) {
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
    async sendBenefit(ename, ext: obj = {}) {
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
    async opentradeSpecialUsersMark(sku_id, item_id, ext: obj = {}) {
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
}