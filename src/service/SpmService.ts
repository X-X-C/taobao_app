import XSpmService from "../../base/service/XSpmService";
import {exp} from "../../base/utils/Annotation";

export default class SpmService extends XSpmService {


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
