import UserService from "./UserService";
import Prize from "../entity/Prize";
import PrizeService from "./PrizeService";
import XActivityService from "../../base/service/XActivityService";
import ActivityInfoService from "../../base/service/ActivityInfoService";

export default class ActivityService extends XActivityService {

    async award() {
        let activity = this.globalActivity;
        //如果活动结束，且还没有开过奖进入开奖逻辑
        if (activity.code === 2 && activity.data.data.award !== true) {
            let line = await this.getService(ActivityInfoService).loosen.award();
            if (line !== 1) {
                //失败
                await this.simpleSpm("failAward", {
                    line
                });
                return;
            }
            let userService = this.getService(UserService);
            let rankPrizeList = activity.data.config.rankPrizeList;
            if (rankPrizeList.length === 0) {
                return;
            }
            rankPrizeList = rankPrizeList.sort((a, b) => {
                return parseInt(b.condition.endNum) - parseInt(a.condition.endNum);
            });
            let rankList = await userService.rank(rankPrizeList[0].condition.endNum, 1);
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
            await prizeService.insertMany(winners);
        }
    }
}
