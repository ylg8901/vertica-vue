import request from '@/utils/request'


let dev_url = "";
let requestUrl = window.location.pathname;
if (requestUrl.includes("vertica")) {
    dev_url = requestUrl;
    if (requestUrl.endsWith("/")) {
        dev_url = requestUrl.substring(0, requestUrl.length - 1);
    }
}
console.log("访问路径" + dev_url);

export function login(data) {
    return request({
        url: dev_url + '/vertica_paas/user/login',
        method: 'post',
        data
    })
}

export function checkToken(token) {
    return request({
        url: dev_url + '/user/checkToken',
        method: 'get',
        params: { token }
    })
}

export function logoutToken(token) {
    return request({
        url: dev_url + '/user/logoutToken',
        method: 'get',
        params: { token }
    })
}

export function getInfo(token) {
    return request({
        url: dev_url + '/vertica_paas/user/info',
        method: 'get',
        params: { token }
    })
}

export function logout() {
    return request({
        url: dev_url + '/vertica_paas/user/logout',
        method: 'post'
    })
}