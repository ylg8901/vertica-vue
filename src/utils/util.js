import { isArray, isObject, keys, forOwn } from 'lodash';
/**
 * @param {Array} list
 * @param {Function} f
 * @return {*}
 */
function find (list, f) {
  return list.filter(f)[0]
}
/**
 * @param {*} obj 深拷贝
 * @param {Array<Object>} cache
 * @return {*}
 */
export function deepCopy (obj, cache = []) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  const hit = find(cache, c => c.original === obj)
  if (hit) {
    return hit.copy
  }
  const copy = Array.isArray(obj) ? [] : {}
  cache.push({
    original: obj,
    copy
  })
  Object.keys(obj).forEach(key => {
    copy[key] = deepCopy(obj[key], cache)
  })
  return copy
}
/**
 * 在目标数组中匹配 数组某一项 key 值与 value 相等 并返回该项
 * @param {*} arr 
 * @param {*} key 
 * @param {*} value 
 */
export let getItemByKey = (arr, key, value) => {
  let item = null;
  isArray(arr) && arr.forEach(function(ele) {
    if (ele[key] == value) {
      item = ele;
    }
  });
  return item;
}
/**
 * 将属性列表 中属性 值 从source 中copy 指 target 中，改变target 中的属性值
 * @param {*} propList  要copy的属性列表
 * @param {*} source 源对象
 * @param {*} target 目标对象
 */
export let getChildObject = (parent, propList) => {
  let childObj = {};
  propList.forEach(prop => {
    childObj[prop] = parent[prop];
  })
  return childObj;
}

/**
 * 将 object转化成 数组 {a: 2} => [{key: a, value: 2}]  或者将数组转化成object 
 * @param {*} obj 
 */
export let objAndArrayTransform = param => {
  if (!isObject(param) && !isArray(param)) {
    return;
  }
  let resultArr = [];
  let result = {};
  if (isObject(param)) {
    keys(param).forEach(key => {
      resultArr.push({
        key: key,
        value: param[key]
      })
    })
    return resultArr;
  } 
  if (isArray(param)) {
    param.forEach((item, i) => {
      result[i] = item;
    })
    return result;
  }
}

/**
 * 过滤 obj 中的 “” null 和 undefined
 * @param {*} obj 
 */
export let filter = obj => {
  let temp = {};
  forOwn(obj, (value, key) => {
    if (value !== null || value !== undefined || value !== "") {
      temp[key] = value;
    }
  })
  return temp;
}


export let formateParam = param => {
  let append = '';
  forOwn(param, (value, key) => {
    append += (key + '=' + value + '&'); 
  })
  return append;
}


export let formatDate = (date, fmt) => {
  if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  let o = {
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'h+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds()
  }
  for (let k in o) {
      if (new RegExp(`(${k})`).test(fmt)) {
          let str = o[k] + ''
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
      }
  }
  return fmt
}

function padLeftZero(str) {
  return ('00' + str).substr(str.length)
}