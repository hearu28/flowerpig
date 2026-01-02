"use client";

import { MenuCategory } from "@/types/menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CategoryTabsProps {
  categories: MenuCategory[];
  activeCategory: MenuCategory;
  onCategoryChange: (category: MenuCategory) => void;
}

export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  const scrollToCategory = (category: MenuCategory) => {
    // 실제 섹션 요소를 id로 찾기
    const element = document.getElementById(category);
    if (element) {
      // sticky 헤더와 탭 높이 고려 (헤더 + 탭 = 약 140px)
      const headerOffset = 140;
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });
    }
  };

  const handleCategoryClick = (category: MenuCategory) => {
    onCategoryChange(category);
    // DOM 업데이트 후 스크롤 실행
    requestAnimationFrame(() => {
      setTimeout(() => scrollToCategory(category), 50);
    });
  };

  const handleValueChange = (value: string) => {
    handleCategoryClick(value as MenuCategory);
  };

  return (
    <div className="sticky top-0 z-40 bg-background border-b">
      <Tabs value={activeCategory} onValueChange={handleValueChange}>
        <TabsList className="w-full h-14 grid grid-cols-5 gap-1 p-1">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="text-sm sm:text-base"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
