"use client";

import { useEffect, useState } from "react";
import { Menu, MenuCategory } from "@/types/menu";
import { supabase } from "@/lib/supabase/client";
import { CategoryTabs } from "@/components/CategoryTabs";
import { MenuCard } from "@/components/MenuCard";
import { MenuDetailSheet } from "@/components/MenuDetailSheet";
import { AdminPanel } from "@/components/AdminPanel";
import { WaitlistButton } from "@/components/WaitlistButton";
import { WaitlistDialog } from "@/components/WaitlistDialog";
import { WaitlistManagement } from "@/components/WaitlistManagement";

const CATEGORIES: MenuCategory[] = ["대표", "세트", "단품", "주류", "추가"];

export default function Home() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([]);
  const [activeCategory, setActiveCategory] = useState<MenuCategory>("대표");
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [isWaitlistDialogOpen, setIsWaitlistDialogOpen] = useState(false);
  const [isWaitlistManagementOpen, setIsWaitlistManagementOpen] =
    useState(false);

  useEffect(() => {
    checkAuth();
    fetchMenus();

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    // 실시간 구독
    const channel = supabase
      .channel("menus-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menus" },
        () => {
          fetchMenus();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const filtered = menus
      .filter((menu) => menu.category === activeCategory)
      .sort((a, b) => a.sort_order - b.sort_order);
    setFilteredMenus(filtered);
  }, [menus, activeCategory]);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setIsAdmin(!!session);
  };

  const fetchMenus = async () => {
    try {
      const { data, error } = await supabase
        .from("menus")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setMenus(data || []);
    } catch (error) {
      console.error("메뉴 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuClick = (menu: Menu) => {
    setSelectedMenu(menu);
    setIsDetailOpen(true);
  };

  const handleMenuUpdate = () => {
    fetchMenus();
    checkAuth();
  };

  const handleEditMenu = (menu: Menu) => {
    setEditingMenu(menu);
  };

  const menusByCategory = CATEGORIES.reduce((acc, category) => {
    acc[category] = menus
      .filter((menu) => menu.category === category)
      .sort((a, b) => a.sort_order - b.sort_order);
    return acc;
  }, {} as Record<MenuCategory, Menu[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold flex-1 text-center">
              꽃돼지 숯가마
            </h1>
            <div className="flex-shrink-0">
              <WaitlistButton
                onClick={() => {
                  if (isAdmin) {
                    setIsWaitlistManagementOpen(true);
                  } else {
                    setIsWaitlistDialogOpen(true);
                  }
                }}
                isAdmin={isAdmin}
              />
            </div>
          </div>
        </div>
      </header>

      <CategoryTabs
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main className="container mx-auto px-4 py-6 pb-24">
        {CATEGORIES.map((category) => {
          const categoryMenus = menusByCategory[category];
          if (categoryMenus.length === 0) return null;

          return (
            <section key={category} id={category} className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">{category}</h2>
              <div className="space-y-4">
                {categoryMenus.map((menu) => (
                  <MenuCard
                    key={menu.id}
                    menu={menu}
                    onClick={() => handleMenuClick(menu)}
                    onEdit={handleEditMenu}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {menus.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">메뉴가 없습니다.</p>
          </div>
        )}
      </main>

      <MenuDetailSheet
        menu={selectedMenu}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      <AdminPanel
        menus={menus}
        onMenuUpdate={handleMenuUpdate}
        editingMenu={editingMenu}
        onEditingMenuChange={setEditingMenu}
      />

      <WaitlistDialog
        open={isWaitlistDialogOpen}
        onOpenChange={setIsWaitlistDialogOpen}
        onSuccess={() => {
          // 대기 등록 성공 시 처리
        }}
      />

      <WaitlistManagement
        open={isWaitlistManagementOpen}
        onOpenChange={setIsWaitlistManagementOpen}
      />
    </div>
  );
}
