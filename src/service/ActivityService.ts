/**
 * @param code
 * -1-->没有此活动
 * 0-->活动未开始
 * 1-->活动进行中
 * 2-->活动已结束
 * @param data 活动数据
 */
import App from "../../base/App";
import UserService from "./UserService";
import Prize from "../entity/Prize";
import PrizeService from "./PrizeService";
import BaseActivityService from "../../base/service/BaseActivityService";

export default class ActivityService extends BaseActivityService {
    constructor(app: App) {
        super(app);
    }

    async award() {
        let code = -1;
        let activity = await this.getActivity();
        //如果活动结束，且还没有开过奖进入开奖逻辑
        if (activity.code === 2 && activity.data.data.award !== true) {
            //更改活动开奖状态
            let filter = {
                _id: this.activityId,
                "data.award": {
                    $ne: true
                }
            }
            let options = {
                "data.award": true
            }
            code = await this.edit(filter, options);
            //成功更改开奖状态
            if (code === 1) {
                let userService = this.getService(UserService);
                let rankPrizeList = activity.data.config.rankPrizeList;
                rankPrizeList = rankPrizeList.sort((a, b) => {
                    return parseInt(a.condition.endNum) - parseInt(b.condition.endNum);
                });
                //需要开奖的数据
                let rankList = await userService.rank(rankPrizeList[0].condition.endNum, 1);
                //需要开奖的奖品
                let winners = [];
                for (let user of rankList) {
                    let prize = rankPrizeList.find(p => {
                        let {startNum, endNum} = p.condition;
                        if (user.rank >= startNum && user.rank <= endNum) {
                            return true;
                        }
                    });
                    //如果当前用户存在奖品
                    if (prize) {
                        let sendPrize = new Prize(user, prize, "rank");
                        sendPrize.ext.rank = user.rank;
                        winners.push(sendPrize);
                    }
                }
                let prizeService = this.getService(PrizeService);
                //开奖
                await prizeService.insertMany(winners);
            }
        }
    }
}
