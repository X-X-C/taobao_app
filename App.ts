import {XApp} from "./base/App";

export default class App extends XApp {
    constructor(context, apiName) {
        super(context, apiName);
        this.globalNeedParams = {
            activityId: "string"
        }
    }
}
