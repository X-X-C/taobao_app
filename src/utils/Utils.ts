import BaseResult from "../dto/BaseResult";
// @ts-ignore
import * as xlsx from "xlsx";
// @ts-ignore
import * as randombyweights from "randombyweights";
// @ts-ignore
import * as qr from "qr-image";
import {obj} from "./Type";

export default class Utils {
    /**
     * 判断参数是否正确
     * @param need  { name: "示例" }
     * @param real  { name: "小白" }
     * @return BaseResult
     */
    static checkParams(need: obj, real: obj): BaseResult {
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
    static isBlank(any: any): boolean {
        return any === null || any === undefined || any === "" || JSON.stringify(any) === "[]" || JSON.stringify(any) === "{}";
    }


    /**
     * 将excel里的时间转换为标准时间格式
     * @param number
     */
    static parseExcelDate(number: number): false | string {
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
     * @param defineHeader
     * @param who  读取第几张表
     */
    static parseExcel(buffer, defineHeader: any = {}, who: number = 0): Array<any> | false {
        let data, workbook;
        workbook = xlsx.read(buffer, {
            type: "buffer"
        });
        //读取表的数据
        data = workbook.Sheets[workbook.SheetNames[who]];
        data = xlsx.utils.sheet_to_json(data);
        try {
            let header = true;
            //映射对应的键
            data = data.map(v => {
                let o = {};
                for (let key in defineHeader) {
                    let targetKey = defineHeader[key];
                    //如果是表头
                    if (header === true) {
                        //如果表头中没有对应的键
                        if (typeof v[targetKey] === "undefined") {
                            throw "缺少字段" + targetKey
                        }
                    }
                    if (typeof v[targetKey] === "number") {
                        v[targetKey] = String(v[targetKey]);
                    }
                    o[key] = v[targetKey];
                }
                header = false;
                return o;
            });
        } catch (e) {
            return false;
        }
        return data;
    }

    /**
     * 将json转化为excel buffer
     * @param excelJson
     * @param ext {
     *     header: []
     * }
     */
    static jsonToExcelBuffer(excelJson, ext: { header?: Array<any> } = {}): Buffer {
        //将json转换为xlsx的sheet格式
        let sheet = xlsx.utils.json_to_sheet(excelJson, ext);
        //新建一个xlsx工作薄
        let workbook = xlsx.utils.book_new();
        //将json的sheet添加到新的工作簿中
        // @ts-ignore
        xlsx.utils.book_append_sheet(workbook, sheet, "sheet");
        //返回写出的工作簿buffer
        return xlsx.write(workbook, {type: "buffer"});
    }

    /**
     * 抽奖
     * @param probabilityArr 概率数组
     */
    static random(probabilityArr: Array<number>): number {
        return randombyweights(probabilityArr);
    }

    /**
     * 获取的随机字符串长度
     * @param length
     */
    static getUniqueStr(length: number): string {
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
     * 获取精确类型
     * @param any
     */
    static getType(any): string {
        return Object.prototype.toString.call(any);
    }

    /**
     * 扩展对象，只扩展源对象里有意义且目标对象有的值
     * @param target
     * @param source
     */
    static assign(target: object, source: object): void {
        for (let key in source) {
            let v = source[key];
            if (!Utils.isBlank(v) && typeof target[key] !== "undefined") {
                target[key] = v;
            }
        }
    }

    /**
     * 清除对象里的空白值
     * @param obj
     * @param deep
     */
    static cleanObj(obj, deep = true): boolean {
        if ([Utils.getType({}), Utils.getType([])].indexOf(Utils.getType(obj)) !== -1) {
            for (let key in obj) {
                if (Utils.isBlank(obj[key])) {
                    delete obj[key];
                }
                //深清除
                else if (Utils.getType(obj[key]) === Utils.getType({}) && deep === true) {
                    Utils.cleanObj(obj[key]);
                    Utils.cleanObj(obj, false);
                }
            }
        }
        return !Utils.isBlank(obj);
    }

    /**
     * 清空对象数组里的所有空值
     * @param arr
     */
    static cleanObjArr(arr: object[]): number {
        let delArr = [];
        if (arr.length > 0) {
            arr.forEach((v, k) => {
                Utils.cleanObj(arr[k]);
                if (Utils.isBlank(arr[k])) {
                    delArr.push(k);
                }
            })
        }
        if (delArr.length > 0) {
            for (let k of delArr) {
                arr.splice(k, 1);
            }
        }
        return arr.length;
    }

    /**
     * 解析url为base64二维码
     * @param url
     */
    static qrImage(url): string {
        return 'data:image/png;base64,' + Buffer.from(qr.imageSync(url), 'utf8').toString('base64');
    }
}