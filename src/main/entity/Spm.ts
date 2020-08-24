export default class Spm {
    constructor(prototype: object = {}) {
        Object.assign(this, prototype);
    }

    //活动ID
    activityId: string;
    //统计类型
    type: string;
    //时间戳
    timestamp: string;
    //时间字符串
    time: string;
    //日期字符串
    date: string;
    //附带数据
    data: any;
    //用户名
    nick: string;
    //用户OpenId
    openId: string;
}
