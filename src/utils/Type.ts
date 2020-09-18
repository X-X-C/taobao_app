/**
 * 内部返回对象
 * @param code 0--失败
 */
export type result = {
    code: number,
    message?: string,
    data: any,
    [props: string]: any
}