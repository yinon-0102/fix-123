import { request } from './request'

/**
 * 新增部件
 * @param {object} componentDTO
 */
export function saveComponent(componentDTO) {
  return request({
    url: '/weixiu/component/save',
    method: 'POST',
    data: componentDTO
  })
}

/**
 * 更新部件
 * @param {object} componentDTO
 */
export function updateComponent(componentDTO) {
  return request({
    url: '/weixiu/component/update',
    method: 'PUT',
    data: componentDTO
  })
}

/**
 * 删除部件
 * @param {string} id
 */
export function deleteComponent(id) {
  return request({
    url: `/weixiu/component/${id}`,
    method: 'DELETE'
  })
}

