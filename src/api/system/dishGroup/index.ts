import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DishGroupVO, DishGroupForm, DishGroupQuery, GroupWithDishesVO } from '@/api/system/dishGroup/types';

/**
 * 查询菜品分类列表
 * @param query
 * @returns {*}
 */

// export const listDishGroup = (query?: DishGroupQuery): AxiosPromise<DishGroupVO[]> => {
//   return request({
//     url: '/system/dishGroup/list',
//     method: 'get',
//     params: query
//   });
// };

// ✅ 改为实际返回 DishGroupVO[] 而不是 AxiosPromise<DishGroupVO[]>
export const listDishGroup = (query?: DishGroupQuery): Promise<DishGroupVO[]> => {
    return request({
      url: '/system/dishGroup/list',
      method: 'get',
      params: query
    });
  };
  

/**
 * 查询菜品分类详细
 * @param id
 */
export const getDishGroup = (id: string | number): AxiosPromise<DishGroupVO> => {
  return request({
    url: '/system/dishGroup/' + id,
    method: 'get'
  });
};

/**
 * 新增菜品分类
 * @param data
 */
export const addDishGroup = (data: DishGroupForm) => {
  return request({
    url: '/system/dishGroup',
    method: 'post',
    data: data
  });
};

/**
 * 修改菜品分类
 * @param data
 */
export const updateDishGroup = (data: DishGroupForm) => {
  return request({
    url: '/system/dishGroup',
    method: 'put',
    data: data
  });
};

/**
 * 删除菜品分类
 * @param id
 */
export const delDishGroup = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/dishGroup/' + id,
    method: 'delete'
  });
};


// export const groupWithDishes = (params: { categoryId: number }) => {
//     return request({
//       url: '/system/dishGroup/groupedList',
//       method: 'get',
//       params
//     });
//   };
// export function groupWithDishes(params: { categoryId: number }): AxiosPromise<any> {
//   return request({
//     url: '/system/dishGroup/groupedList',
//     method: 'get',
//     params
//   });
// }
export function groupWithDishes(params: { categoryId: number }) {
  const result = request({
    url: '/system/dishGroup/groupedList',
    method: 'get',
    params
  });

  console.log("⚠️ groupWithDishes 返回值是：", result);
  return result;
}
