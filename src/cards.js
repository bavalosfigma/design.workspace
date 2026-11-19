import AboutCard from "./about/AboutCard.vue"
import ArticlesCard from "./articles/ArticlesCard.vue"
import BookCard from "./books/BookCard.vue"
import CdPlayer from "./cd/CdPlayer.vue"
import DotsCard from "./dots/DotsCard.vue"
import GalleryCard from "./gallery/GalleryCard.vue"
import GlyphCard from "./glyph/GlyphCard.vue"
import JellyWidget from "./jelly/JellyWidget.vue"
import OffsiteCard from "./offsite/OffsiteCard.vue"
import StoreCard from "./store/StoreCard.vue"
import WalkthroughCard from "./walkthrough/WalkthroughCard.vue"

// A seat's `widget` field picks a card. A card may emit `open` with a page id.
export const cards = {
  about: AboutCard,
  articles: ArticlesCard,
  books: BookCard,
  cd: CdPlayer,
  dots: DotsCard,
  gallery: GalleryCard,
  glyph: GlyphCard,
  jelly: JellyWidget,
  offsite: OffsiteCard,
  store: StoreCard,
  walkthrough: WalkthroughCard,
}
