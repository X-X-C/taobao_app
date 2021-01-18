import Time from "../../base/utils/Time";

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
        return `【${who}】在【${time.common.base}】${what} ${target ? `【${target}】` : ""}, ${desc}。`;
    },

    assistDesc(who, target, desc) {
        return this.baseInfo(who, "助力", target, desc);
    }
}
