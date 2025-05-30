declare namespace API {
  type addUsingGETParams = {
    /** name */
    name?: string;
  };

  type RegisterParams = {
    userAccount?: string;
    userPassword?: string;
    checkPassword?: string;
    type?: string;
  };

  type CurrentUser = {
    id: number;
    username: string;
    userAccount: string;
    avatarUrl: string;
    gender: number;
    userPassword: string;
    phone: string;
    email: string;
    userStatus: number;
    createTime: Date;
    updateTime: Date;
    isDelete: number;
    userRole: string;
  };

  export type TeamChart = {
    id?: number;
    teamId?: number;
    chartId?: number;
    createTime?: Date;
    updateTime?: Date;
  };

  type BaseResponseBiResponse_ = {
    code?: number;
    data?: BiResponse;
    message?: string;
  };

  type BaseResponseBoolean_ = {
    code?: number;
    data?: boolean;
    message?: string;
  };

  type BaseResponseChart_ = {
    code?: number;
    data?: Chart;
    message?: string;
  };

  type BaseResponseInt_ = {
    code?: number;
    data?: number;
    message?: string;
  };

  type BaseResponseLoginUserVO_ = {
    code?: number;
    data?: LoginUserVO;
    message?: string;
  };

  type BaseResponseLong_ = {
    code?: number;
    data?: number;
    message?: string;
  };

  type BaseResponsePageChart_ = {
    code?: number;
    data?: PageChart_;
    message?: string;
  };

  type BaseResponsePageTeamVO = {
    code?: number;
    data?: PageTeamVO_;
    message?: string;
  }

  type BaseResponseTeam = {
    code?: number;
    data?: Team;
    message?: string;
  }

  type BaseResponsePageTeam = {
    code?: number;
    data?: PageTeam;
    message?: string;
  }

  type BaseResponseListTeamVO = {
    code?: number;
    data?: TeamVO[];
    message?: string;
  }

  type BaseResponsePagePostVO_ = {
    code?: number;
    data?: PagePostVO_;
    message?: string;
  };

  type BaseResponsePageUser_ = {
    code?: number;
    data?: PageUser_;
    message?: string;
  };

  type BaseResponsePageUserVO_ = {
    code?: number;
    data?: PageUserVO_;
    message?: string;
  };

  type BaseResponsePostVO_ = {
    code?: number;
    data?: PostVO;
    message?: string;
  };

  type BaseResponseString_ = {
    code?: number;
    data?: string;
    message?: string;
  };

  type BaseResponseUser_ = {
    code?: number;
    data?: User;
    message?: string;
  };

  type BaseResponseListUser_ = {
    code?: number;
    data?: User[];
    message?: string;
  };

  type BaseResponseUserVO_ = {
    code?: number;
    data?: UserVO;
    message?: string;
  };

  type BaseResponseMessage_ = {
    code?: number;
    data?: MessageVO[];
    message?: string;
  };

  type BiResponse = {
    chartId?: number;
    genChart?: string;
    genResult?: string;
  };

  type Chart = {
    chartData?: string;
    chartType?: string;
    createTime?: string;
    execMessage?: string;
    genChart?: string;
    genResult?: string;
    goal?: string;
    id?: number;
    isDelete?: number;
    name?: string;
    status?: string;
    allowModify?: number;
    updateTime?: string;
    userId?: number;
  };

  type ChartAddRequest = {
    chartData?: string;
    chartType?: string;
    goal?: string;
    name?: string;
  };

  type ChartEditRequest = {
    chartData?: string;
    chartType?: string;
    goal?: string;
    id?: number;
    name?: string;
  };

  type ChartQueryRequest = {
    chartType?: string;
    current?: number;
    goal?: string;
    id?: number;
    name?: string;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    userId?: number;
    teamId?: number;
    searchParams?: string;
  };

  type ChartUpdateRequest = {
    chartData?: string;
    chartType?: string;
    createTime?: string;
    genChart?: string;
    genResult?: string;
    goal?: string;
    id?: number;
    isDelete?: number;
    name?: string;
    updateTime?: string;
    teamId?: number;
  };

  type DeleteRequest = {
    id?: number;
  };

  type genChartByAiAsyncMqUsingPOSTParams = {
    chartType?: string;
    goal?: string;
    name?: string;
  };

  type genChartByAiAsyncUsingPOSTParams = {
    chartType?: string;
    goal?: string;
    name?: string;
  };

  type genChartByAiUsingPOSTParams = {
    chartType?: string;
    goal?: string;
    name?: string;
  };

  type getChartByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type TeamAddRequest = {
    name?: string;
    imgs?: string[];
    description?: string;
    maxNum?: number;
  }

  type TeamQueryRequest = {
    searchParam?: string;
    description?: string;
    current?: number;
    id?: number;
    name?: string;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    userId?: number;
  };

  type Team = {
    id?: number;
    name?: string;
    description?: string;
    imgUrl?: string;
    maxNum?: number;
    userId?: number;
    createTime?: Date;
    updateTime?: Date;
    isDelete?: number;
  }

  type TeamVO = {
    id: number;
    name?: string;
    description?: string;
    imgUrl?: string;
    maxNum?: number;
    userId?: number;
    createTime?: Date;
    updateTime?: Date;
    isDelete?: number;
    userVO?: LoginUserVO;
    inTeam?: boolean;
  }

  type getPostVOByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type getUserByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type getUserVOByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type getTeamByIdUsingGETParams = {
    id?: number;
  }

  type LoginUserVO = {
    createTime?: string;
    userAccount?: string;
    id?: number;
    updateTime?: string;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
    score?: number;
    generatingCount?: number;
  };

  type OrderItem = {
    asc?: boolean;
    column?: string;
  };

  type PageChart_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: Chart[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageTeamVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: TeamVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  }

  type PageTeam = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: Team[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  }

  type PagePostVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: PostVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageUser_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: User[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageUserVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: UserVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PostAddRequest = {
    content?: string;
    tags?: string[];
    title?: string;
  };

  type PostEditRequest = {
    content?: string;
    id?: number;
    tags?: string[];
    title?: string;
  };

  type PostFavourAddRequest = {
    postId?: number;
  };

  type PostFavourQueryRequest = {
    current?: number;
    pageSize?: number;
    postQueryRequest?: PostQueryRequest;
    sortField?: string;
    sortOrder?: string;
    userId?: number;
  };

  type PostQueryRequest = {
    content?: string;
    current?: number;
    favourUserId?: number;
    id?: number;
    notId?: number;
    orTags?: string[];
    pageSize?: number;
    searchText?: string;
    sortField?: string;
    sortOrder?: string;
    tags?: string[];
    title?: string;
    userId?: number;
  };

  type PostThumbAddRequest = {
    postId?: number;
  };

  type PostUpdateRequest = {
    content?: string;
    id?: number;
    tags?: string[];
    title?: string;
  };

  type ChartAddToTeamRequest = {
    chartId: number;
    teamId: number;
    allowModify: number;
  };

  type PostVO = {
    content?: string;
    createTime?: string;
    favourNum?: number;
    hasFavour?: boolean;
    hasThumb?: boolean;
    id?: number;
    tagList?: string[];
    thumbNum?: number;
    title?: string;
    updateTime?: string;
    user?: UserVO;
    userId?: number;
  };

  type uploadFileUsingPOSTParams = {
    biz?: string;
  };

  type User = {
    createTime?: string;
    id?: number;
    isDelete?: number;
    updateTime?: string;
    userAccount?: string;
    userAvatar?: string;
    userName?: string;
    userPassword?: string;
    userRole?: string;
    score?: number;
    generatingCount?: number;
  };

  type UserAddRequest = {
    userAccount?: string;
    userAvatar?: string;
    userName?: string;
    userRole?: string;
  };

  type UserLoginRequest = {
    userAccount?: string;
    userPassword?: string;
  };

  type UserQueryRequest = {
    current?: number;
    id?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
    searchParams?: string;
  };

  type UserRegisterRequest = {
    checkPassword?: string;
    userAccount?: string;
    userPassword?: string;
  };

  type UserUpdateMyRequest = {
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
  };

  type UserUpdateRequest = {
    id?: number;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
  };

  type UserVO = {
    createTime?: string;
    id?: number;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
  };

   type MessageVO = {
    id: number;
    content: string;
    chartHistoryId: number;
    fromId: number;
    toId: number;
    isRead: number; // 0 - 未读，1 - 已读
    fromUser?: UserVO;
    chartHistory?: Chart;
  };

}
