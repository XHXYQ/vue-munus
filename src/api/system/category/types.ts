import { BaseEntity, PageQuery } from '@/types/base';

export interface CategoryVO {
    /**
     * 
     */
    id: string | number;
  
    /**
     * 菜系名称
     */
    name: string;
  
    /**
     * 菜系英文名
     */
    nameEn: string;
  
    /**
     * 图片地址
     */
    image: string;
  
    /**
     * 图片地址Url
     */
    imageUrl: string;
    /**
     * 排序
     */
    sort: number;
  
  }
  
  export interface CategoryForm extends BaseEntity {
    /**
     * 
     */
    id?: string | number;
  
    /**
     * 菜系名称
     */
    name?: string;
  
    /**
     * 菜系英文名
     */
    nameEn?: string;
  
    /**
     * 图片地址
     */
    image?: string;
  
    /**
     * 排序
     */
    sort?: number;
  
  }
  
  export interface CategoryQuery extends PageQuery {
  
    /**
     * 菜系名称
     */
    name?: string;
  
    /**
     * 菜系英文名
     */
    nameEn?: string;
  
    /**
     * 图片地址
     */
    image?: string;
  
    /**
     * 排序
     */
    sort?: number;
  
      /**
       * 日期范围参数
       */
      params?: any;
  }
  
  
  
  