import Dao from "./Dao";

export default class BaseDao extends Dao {

    constructor(public context: any, public table: string) {
        super(context, table);
        try {
            this.db = context.cloud.db.collection(table);
        } catch (e) {
            this.db = "获取数据库连接失败";
        }
    }

    db;

    async delete(filter: object) {
        return await this.db.deleteMany(filter);
    }

    async insert(beans: Array<object> | object) {
        if (Array.isArray(beans) === false) {
            return await this.db.insertOne(beans);
        } else {
            return await this.db.insertMany(beans);
        }
    }

    async find(filter: object = {}, options: object = {}) {
        return await this.db.find(filter, options);
    }

    async update(filter: object, options: object) {
        return await this.db.updateMany(filter, options);
    }

    async count(filter: object) {
        return await this.db.count(filter);
    };

    async aggregate(pipe: object[]) {
        return await this.db.aggregate(pipe);
    };


    /**
     * 从云端下载文件
     * @param fileId
     */
    async downloadFile(fileId) {
        return await this.context.cloud.file.downloadFile({fileId});
    }

    /**
     * 上传文件到云端并返回可访问连接
     * @param buffer
     * @param fileName
     */
    async uploadFile(buffer: any, fileName: string) {
        //上传文件
        let result = await this.context.cloud.file.uploadFile({
            fileContent: buffer,
            fileName: fileName
        });
        //获取访问链接
        return await this.getTempFileUrl(result.fileId);
    }

    /**
     * 获取访问链接
     * @param fileId
     */
    async getTempFileUrl(fileId) {
        //获取链接
        let url = await this.context.cloud.file.getTempFileURL({
            fileId: [fileId]
        })
        //返回链接
        return url[0].url.replace(/-internal/g, "");
    }

}