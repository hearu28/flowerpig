export type MenuCategory = '대표' | '세트' | '단품' | '주류' | '추가'

export interface Menu {
  id: string
  category: MenuCategory
  name: string
  description: string
  price: number
  tags: string[] // 예: ['맵기', '추천', '신메뉴']
  allergens: string[] // 예: ['우유', '대두']
  origin: string
  media_url: string | null
  sort_order: number
  is_soldout: boolean
  updated_at: string
}

export interface MenuFormData {
  category: MenuCategory
  name: string
  description: string
  price: number
  tags: string[]
  allergens: string[]
  origin: string
  media_url: string | null
  sort_order: number
  is_soldout: boolean
}

