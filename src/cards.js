import AboutCard from "./about/AboutCard.vue"
import GalleryCard from "./gallery/GalleryCard.vue"
import GlyphCard from "./glyph/GlyphCard.vue"
import JellyWidget from "./jelly/JellyWidget.vue"
import OffsiteCard from "./offsite/OffsiteCard.vue"
import StoreCard from "./store/StoreCard.vue"

// A seat's `widget` field picks a card. A card may emit `open` with a page id.
export const cards = {
  about: AboutCard,
  gallery: GalleryCard,
  glyph: GlyphCard,
  jelly: JellyWidget,
  offsite: OffsiteCard,
  store: StoreCard,
}
