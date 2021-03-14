import {task} from "./entity/User";

export default {}

export const taskConfig: taskConfigType = {
    ...task("follow", "关注店铺", 1),
    ...task("member", "加入会员", 1),
    ...task("sign", "每日签到", 1),
    ...task("assist", "邀请好友", 1, "other")
}

