// src/types/base.ts
export interface PageQuery {
    pageNum?: number;
    pageSize?: number;
  }
  
  export interface BaseEntity {
    createBy?: string;
    createTime?: string;
    updateBy?: string;
    updateTime?: string;
    remark?: string;
  }
  