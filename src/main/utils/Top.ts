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
    async invoke(api: string, data, ext = {}) {
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
     * @return 参考：https://open.taobao.com/api.htm?docId=45011&docType=2&scopeId=16730
     */
    async selectOrder(data) {
        let params = {
            fields: "tid,type,status,payment,orders,rx_audit_status",
            buyer_open_id: this.context.openId,
            ...data
        }
        return await this.invoke("taobao.open.trades.sold.get", params);
    }

    /**
     * 查询当前用户vip信息
     * @return 参考：https://open.taobao.com/api.htm?docId=34436&docType=2&scopeId=13840
     */
    async vipStatus() {
        let params = {
            extra_info: '{"source":"paiyangji","deviceId":"testId","itemId":565058963761}', //固定写法
            mix_nick: this.context.mixNick,
        }
        return await this.invoke("taobao.crm.member.identity.get", params);
    }

    /**
     * 发放权益
     * @param ename
     * @return 参考：https://open.taobao.com/api.htm?docId=45573&docType=2&scopeId=16997
     */
    async sendBenefit(ename) {
        let params = {
            right_ename: ename,
            receiver_id: this.context.openId,//用户openid
            user_type: "taobao",//固定参数
            unique_id: Utils.getUniqueStr(20),
            app_name: "mtop"
        }
        return await this.invoke("alibaba.benefit.send", params);
    }
}