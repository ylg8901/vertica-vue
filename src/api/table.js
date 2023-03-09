import request from '@/utils/request'

export function getList(params) {
    return request({
        url: '/vertica_paas/table/list',
        method: 'get',
        params
    })
}