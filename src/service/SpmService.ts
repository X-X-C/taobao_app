import XSpmService from "../../base/service/XSpmService";
import {exp} from "../../base/utils/Annotation";
import App from "../../App";

export default class SpmService extends XSpmService<App> {


    /**
     * @api {app} taskInfo 任务明细
     * @apiDescription 任务明细
     * @apiParam {number} [page] 页码
     * @apiParam {number} [size] 每页大小
     * @apiSuccessExample
     * {}
     */
    @exp()
    async taskInfo() {
        let list = await this.pageList({
            openId: this.openId,
            activityId: this.activityId,
            "data.isTask": true
        }, {
            page: this.data.page,
            size: this.data.size,
            sort: {
                time: -1
            }
        });
        list.data = list.data.map(v => {
            let {taskType} = v.data;
            let timeFormat = "YYYY年MM月DD日 HH:mm:ss";
            let message = {
                time: this.time(v.time).format(timeFormat)
            };
            if (taskType === "assist") {
                //...
            } else {
                //...
            }
            return message;
        }) as any;
        this.response.data = list;
    }
}
