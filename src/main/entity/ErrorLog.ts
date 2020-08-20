export default class ErrorLog {
    constructor(prototype: object = {}) {
        Object.assign(this, prototype);
    }

    //错误信息
    message: any = "";
    //错误API
    api: string;
    //请求参数
    params: object = {};
    //用户
    nick: string;
    //openId
    openId: string;
    //时间
    time: string;
}



