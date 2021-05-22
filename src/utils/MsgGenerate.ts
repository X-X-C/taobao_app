import Utils from "../../base/utils/Utils";
import XMsgGenerate from "../../base/utils/XMsgGenerate";

let {toJson} = Utils;
let {baseInfo} = XMsgGenerate;

export default {
    baseInfo,

    assistDesc(who, target, desc) {
        return baseInfo(who, "助力", target, desc);
    },

    receiveDesc(who, prizeName, topResult) {
        return baseInfo(who, "领取", prizeName, `领取【${topResult.code === 1 ? "成功" : "失败"}】，详情：${toJson(topResult.data)}`);
    }
}

