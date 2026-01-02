"use client"

import { Menu } from "@/types/menu"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import Image from "next/image"

interface MenuCardProps {
  menu: Menu
  onClick: () => void
  onEdit?: (menu: Menu) => void
  isAdmin?: boolean
}

export function MenuCard({ menu, onClick, onEdit, isAdmin }: MenuCardProps) {
  const getBadgeVariant = (tag: string) => {
    if (tag === "추천") return "default"
    if (tag === "맵기") return "destructive"
    return "secondary"
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) onEdit(menu)
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow active:scale-[0.98] min-h-[120px] relative"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {menu.media_url && (
            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={menu.media_url}
                alt={menu.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-xl font-bold text-foreground line-clamp-1">
                {menu.name}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                {menu.is_soldout && (
                  <Badge variant="outline">
                    품절
                  </Badge>
                )}
                {isAdmin && onEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleEditClick}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-base text-muted-foreground line-clamp-2 mb-2">
              {menu.description}
            </p>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex gap-1 flex-wrap">
                {menu.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={getBadgeVariant(tag)}
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
                {menu.allergens.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    알레르기 주의
                  </Badge>
                )}
              </div>
              <span className="text-2xl font-bold text-primary whitespace-nowrap">
                {menu.price.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

