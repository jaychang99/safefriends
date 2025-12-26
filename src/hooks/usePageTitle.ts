import { useEffect } from 'react';

const BASE_TITLE = 'SafeLens';
const DEFAULT_SUFFIX = '이미지 보호 스튜디오';

const buildTitle = (pageTitle?: string) => {
  if (pageTitle && pageTitle.trim().length > 0) {
    return `${pageTitle} | ${BASE_TITLE}`;
  }

  return `${BASE_TITLE} | ${DEFAULT_SUFFIX}`;
};

const usePageTitle = (pageTitle?: string) => {
  useEffect(() => {
    document.title = buildTitle(pageTitle);
  }, [pageTitle]);
};

export default usePageTitle;
