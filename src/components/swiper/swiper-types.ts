import {Optional} from "@/utils/core-utils";

interface Swiper {
  activeIndex: Optional<number>;
  slideTo(index: number): void;
  slideNext(): void;
  slidePrev(): void;
}

export abstract class SwiperContainer {
  readonly swiper: Swiper;
}
