import UserService from "./src/service/UserService";
import PrizeService from "./src/service/PrizeService";
import App from "./App";
import Time from "./base/utils/Time";

export async function main(context) {
    const app = new App(context, "main");
    return await app.run(async function () {
    });
}

/**
 * @api {app} enter 获取初始信息
 * @apiDescription 获取初始信息
 * @apiSuccessExample
 */

export async function enter(context) {
    const app = new App(context, "enter");
    app.globalNeedParams = {};
    app.before.globalActivity();
    return await app.run(async function () {
        let userService = app.getService(UserService);
        await userService.enter();
    });
}

/**
 * @api {app} userInfo 获取用户信息
 * @apiDescription 获取用户信息
 * @apiSuccessExample
 * //同enter里的用户信息
 */
export async function userInfo(context) {
    const app = new App(context, "userInfo");
    return await app.run(async function () {
        let userService = app.getService(UserService);
        await userService.userInfo();
    });
}

/**
 * @api {app} updateUser 更新用户信息
 * @apiDescription 更新用户信息
 * @apiParam {string} [avatar] 用户头像
 * @apiSuccessExample
 * {
    "data": {
    },
    "success": true,
    "message": "成功",
    "code": 200
}
 */
export async function updateUser(context) {
    const app = new App(context, "updateUser");
    return await app.run(async function () {
        let userService = app.getService(UserService);
        await userService.updateUser();
    });
}

/**
 * @api {app} task 完成任务
 * @apiDescription 完成任务
 * @apiParam {string} target 任务类型，可选值`follow`关注店铺,`member`加入会员
 * @apiSuccessExample
 * {
    //200-成功
    //201-不在活动时间内
    //222-失败
    "code": 200,
    "data": {
    },
    "success": true,
    "message": "成功"
}
 */
export async function task(context) {
    const app = new App(context, "task");
    app.before.inspectionActivity();
    app.runNeedParams = {
        target: "string"
    }
    return await app.run(async function () {
        let userService = app.getService(UserService);
        await userService.normalTask(this.target);
    });
}

/**
 * @api {app} assist 助力
 * @apiDescription 助力
 * @apiParam {string} sopenId 邀请者openId
 * @apiSuccessExample
 * {
    //200 成功
    //201 不在活动时间内
    //202 邀请人不存在
    //203 已经被其他用户邀请
    //204 不能邀请自己
    //205 不是会员
    //206 不是新会员
    //208 超过邀请限制
    "code": 202,
    "data": {},
    //是否成功邀请
    "success": true,
    "message": "邀请人不存在"
}
 */
export async function assist(context) {
    const app = new App(context, "assist");
    app.before.inspectionActivity();
    app.runNeedParams = {
        sopenId: "string",
    }
    return await app.run(async function () {
        await app.getService(UserService).assist();
    });
}

/**
 * @api {app} lottery 抽奖
 * @apiDescription 抽奖
 * @apiSuccessExample
 * {
    //200-成功
    //201-不在活动时间内
    "code": 200,
    "data": {
        //是否中奖
        "award": true,
        //与我的奖品里的单个奖品格式相同
        "prize": {
        },
        //剩余抽奖次数
        "lotteryCount": 1
    },
    "success": true,
    "message": "成功"
}
 */
export async function lottery(context) {
    const app = new App(context, "lottery");
    app.before.inspectionActivity();
    return await app.run(async function () {
        let userService = app.getService(UserService);
        await userService.lottery();
    });
}

/**
 * @api {app} spmMember 埋点会员
 * @apiDescription 埋点会员
 * @apiParam {string} type 埋点会员类型，可选值`self`自主入会，`assist`助力入会。
 * @apiSuccessExample
 * {
    "data": {
    },
    "success": true,
    "message": "成功",
    "code": 200
}
 */
export async function spmMember(context) {
    const app = new App(context, "spmMember");
    app.runNeedParams = {
        type: "string"
    }
    return await app.run(async function () {
        let userService = app.getService(UserService);
        await userService.spmMember();
    });
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
export async function myPrize(context) {
    const app = new App(context, "myPrize");
    return await app.run(async function () {
        let prizeService = app.getService(PrizeService);
        await prizeService.my();
    });
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
export async function receivePrize(context) {
    const app = new App(context, "receivePrize");
    app.runNeedParams = {
        receiveId: "string"
    }
    return await app.run(async function () {
        let prizeService = app.getService(PrizeService);
        await prizeService.receive();
    });
}

/**
 * @api {app} getTime 获取服务器时间
 * @apiDescription 获取服务器时间
 * @apiSuccessExample
 * {
    "code": 200,
    "data": {
        //时间戳
        "x": 1622170025121,
        //时间
        "base": "2021-05-28 10:47:05"
    },
    "success": true,
    "message": "成功",
    "params": {}
}
 */
export async function getTime(context) {
    const app = new App(context, "getTime");
    app.globalNeedParams = {};
    return await app.run(async function () {
        let time = new Time();
        app.response.data = {
            base: time.common.base,
            x: time.common.x
        }
    });
}

/**
 * @api {app} gameStart 开始游戏
 * @apiDescription 开始游戏
 * @apiSuccessExample
 * {
   	//200-成功
    //201-不在活动时间内
    //222-失败
    "code": 200,
    "data": {
        //剩余游戏次数
        "gameNum": 0
    },
    "success": true,
    "message": "成功"
}
 */
export async function gameStart(context) {
    const app = new App(context, "gameStart");
    app.before.inspectionActivity();
    return await app.run(async function () {
        await app.getService(UserService).gameStart();
    });
}

/**
 * @api {app} gameEnd 结束游戏
 * @apiDescription 结束游戏
 * @apiParam {number} add 新增分数
 * @apiSuccessExample
 * {
    //200-成功
    //201-不在活动时间内
    //222-失败
    "code": 200,
    "data": {
        //剩余分数
        "score": 10000
    },
    "success": true,
    "message": "成功"
}
 */
export async function gameEnd(context) {
    const app = new App(context, "gameEnd");
    app.before.inspectionActivity();
    app.runNeedParams = {
        add: "number"
    }
    return await app.run(async function () {
        await app.getService(UserService).gameEnd();
    });
}

/**
 * @api {app} rank 排行榜
 * @apiDescription 排行榜
 * @apiParam {number} [page] 页数
 * @apiParam {number} [size] 每页显示条数
 * @apiSuccessExample
 *{
    "code": 200,
    "data": {
        "list": [
            {
                "nick": "牧**",
                //分数
                "score": 10000,
                "activityId": "608775329897b453554c72fe",
                "openId": "AAHvNcpFANgOFJhVCORYvt7O",
                //排名
                "rank": 1,
                //头像
                "avatar": false
            }
        ]
    },
    "success": true,
    "message": "成功"
}
 */
export async function rank(context) {
    const app = new App(context, "rank");
    return await app.run(async function () {
        app.response.data.list = await app.getService(UserService).rank();
    });
}

/**
 * @api {app} meRank 我的排名
 * @apiDescription 我的排名
 * @apiSuccessExample
 * {
    "code": 200,
    "data": {
        "nick": "牧**",
        "activityId": "608775329897b453554c72fe",
        "score": 10000,
        "openId": "AAHvNcpFANgOFJhVCORYvt7O",
        "rank": 1,
        "avatar": false
    },
    "success": true,
    "message": "成功"
}
 */
export async function meRank(context) {
    const app = new App(context, "meRank");
    return await app.run(async function () {
        await app.getService(UserService).meRank();
    });
}
