import { BaseEntity, PageQuery } from '@/types/base';

export interface DishGroupVO {
    /**
     * 
     */
    id: string | number;
  
    /**
     * 所属菜系ID
     */
    categoryId: string | number;
  
    /**
     * 分类名称
     */
    name: string;
  
    /**
     * 分类英文名
     */
    nameEn: string;
  
    /**
     * 排序
     */
    sort: number;
  
  }
  
  export interface DishGroupForm extends BaseEntity {
    /**
     * 
     */
    id?: string | number;
  
    /**
     * 所属菜系ID
     */
    categoryId?: string | number;
  
    /**
     * 分类名称
     */
    name?: string;
  
    /**
     * 分类英文名
     */
    nameEn?: string;
  
    /**
     * 排序
     */
    sort?: number;
  
  }
  
  export interface DishGroupQuery extends PageQuery {
  
    /**
     * 所属菜系ID
     */
    categoryId?: string | number;
  
    /**
     * 分类名称
     */
    name?: string;
  
    /**
     * 分类英文名
     */
    nameEn?: string;
  
    /**
     * 排序
     */
    sort?: number;
  
      /**
       * 日期范围参数
       */
      params?: any;
  }
  
  
  
  