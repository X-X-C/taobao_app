/**
 * 内部返回对象
 */
export type result = {
    code: number,
    message?: string,
    data?: any,
    [props: string]: any
}