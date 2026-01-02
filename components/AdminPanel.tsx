"use client";

import { useState, useEffect } from "react";
import { Menu, MenuFormData, MenuCategory } from "@/types/menu";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Edit, Trash2, LogOut } from "lucide-react";

interface AdminPanelProps {
  menus: Menu[];
  onMenuUpdate: () => void;
  editingMenu?: Menu | null;
  onEditingMenuChange?: (menu: Menu | null) => void;
}

export function AdminPanel({
  menus,
  onMenuUpdate,
  editingMenu: externalEditingMenu,
  onEditingMenuChange,
}: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [internalEditingMenu, setInternalEditingMenu] = useState<Menu | null>(
    null
  );

  const editingMenu = externalEditingMenu ?? internalEditingMenu;
  const setEditingMenu = onEditingMenuChange ?? setInternalEditingMenu;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<MenuFormData>({
    category: "대표",
    name: "",
    description: "",
    price: 0,
    tags: [],
    allergens: [],
    origin: "",
    media_url: null,
    sort_order: 0,
    is_soldout: false,
  });
  const [tagInput, setTagInput] = useState("");
  const [allergenInput, setAllergenInput] = useState("");

  useEffect(() => {
    checkAuth();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (externalEditingMenu) {
      setEditingMenu(externalEditingMenu);
      setFormData({
        category: externalEditingMenu.category,
        name: externalEditingMenu.name,
        description: externalEditingMenu.description,
        price: externalEditingMenu.price,
        tags: externalEditingMenu.tags,
        allergens: externalEditingMenu.allergens,
        origin: externalEditingMenu.origin,
        media_url: externalEditingMenu.media_url,
        sort_order: externalEditingMenu.sort_order,
        is_soldout: externalEditingMenu.is_soldout,
      });
      setIsMenuDialogOpen(true);
    }
  }, [externalEditingMenu]);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("로그인 실패: " + authError.message);
      setIsLoading(false);
      return;
    }

    setIsLoginOpen(false);
    setIsLoading(false);
    setEmail("");
    setPassword("");
    checkAuth();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    onMenuUpdate();
  };

  const handleAddMenu = () => {
    setEditingMenu(null);
    setFormData({
      category: "대표",
      name: "",
      description: "",
      price: 0,
      tags: [],
      allergens: [],
      origin: "",
      media_url: null,
      sort_order: menus.length,
      is_soldout: false,
    });
    setIsMenuDialogOpen(true);
  };

  const handleEditMenu = (menu: Menu) => {
    setEditingMenu(menu);
    setFormData({
      category: menu.category,
      name: menu.name,
      description: menu.description,
      price: menu.price,
      tags: menu.tags,
      allergens: menu.allergens,
      origin: menu.origin,
      media_url: menu.media_url,
      sort_order: menu.sort_order,
      is_soldout: menu.is_soldout,
    });
    setIsMenuDialogOpen(true);
  };

  const handleSaveMenu = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (editingMenu) {
        const { error: updateError } = await supabase
          .from("menus")
          .update(formData)
          .eq("id", editingMenu.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("menus")
          .insert([formData]);

        if (insertError) throw insertError;
      }

      setIsMenuDialogOpen(false);
      onMenuUpdate();
    } catch (err: any) {
      setError("저장 실패: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMenu = async (id: string) => {
    setIsLoading(true);
    setError("");

    const { error } = await supabase.from("menus").delete().eq("id", id);

    if (error) {
      setError("삭제 실패: " + error.message);
      setIsLoading(false);
    } else {
      setIsMenuDialogOpen(false);
      setEditingMenu(null);
      onMenuUpdate();
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const addAllergen = () => {
    if (
      allergenInput.trim() &&
      !formData.allergens.includes(allergenInput.trim())
    ) {
      setFormData({
        ...formData,
        allergens: [...formData.allergens, allergenInput.trim()],
      });
      setAllergenInput("");
    }
  };

  const removeAllergen = (allergen: string) => {
    setFormData({
      ...formData,
      allergens: formData.allergens.filter((a) => a !== allergen),
    });
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {!isAuthenticated ? (
          <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                관리자
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>관리자 로그인</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호"
                    onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full"
                >
                  로그인
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-xs"
            >
              <LogOut className="h-3 w-3 mr-1" />
              로그아웃
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleAddMenu}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              메뉴 추가
            </Button>
          </>
        )}
      </div>

      {isAuthenticated && (
        <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMenu ? "메뉴 수정" : "메뉴 추가"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">카테고리</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as MenuCategory,
                    })
                  }
                  className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-3 text-base"
                >
                  <option value="대표">대표</option>
                  <option value="세트">세트</option>
                  <option value="단품">단품</option>
                  <option value="주류">주류</option>
                  <option value="추가">추가</option>
                </select>
              </div>

              <div>
                <Label htmlFor="name">메뉴명</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="description">설명</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-4 py-3 text-base"
                />
              </div>

              <div>
                <Label htmlFor="price">가격</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="origin">원산지</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) =>
                    setFormData({ ...formData, origin: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="media_url">이미지 URL</Label>
                <Input
                  id="media_url"
                  value={formData.media_url || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      media_url: e.target.value || null,
                    })
                  }
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label>태그</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                    placeholder="태그 입력 후 Enter"
                  />
                  <Button type="button" onClick={addTag}>
                    추가
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>알레르기 정보</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={allergenInput}
                    onChange={(e) => setAllergenInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addAllergen())
                    }
                    placeholder="알레르기 정보 입력 후 Enter"
                  />
                  <Button type="button" onClick={addAllergen}>
                    추가
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {formData.allergens.map((allergen) => (
                    <Badge
                      key={allergen}
                      variant="destructive"
                      className="gap-1"
                    >
                      {allergen}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeAllergen(allergen)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_soldout"
                  checked={formData.is_soldout}
                  onChange={(e) =>
                    setFormData({ ...formData, is_soldout: e.target.checked })
                  }
                  className="h-5 w-5"
                />
                <Label htmlFor="is_soldout">품절</Label>
              </div>

              <div>
                <Label htmlFor="sort_order">정렬 순서</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sort_order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-2">
                {editingMenu && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm("정말 이 메뉴를 삭제하시겠습니까?")) {
                        handleDeleteMenu(editingMenu.id);
                        setIsMenuDialogOpen(false);
                      }
                    }}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    삭제
                  </Button>
                )}
                <Button
                  onClick={handleSaveMenu}
                  disabled={isLoading}
                  className="flex-1"
                >
                  저장
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsMenuDialogOpen(false)}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
