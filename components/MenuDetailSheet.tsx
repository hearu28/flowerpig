"use client"

import { Menu } from "@/types/menu"
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
} from "@/components/ui/bottom-sheet"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface MenuDetailSheetProps {
  menu: Menu | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MenuDetailSheet({
  menu,
  open,
  onOpenChange,
}: MenuDetailSheetProps) {
  if (!menu) return null

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className="max-h-[90vh]">
        <BottomSheetHeader>
          <BottomSheetTitle className="text-3xl mb-2">{menu.name}</BottomSheetTitle>
          {menu.is_soldout && (
            <Badge variant="destructive" className="w-fit mb-2">
              품절
            </Badge>
          )}
        </BottomSheetHeader>

        <div className="space-y-4 mt-4">
          {menu.media_url && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <Image
                src={menu.media_url}
                alt={menu.name}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          )}

          <div className="space-y-3">
            <div>
              <h4 className="text-xl font-semibold mb-2">가격</h4>
              <p className="text-3xl font-bold text-primary">
                {menu.price.toLocaleString()}원
              </p>
            </div>

            <div>
              <h4 className="text-xl font-semibold mb-2">설명</h4>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {menu.description}
              </p>
            </div>

            {menu.origin && (
              <div>
                <h4 className="text-xl font-semibold mb-2">원산지</h4>
                <p className="text-lg">{menu.origin}</p>
              </div>
            )}

            {menu.tags.length > 0 && (
              <div>
                <h4 className="text-xl font-semibold mb-2">태그</h4>
                <div className="flex gap-2 flex-wrap">
                  {menu.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-base px-3 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {menu.allergens.length > 0 && (
              <div>
                <h4 className="text-xl font-semibold mb-2 text-destructive">
                  알레르기 정보
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {menu.allergens.map((allergen) => (
                    <Badge
                      key={allergen}
                      variant="destructive"
                      className="text-base px-3 py-1"
                    >
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  )
}

