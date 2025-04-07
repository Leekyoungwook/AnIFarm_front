export const getCategoryName = (category) => {
  const categories = {
    general: "일반 토론",
    food: "식물 재배",
    indoor: "실내 식물",
    pests: "병충해 관리",
    hydroponic: "수경 재배",
    question: "질문하기",
    sell: "판매하기",
    buy: "구매하기"
  };
  return categories[category] || category;
};

export const getCommunityTypeName = (type) => {
  const types = {
    marketplace: "판매하기",
    gardening: "재배하기",
    freeboard: "자유게시판"
  };
  return types[type] || type;
}; 