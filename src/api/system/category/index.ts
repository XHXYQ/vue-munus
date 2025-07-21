import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CategoryVO, CategoryForm, CategoryQuery } from '@/api/system/category/types';

/**
 * 查询菜系列表
 * @param query
 * @returns {*}
 */

export interface R<T = any> {
  code: number
  msg: string
  rows?: T
  data?: T
  total?: number
}

// export const listCategory = (query?: CategoryQuery): AxiosPromise<CategoryVO[]> => {
//   return request({
//     url: '/system/category/list',
//     method: 'get',
//     params: query
//   });
// }

export const listCategory = (query?: CategoryQuery): Promise<CategoryVO[]> => {
  return request({
    url: '/system/category/list',
    method: 'get',
    params: query
  });
};



/**
 * 查询菜系详细
 * @param id
 */
export const getCategory = (id: string | number): AxiosPromise<CategoryVO> => {
  return request({
    url: '/system/category/' + id,
    method: 'get'
  });
};

/**
 * 新增菜系
 * @param data
 */
export const addCategory = (data: CategoryForm) => {
  return request({
    url: '/system/category',
    method: 'post',
    data: data
  });
};

/**
 * 修改菜系
 * @param data
 */
export const updateCategory = (data: CategoryForm) => {
  return request({
    url: '/system/category',
    method: 'put',
    data: data
  });
};

/**
 * 删除菜系
 * @param id
 */
export const delCategory = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/category/' + id,
    method: 'delete'
  });
};
