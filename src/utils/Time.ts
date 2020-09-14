// @ts-ignore
import * as moment from "moment-timezone";
//设置时区
moment.tz.setDefault("Asia/Shanghai");
export default class Time {
    constructor(date: any = new Date()) {
        this.bean = moment(date);
        this.base = this.bean.format("YYYY-MM-DD HH:mm:ss");
        this.YYYYMMDD = this.bean.format("YYYYMMDD");
        this.X = this.bean.format("X");
        this.x = this.bean.format("x");
        this.to = (number = 0, string = "d") => {
            // @ts-ignore
            return new Time(this.bean.add(number, string));
        }
        this.format = (str) => this.bean.format(str);
    }

    base: string;
    YYYYMMDD: string;
    X: string;
    x: string;
    bean: any;
    to: Function;
    format: Function;
}