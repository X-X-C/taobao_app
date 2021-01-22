import Time from "../../base/utils/Time";
import Utils from "../../base/utils/Utils";

export default {
    /**
     * 生成信息
     * @param who 谁
     * @param what 干什么
     * @param desc 描述
     * @param target 对谁
     * @param time 时间
     */
    baseInfo(who, what, target, desc, time = new Time()) {
        return `【${who}】在【${time.common.base}】${what} ${target ? `【${target}】` : ""}, ${Utils.toJson(desc)}。`;
    },

    assistDesc(who, target, desc) {
        return this.baseInfo(who, "助力", target, desc);
    },

    receiveDesc(who, prizeName, topResult) {
        return this.baseInfo(who, "领取", prizeName, `领取【${!!topResult.code}】，详情：${topResult.data}`);
    }
}
