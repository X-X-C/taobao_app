export default {
    /**
     * 奖品领取desc
     * @param user
     * @param time
     * @param prize
     * @param result
     */
    receiveDesc(user, time, prize, result) {
        return `【${user.nick}】在【${time}】领取【${prize.name}】，领取${result.code === 1 ? "成功。" : `失败，${JSON.stringify(result.data)}`}`
    },

    assistDesc(user, inviter, time, msg, vipResult) {
        return `【${user.nick}】在【${time}】被【${inviter.nick}】邀请，${msg}，${vipResult.code === 1 ? `首次入会时间【${vipResult.data.gmt_create}】` : "不是会员"}`
    }
}