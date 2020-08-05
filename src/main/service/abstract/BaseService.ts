import BaseDao from "../../dao/abstract/BaseDao";
import BaseEntity from "../../entity/abstract/BaseEntity";
import Time from "../../utils/Time";

export default abstract class BaseService<T extends BaseDao, E extends BaseEntity> {
    protected constructor(Dao: T) {
        this.dao = Dao;
        this.context = this.dao.context;
        this.cloud = this.context.cloud;
        this.data = this.context.data;
        //处理未授权的用户名称
        this.context.userNick = this.context.userNick || this.context.mixNick.substr(0, 1) + "**";
        this.nick = this.context.userNick;
        this.openId = this.context.openId;
        this.mixNick = this.context.mixNick
        this.activityId = this.data.activityId;
    }

    protected dao: T;
    protected cloud: any;
    protected data: any;
    protected context: any;
    protected nick: string;
    protected openId: string;
    protected mixNick: string;
    protected activityId: string;
    protected time: Time = new Time();

    /**
     * 新增
     * @param entity
     */
    async add(entity: E) {
        return await this.dao.insert(entity);
    }

    /**
     * 编辑
     * @param filter
     * @param options
     */
    async edit(filter, options) {
        return await this.dao.update(filter, options);
    }

    /**
     * 删除
     * @param filter
     */
    async delete(filter) {
        return await this.dao.delete(filter);
    }

    /**
     * 统计查询
     * @param filter
     */
    async count(filter) {
        return await this.dao.count(filter);
    }

    async aggregate(pipe: Array<any>) {
        return await this.dao.aggregate(pipe);
    }


    /**
     * 分页查询带限制条件
     * 请求时可携带参数  page,size来分页
     * 返回分页数据
     * @param filter
     * @param options
     * @param dividePage    是否分页
     */
    async list(filter: any = {}, options: any = {}, dividePage = true) {
        let rs: any = {};
        if (dividePage === true) {
            let {size, page} = this.data;
            if (size && page) {
                options.skip = (page - 1) * size;
                options.limit = size;
                let count = await this.dao.count(filter);
                rs.total = Math.ceil(count / size);
            }
        }
        rs.data = await this.dao.find(filter, options);
        return rs;
    }

    /**
     * 获取单条数据
     * @param filter
     * @param options
     */
    async get(filter = {}, options = {}) {
        return (await this.list(filter, options, false)).data[0];
    }

    /**
     * 获取所有数据
     * @param filter
     * @param options
     */
    async getAll(filter = {}, options = {}) {
        return (await this.list(filter, options, false)).data;
    }

    /**
     * 从云端下载文件
     * @param fileId
     */
    async downloadFile(fileId) {
        return await this.cloud.file.downloadFile({fileId});
    }

    /**
     * 上传文件到云端并返回可访问连接
     * @param buffer
     * @param fileName
     */
    async uploadFile(buffer: any, fileName: string) {
        //上传文件
        let result = await this.cloud.file.uploadFile({
            fileContent: buffer,
            fileName: fileName
        });
        //获取链接
        let url = await this.cloud.file.getTempFileURL({
            fileId: [result.fileId]
        })
        //返回链接
        return url[0].url.replace(/-internal/g, "");
    }
}