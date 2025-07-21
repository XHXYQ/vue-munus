import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DishVO, DishForm, DishQuery } from '@/api/system/dish/types';

/**
 * 查询菜品列表
 * @param query
 * @returns {*}
 */

export const listDish = (query?: DishQuery): AxiosPromise<DishVO[]> => {
  return request({
    url: '/system/dish/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询菜品详细
 * @param id
 */
export const getDish = (id: string | number): AxiosPromise<DishVO> => {
  return request({
    url: '/system/dish/' + id,
    method: 'get'
  });
};

/**
 * 新增菜品
 * @param data
 */
export const addDish = (data: DishForm) => {
  return request({
    url: '/system/dish',
    method: 'post',
    data: data
  });
};

/**
 * 修改菜品
 * @param data
 */
export const updateDish = (data: DishForm) => {
  return request({
    url: '/system/dish',
    method: 'put',
    data: data
  });
};

/**
 * 删除菜品
 * @param id
 */
export const delDish = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/dish/' + id,
    method: 'delete'
  });
};
