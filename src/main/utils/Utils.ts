import BaseResult from "../dto/BaseResult";
// @ts-ignore
import * as xlsx from "xlsx";
// @ts-ignore
import * as randombyweights from "randombyweights";
//@ts-ignore
import * as moment from "moment-timezone"
//设置时区
moment.tz.setDefault("Asia/Shanghai");

export default class Utils {
    /**
     * 判断参数是否正确
     * @param need  { name: "示例" }
     * @param real  { name: "小白" }
     * @return BaseResult
     */
    static checkParams(need: object, real: object) {
        for (let key in need) {
            if (typeof real[key] === "undefined") {
                return BaseResult.fail(`缺少参数${key}`);
            } else if (typeof real[key] !== typeof need[key]) {
                return BaseResult.fail(`参数类型错误${key}`);
            }
        }
        return BaseResult.success();
    }

    /**
     * 判断是否为空
     * @param any
     */
    static isBlank(any: any) {
        return any === null || any === undefined || any === "" || JSON.stringify(any) === "[]" || JSON.stringify(any) === "{}";
    }


    /**
     * 获取时间对象
     * @param date
     */
    static time(date = new Date()) {
        return {
            base: moment(date).format("YYYY-MM-DD HH:mm:ss"),
            YYYYMMDD: moment(date).format("YYYYMMDD"),
            X: moment(date).format("X"),
            x: moment(date).format("x"),
            bean: moment(date),
            to: (number = 0, string = "d") => {
                // @ts-ignore
                return Utils.time(moment(date).add(number, string));
            },
            format: (str) => moment(date).format(str),
        };
    }


    /**
     * 将excel里的时间转换为标准时间格式
     * @param number
     */
    static parseExcelDate(number: number) {
        //不是数字
        if (isNaN(Number(number)) === true) {
            return false;
        }
        let date = xlsx.SSF.parse_date_code(number);
        //返回
        return date.y + "-" + parseNum(date.m) + "-" + parseNum(date.d) + " " + parseNum(date.H) + ":" + parseNum(date.M) + ":" + parseNum(date.S)

        function parseNum(num) {
            if (num < 10) {
                return "0" + num;
            }
            return num;
        }
    }

    /**
     * 将excelBuffer转换为json
     * @param buffer
     * @param defineHeader 定义表头与键
     * @param who  读取第几张表
     */
    static parseExcel(buffer, defineHeader: any = {}, who: number = 0) {
        let data, workbook, header;
        workbook = xlsx.read(buffer, {type: "buffer"});
        //读取表的数据
        data = workbook.Sheets[workbook.SheetNames[who]];
        //读取表头
        header = xlsx.utils.sheet_to_json(data, {header: 1})[0];
        //判断表头是否拥有所有字段
        for (let key in defineHeader) {
            let v = defineHeader[key];
            if (header.indexOf(v) == -1) {
                return false;
            }
        }
        data = xlsx.utils.sheet_to_json(data);
        //映射对应的键
        data = data.map(v => {
            for (let key in defineHeader) {
                let targetKey = defineHeader[key];
                v[key] = v[targetKey];
                delete v[targetKey];
            }
            return v;
        });
        return data;
    }

    /**
     * 将json转化为excel buffer
     * @param excelJson
     */
    static jsonToExcelBuffer(excelJson) {
        //将json转换为xlsx的sheet格式
        let sheet = xlsx.utils.json_to_sheet(excelJson);
        //新建一个xlsx工作薄
        let workbook = xlsx.utils.book_new();
        //将json的sheet添加到新的工作簿中
        // @ts-ignore
        xlsx.utils.book_append_sheet(workbook, sheet, "sheet");
        //返回写出的工作簿buffer
        return xlsx.write(workbook, {type: "buffer"});
    }

    /**
     * 获取对象类型
     * @param any
     */
    static getType(any) {
        return Object.prototype.toString.call(any);
    }

    /**
     * 抽奖
     * @param probabilityArr 概率数组
     */
    static random(probabilityArr: Array<number>) {
        return randombyweights(probabilityArr);
    }

    /**
     * 获取的随机字符串长度
     * @param length
     */
    static getUniqueStr(length: number) {
        let unique = '';
        let source = [];
        //得到 0-9  A-Z  a-z
        for (let i = 0; i < 123; i++) {
            if (i >= 0 && i < 10) {
                source.push(i);
            } else if ((i >= 65 && i < 91) || (i >= 97 && i < 123)) {
                source.push(String.fromCharCode(i));
            }
        }
        //开始生成随机码
        for (let i = 0; i < length; i++) {
            unique += source[Math.floor(Math.random() * source.length)];
        }
        return unique;
    }

    /**
     * 扩展对象，只扩展源对象里有意义且目标对象有的值
     * @param target
     * @param source
     */
    static assign(target: object, source: object) {
        for (let key in source) {
            let v = source[key];
            if (!Utils.isBlank(v) && typeof target[key] !== "undefined") {
                target[key] = v;
            }
        }
    }
}