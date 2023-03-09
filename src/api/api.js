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

export function getServiceInstances(params) {
    return request({
        url: dev_url + '/instance/getServiceInstances',
        method: 'get',
        params
    })
}

export function getSchemaList(params) {
    return request({
        url: dev_url + '/schema/getSchemaList',
        method: 'get',
        params
    })
}

export function createSchema(params) {
    return request({
        url: dev_url + '/schema/createSchema',
        method: 'post',
        params
    })
}

export function deleteSchema(params) {
    return request({
        url: dev_url + '/schema/deleteSchema',
        method: 'delete',
        params
    })
}

export function getUserList(params) {
    return request({
        url: dev_url + '/user/getUserList',
        method: 'get',
        params
    })
}

export function getUnCreatedUserByResource(params) {
    return request({
        url: dev_url + '/user/getUnCreatedUserByResource',
        method: 'get',
        params
    })
}

export function createUser(params) {
    return request({
        url: dev_url + '/user/createUser',
        method: 'post',
        params
    })
}

export function deleteUser(params) {
    return request({
        url: dev_url + '/user/deleteUser',
        method: 'delete',
        params
    })
}

export function getRoleList(params) {
    return request({
        url: dev_url + '/role/getRoleList',
        method: 'get',
        params
    })
}

export function createRole(params) {
    return request({
        url: dev_url + '/role/createRole',
        method: 'post',
        params
    })
}

export function updateRole(params) {
    return request({
        url: dev_url + '/role/updateRole',
        method: 'put',
        params
    })
}

export function deleteRole(params) {
    return request({
        url: dev_url + '/role/deleteRole',
        method: 'delete',
        params
    })
}

export function allotRoleToUser(params) {
    return request({
        url: dev_url + '/role/allotRoleToUser',
        method: 'put',
        params
    })
}

export function getSchemaGrantsList(params) {
    return request({
        url: dev_url + '/grants/getSchemaGrantsList',
        method: 'get',
        params
    })
}

export function createSchemaGrants(params) {
    return request({
        url: dev_url + '/grants/createSchemaGrants',
        method: 'post',
        params
    })
}

export function updateSchemaGrants(params) {
    return request({
        url: dev_url + '/grants/updateSchemaGrants',
        method: 'put',
        params
    })
}

export function deleteSchemaGrants(params) {
    return request({
        url: dev_url + '/grants/deleteSchemaGrants',
        method: 'delete',
        params
    })
}

export function getVsProceduresList(params) {
    return request({
        url: dev_url + '/grants/getVsProceduresList',
        method: 'delete',
        params
    })
}

export function getExternalGrantsList(params) {
    return request({
        url: dev_url + '/grants/getExternalGrantsList',
        method: 'get',
        params
    })
}

export function createExternalGrants(params) {
    return request({
        url: dev_url + '/grants/createExternalGrants',
        method: 'post',
        params
    })
}

export function updateExternalGrants(params) {
    return request({
        url: dev_url + '/grants/updateExternalGrants',
        method: 'put',
        params
    })
}

export function deleteExternalGrants(params) {
    return request({
        url: dev_url + '/grants/deleteExternalGrants',
        method: 'delete',
        params
    })
}

export function getServiceLogList(params) {
    return request({
        url: dev_url + '/logs/getServiceLogList',
        method: 'get',
        params
    })
}

/****************************************************** 运维监控管理 *************************************************************/
export function getNodesMonitor(params) {
    return request({
        url: dev_url + '/monitor/getNodesMonitor',
        method: 'get',
        params
    })
}
export function getNodesDetailInfo(params) {
    return request({
        url: dev_url + '/monitor/getNodesDetailInfo',
        method: 'get',
        params
    })
}

export function getLocksMonitor(params) {
    return request({
        url: dev_url + '/monitor/getLocksMonitor',
        method: 'get',
        params
    })
}
export function getLocksDetailInfo(params) {
    return request({
        url: dev_url + '/monitor/getLocksDetailInfo',
        method: 'get',
        params
    })
}

export function getSessionsMonitor(params) {
    return request({
        url: dev_url + '/monitor/getSessionsMonitor',
        method: 'get',
        params
    })
}

export function getAhmLgeMonitor(params) {
    return request({
        url: dev_url + '/monitor/getAhmLgeMonitor',
        method: 'get',
        params
    })
}

export function getPoolsMonitor(params) {
    return request({
        url: dev_url + '/monitor/getPoolsMonitor',
        method: 'get',
        params
    })
}

export function getResourceQueues(params) {
    return request({
        url: dev_url + '/monitor/getResourceQueues',
        method: 'get',
        params
    })
}

export function getDcResourceAcquisitions(params) {
    return request({
        url: dev_url + '/monitor/getDcResourceAcquisitions',
        method: 'get',
        params
    })
}

export function getOtherSixMonitor(params) {
    return request({
        url: dev_url + '/monitor/getOtherSixMonitor',
        method: 'get',
        params
    })
}

export function getTopSqlMonitor(params) {
    return request({
        url: dev_url + '/monitor/getTopSqlMonitor',
        method: 'get',
        params
    })
}