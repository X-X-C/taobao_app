import {XApp} from "./base/App";
import {Before} from "./src/config/Before";

export default class App extends XApp {
    constructor(context, apiName) {
        super(context, apiName);
        this.globalNeedParams = {
            activityId: "string"
        }
    }

    before: Before = new Before(this);
}
