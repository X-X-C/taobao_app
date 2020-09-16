export type obj = {
    [props: string]: any
}

/**
 * @param code 0--失败
 */
export type result = {
    code: number,
    message?: string,
    data: any,
    [props: string]: any
}