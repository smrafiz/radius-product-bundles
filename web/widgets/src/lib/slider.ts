import type { SliderState } from "./types";

export interface SliderConfig {
    autoplay: boolean;
    autoplaySpeed: number;
}

export class BundleSlider {
    private container: HTMLElement;
    private config: SliderConfig;
    private resizeHandler: (() => void) | null = null;
    private state: SliderState = {
        currentIndex: 0,
        totalSlides: 0,
        slidesPerView: 3,
        maxIndex: 0,
        autoplayInterval: null,
        isDragging: false,
        startX: 0,
        scrollStart: 0,
    };

    constructor(container: HTMLElement, config: SliderConfig) {
        this.container = container;
        this.config = config;
    }

    init(): void {
        const track = this.container.querySelector("[data-slider-track]") as HTMLElement;
        if (!track) return;

        const computedStyle = getComputedStyle(this.container);
        const slidesPerView = parseInt(
            computedStyle.getPropertyValue("--rb-slides-per-view") || "3",
            10,
        );

        const slides = track.querySelectorAll(".radius-bundle__product--slider");
        const totalSlides = slides.length;

        this.state = {
            ...this.state,
            totalSlides,
            slidesPerView,
            maxIndex: Math.max(0, totalSlides - slidesPerView),
            currentIndex: 0,
        };

        this.buildDots();
        this.updateNavigation();

        track.addEventListener("scroll", () => this.handleScroll());
        this.initDrag(track);

        if (this.config.autoplay) {
            this.startAutoplay();
        }

        this.resizeHandler = () => this.handleResize();
        window.addEventListener("resize", this.resizeHandler);
    }

    private buildDots(): void {
        const dotsContainer = this.container.querySelector("[data-slider-dots]");
        if (!dotsContainer) return;

        const { maxIndex } = this.state;
        dotsContainer.innerHTML = "";

        for (let i = 0; i <= maxIndex; i++) {
            const dot = document.createElement("button");
            dot.className = `radius-bundle__slider-dot${i === 0 ? " active" : ""}`;
            dot.setAttribute("data-index", i.toString());
            dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
            dot.addEventListener("click", () => this.goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    private updateNavigation(): void {
        const prevBtn = this.container.querySelector("[data-slider-prev]") as HTMLButtonElement;
        const nextBtn = this.container.querySelector("[data-slider-next]") as HTMLButtonElement;
        const { currentIndex, maxIndex } = this.state;

        if (prevBtn) prevBtn.disabled = currentIndex <= 0;
        if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
    }

    private updateDots(): void {
        const dotsContainer = this.container.querySelector("[data-slider-dots]");
        if (!dotsContainer) return;

        const dots = dotsContainer.querySelectorAll(".radius-bundle__slider-dot");
        const { currentIndex } = this.state;
        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === currentIndex);
        });
    }

    private handleScroll(): void {
        const track = this.container.querySelector("[data-slider-track]") as HTMLElement;
        if (!track) return;

        const slideWidth = this.getSlideWidth();
        if (slideWidth <= 0) return;

        const newIndex = Math.round(track.scrollLeft / slideWidth);
        if (newIndex !== this.state.currentIndex) {
            this.state.currentIndex = Math.min(newIndex, this.state.maxIndex);
            this.updateDots();
            this.updateNavigation();
        }
    }

    private handleResize(): void {
        const computedStyle = getComputedStyle(this.container);
        const slidesPerView = parseInt(
            computedStyle.getPropertyValue("--rb-slides-per-view") || "3",
            10,
        );

        this.state.slidesPerView = slidesPerView;
        this.state.maxIndex = Math.max(0, this.state.totalSlides - slidesPerView);

        if (this.state.currentIndex > this.state.maxIndex) {
            this.goToSlide(this.state.maxIndex);
        }

        this.buildDots();
        this.updateNavigation();
    }

    private getSlideWidth(): number {
        const track = this.container.querySelector("[data-slider-track]") as HTMLElement;
        if (!track) return 0;

        const firstSlide = track.querySelector(".radius-bundle__product--slider") as HTMLElement;
        if (!firstSlide) return 0;

        const gap = parseInt(getComputedStyle(track).gap || "0", 10);
        return firstSlide.offsetWidth + gap;
    }

    goToSlide(index: number): void {
        const track = this.container.querySelector("[data-slider-track]") as HTMLElement;
        if (!track) return;

        const clampedIndex = Math.max(0, Math.min(index, this.state.maxIndex));
        this.state.currentIndex = clampedIndex;

        track.scrollTo({
            left: clampedIndex * this.getSlideWidth(),
            behavior: "smooth",
        });

        this.updateDots();
        this.updateNavigation();
    }

    slidePrev(): void {
        this.goToSlide(this.state.currentIndex - 1);
    }

    slideNext(): void {
        this.goToSlide(this.state.currentIndex + 1);
    }

    private initDrag(track: HTMLElement): void {
        track.addEventListener("mousedown", (e) => {
            this.state.isDragging = true;
            this.state.startX = e.pageX;
            this.state.scrollStart = track.scrollLeft;
            track.classList.add("is-dragging");
            this.stopAutoplay();
        });

        track.addEventListener("mousemove", (e) => {
            if (!this.state.isDragging) return;
            e.preventDefault();
            const walk = (e.pageX - this.state.startX) * 1.2;
            track.scrollLeft = this.state.scrollStart - walk;
        });

        track.addEventListener("mouseup", () => {
            this.state.isDragging = false;
            track.classList.remove("is-dragging");
            this.snapToNearest();
            if (this.config.autoplay) this.startAutoplay();
        });

        track.addEventListener("mouseleave", () => {
            if (this.state.isDragging) {
                this.state.isDragging = false;
                track.classList.remove("is-dragging");
                this.snapToNearest();
            }
        });

        track.addEventListener("touchstart", (e) => {
            this.state.startX = e.touches[0].pageX;
            this.state.scrollStart = track.scrollLeft;
            this.stopAutoplay();
        });

        track.addEventListener("touchmove", (e) => {
            const walk = (e.touches[0].pageX - this.state.startX) * 1.2;
            track.scrollLeft = this.state.scrollStart - walk;
        });

        track.addEventListener("touchend", () => {
            this.snapToNearest();
            if (this.config.autoplay) this.startAutoplay();
        });
    }

    private snapToNearest(): void {
        const track = this.container.querySelector("[data-slider-track]") as HTMLElement;
        if (!track) return;

        const slideWidth = this.getSlideWidth();
        if (slideWidth <= 0) return;

        const nearestIndex = Math.round(track.scrollLeft / slideWidth);
        this.goToSlide(nearestIndex);
    }

    startAutoplay(): void {
        this.stopAutoplay();
        this.state.autoplayInterval = window.setInterval(() => {
            const { currentIndex, maxIndex } = this.state;
            if (currentIndex >= maxIndex) {
                this.goToSlide(0);
            } else {
                this.slideNext();
            }
        }, this.config.autoplaySpeed * 1000);
    }

    stopAutoplay(): void {
        if (this.state.autoplayInterval) {
            clearInterval(this.state.autoplayInterval);
            this.state.autoplayInterval = null;
        }
    }

    destroy(): void {
        this.stopAutoplay();
        if (this.resizeHandler) {
            window.removeEventListener("resize", this.resizeHandler);
        }
    }
}
