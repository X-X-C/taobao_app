// @ts-ignore
import * as moment from "moment-timezone";
//设置时区
moment.tz.setDefault("Asia/Shanghai");
export default class Time {
    constructor(date: any = new Date()) {
        this.bean = moment(date);
        this.common = {
            base: this.bean.format("YYYY-MM-DD HH:mm:ss"),
            YYYYMMDD: this.bean.format("YYYYMMDD"),
            x: this.bean.format("x")
        }
        this.to = (number = 0, string = "d"): Time => {
            // @ts-ignore
            return new Time(this.bean.add(number, string));
        }
        this.format = (str) => this.bean.format(str);
    }

    bean: any;
    common: {
        base: string,
        YYYYMMDD: string,
        x: string
    };
    to: Function;
    format: Function;
}