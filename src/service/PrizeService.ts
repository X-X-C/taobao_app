import BaseService from "../../base/service/abstract/BaseService";
import Prize from "../entity/Prize";
import App from "../../base/App";
import TopService from "../../base/service/TopService";
import Utils from "../../base/utils/Utils";
import UserService from "./UserService";
import MsgGenerate from "../utils/MsgGenerate";
import XErrorLogService from "../../base/service/XErrorLogService";
import {exp} from "../../base/utils/Annotation";

export default class PrizeService extends BaseService<Prize> {
    constructor(app: App) {
        super(app, "prizes");
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

    /**
     * @api {app} myPrize 我的奖品
     * @apiDescription 我的奖品
     * @apiParam {string} [type] 奖品类型，可选值`lottery`,如果不传则默认查询全部奖品
     * @apiSuccessExample
     * {
    "code": 200,
    "data": {
        "list": [
            {   //领取状态
                "receiveStatus": false,
                //奖品类型
                "type": "lottery",
                //奖品详情
                "prize": {
                    "item": {
                        "imageUrl": "",
                        "url": ""
                    },
                    "grantTotal": 0,
                    "code": {
                        "imageUrl": ""
                    },
                    "coupon": {
                        "imageUrl": "",
                        "links": {
                            "url": ""
                        }
                    },
                    "probability": "100",
                    "noprize": {
                        "imageUrl": ""
                    },
                    "goods": {
                        "itemId": "",
                        "imageUrl": "",
                        "skuId": "0"
                    },
                    "type": "coupon",
                    "benefit": {
                        "orderUrl": "",
                        "ename": "",
                        "amount": "0",
                        "benefit_name": "",
                        "prize_id": "",
                        "imageUrl": "",
                        "prize_quantity": ""
                    },
                    "point": {
                        "addPointNum": 0,
                        "imageUrl": "",
                        "url": ""
                    },
                    "name": "抽奖奖品1",
                    "realCanReceiveNum": 0,
                    "id": "280dd553-8a5b-4cdf-8c94-8e1111d69b0a_lottery_1",
                    "stock": 99
                },
                "prizeName": "抽奖奖品1",
                //*****用于领奖的prizeId*****
                "_id": "5fe42b9b67f137b8f8523f89"
            }
        ]
    },
    "success": true,
    "message": "成功"
}
     */
    @exp()
    async myPrize() {
        let filter = {
            openId: this.openId,
            activityId: this.activityId,
            isShow: true,
            type: this.data.type
        }
        let list = await this.getAll(filter);
        this.response.data = {list};
    }
    /**
     * @api {app} receivePrize 领取奖品
     * @apiDescription 领取奖品
     * @apiParam {string} receiveId 领奖ID，奖品里的**_id**
     * @apiParam {object} [ext] 领奖填写的额外信息，示例如下
     * @apiParamExample ext
     * {
    //省
    "province": "",
    //市
    "city": "",
    //区
    "district": "",
    //姓名
    "name": "",
    //电话
    "tel": "",
    //地址
    "address": ""
}
     * @apiSuccessExample
     * {
    //200-成功
    //222-失败
    "code": 200,
    "data": {},
    "success": true,
    "message": "成功"
}
     */
    @exp({receiveId: "string"})
    async receivePrize(id?) {
        let {receiveId} = this.data;
        let filter = {
            _id: id || receiveId,
            openId: this.openId,
            activityId: this.activityId
        }
        let prizeData = new Prize().init(await this.get(filter));
        if (!prizeData._id) {
            this.response.set222("您未获得该奖品，领取失败");
            return;
        }
        if (prizeData.receiveStatus !== false) {
            this.response.set222("您已领取过该奖品，领取失败");
            return;
        }
        prizeData.receiveStatus = true;
        prizeData.receiveTime = this.time().common.base;
        //更改领奖状态
        await this.edit({
            ...filter,
            receiveStatus: false
        }, prizeData.optionsEnd)
        //其他类型奖品开始尝试发奖
        let userService = this.getService(UserService);
        let user = await userService.getUser();
        await this.sendPrize(user, prizeData);
        if (prizeData.sendSuccess !== true) {
            await this.edit(filter, prizeData.optionsBack)
            this.response.set222("发放失败");
        } else {
            //领取成功
            await this.loosen.edit({
                ...filter
            }, prizeData.optionsEnd)
        }
    }

    async sendPrize(user, prizeBean: Prize, prize: configPrize = prizeBean.prize) {
        let topService = this.getService(TopService);
        let result = <result>{
            code: 1,
            data: "成功"
        };
        try {
            //尖货领取
            if (prize.type === "goods") {
                let {skuId, itemId} = prize[prize.type];
                result = await topService.opentradeSpecialUsersMark({
                    skuId,
                    itemId
                });
            }
            //积分领取
            else if (prize.type === "point") {
                let {addPointNum} = prize[prize.type];
                result = await topService.taobaoCrmPointChange({
                    num: addPointNum
                });
            }
            //权益领取
            else if (prize.type === "benefit") {
                let {ename} = prize[prize.type];
                result = await topService.sendBenefit({
                    ename
                });
            }
            //其他奖品
            else {
                let {ext} = this.data;
                let baseInfo = this.baseInfo();
                Object.assign(baseInfo, ext)
                baseInfo.desc = baseInfo.province + baseInfo.city + baseInfo.district + baseInfo.address;
                prizeBean.info = baseInfo;
            }
        } catch (e) {
            result = {
                code: -1,
                data: e
            }
        } finally {
            await this.simpleSpm("_receivePrize", {
                desc: MsgGenerate.receiveDesc(user.nick, prize.name, result),
                topResult: result,
                prizeType: prize.type
            });
        }
        if (result.code === 1) {
            prizeBean.sendSuccess = true;
        } else {
            await this.getService(XErrorLogService).add(result.data);
        }
        return result;
    }

    /**
     * 生成暗号
     */
    async generateCode(repeat = 10, type = "") {
        while (true) {
            let code = Utils.randomStr({repeat, type});
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

    async allPrizeInfo(filter: Prize | other = {}): Promise<{ prizeId: string, prizeType: string }[]> {
        return <any>await this.getAll({
            openId: this.openId,
            activityId: this.activityId,
            ...filter
        }, {
            project: {
                _id: 0,
                prizeId: 1,
                prizeType: "$prize.type"
            }
        });
    }
}
