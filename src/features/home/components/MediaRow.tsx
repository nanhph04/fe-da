import { MediaCard, type MediaCardProps } from "./MediaCard";
import { MediaRowScroller } from "./MediaRowScroller";

interface MediaRowProps {
  title: string;
  items: MediaCardProps[];
  viewAllHref?: string;
}

export function MediaRow({ title, items, viewAllHref }: MediaRowProps) {
  return (
    <MediaRowScroller title={title} viewAllHref={viewAllHref}>
      {items.map((item) => (
        <MediaCard key={item.id} {...item} />
      ))}
    </MediaRowScroller>
  );
}