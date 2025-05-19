import { useState } from 'react';

//: S | (() => S)
export function usePagingQueryRequest(initValue) {
  const [queryRequest, setQueryRequest] = useState(initValue);

  // reset to init value
  const resetQueryRequest = () => {
    setQueryRequest(initValue instanceof Function ? initValue() : initValue);
  };

  // size per page
  const handleSizePerPageChange = (sizePerPage) => {
    setQueryRequest({
      ...queryRequest,
      page: 0,
      size: sizePerPage,
    });
  };

  // next page
  const handlePageChange = (nextPage) => {
    setQueryRequest({
      ...queryRequest,
      page: nextPage,
    });
  };

  // quick search
  const handleQuickSearch = (keyword) => {
    setQueryRequest({
      ...queryRequest,
      ...initValue,
      searchKeyword: keyword,
    });
  };

  return {
    queryRequest,
    setQueryRequest,
    resetQueryRequest,
    handleSizePerPageChange,
    handlePageChange,
    handleQuickSearch,
  };
}
