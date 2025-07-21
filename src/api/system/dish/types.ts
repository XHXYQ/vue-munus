import { BaseEntity, PageQuery } from '@/types/base';

export interface DishVO {
    /**
     * 
     */
    id: string | number;
  
    /**
     * 所属分类ID
     */
    dishGroupId: string | number;
  
    /**
     * 菜品名称
     */
    name: string;
  
    /**
     * 英文名称
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
     * 单价
     */
    price: number;
  
    /**
     * 描述
     */
    description: string;
  
  }
  
  export interface DishForm extends BaseEntity {
    /**
     * 
     */
    id?: string | number;
  
    /**
     * 所属分类ID
     */
    dishGroupId?: string | number;
  
    /**
     * 菜品名称
     */
    name?: string;
  
    /**
     * 英文名称
     */
    nameEn?: string;
  
    /**
     * 图片地址
     */
    image?: string;
  
    /**
     * 单价
     */
    price?: number;
  
    /**
     * 描述
     */
    description?: string;
  
  }
  
  export interface DishQuery extends PageQuery {
  
    /**
     * 所属分类ID
     */
    dishGroupId?: string | number;
  
    /**
     * 菜品名称
     */
    name?: string;
  
    /**
     * 英文名称
     */
    nameEn?: string;
  
    /**
     * 图片地址
     */
    image?: string;
  
    /**
     * 单价
     */
    price?: number;
  
    /**
     * 描述
     */
    description?: string;
  
      /**
       * 日期范围参数
       */
      params?: any;
  }
  
  
  
  