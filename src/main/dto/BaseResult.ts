//基础返回数据对象类
export default class BaseResult {
    /**
     * 构造器
     * @param message 信息
     * @param data  数据
     * @param success  是否成功
     * @param error 失败
     */
    constructor(public message: string, public data: any, public success: boolean, public error: number) {
    }

    //成功码
    public static readonly STATUS_SUCCESS = 0; //成功码
    public static readonly STATUS_FAIL = 1; //服务器错误码
    public static readonly ACTIVITY_NOT_START = 2; //活动未开始
    public static readonly ACTIVITY_END = 3; //活动已结束
    public static readonly ACTIVITY_NOT_IN = 4; //不在活动时间范围内
    public static readonly ALREADY_ASSIST = 5; //已经 [应援 || 助力] 过了
    public static readonly NOT_MEMBER = 6; //不是店铺会员


    //基础成功返回对象
    public static success(message: string = "成功", data: any = {}, success: boolean = true): BaseResult {
        return new BaseResult(message, data, success, this.STATUS_SUCCESS);
    }


    //基础失败返回对象
    public static fail(message: string = "错误", data: any = {}, code: number = this.STATUS_FAIL): BaseResult {
        return new BaseResult(message, data, false, code);
    }
}