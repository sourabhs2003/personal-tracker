import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for mobile carousel logic
 * Handles navigation, persistence, and keyboard controls
 */
export default function useMobileCarousel(totalSlides) {
    const [currentIndex, setCurrentIndex] = useState(() => {
        const saved = localStorage.getItem('zowrox.dashLastCardIdx');
        return saved ? parseInt(saved, 10) : 0;
    });

    const carouselRef = useRef(null);
    const isScrollingRef = useRef(false);

    // Persist current index
    useEffect(() => {
        localStorage.setItem('zowrox.dashLastCardIdx', currentIndex.toString());
    }, [currentIndex]);

    // Scroll to slide
    const scrollToSlide = useCallback((index) => {
        if (!carouselRef.current) return;

        const container = carouselRef.current;
        const slideWidth = container.offsetWidth;
        const targetScroll = index * slideWidth;

        container.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    }, []);

    // Navigate to specific slide
    const goToSlide = useCallback((index) => {
        const clampedIndex = Math.max(0, Math.min(index, totalSlides - 1));
        setCurrentIndex(clampedIndex);
        scrollToSlide(clampedIndex);
    }, [totalSlides, scrollToSlide]);

    // Navigate to next slide
    const goToNext = useCallback(() => {
        goToSlide(currentIndex + 1);
    }, [currentIndex, goToSlide]);

    // Navigate to previous slide
    const goToPrev = useCallback(() => {
        goToSlide(currentIndex - 1);
    }, [currentIndex, goToSlide]);

    // Handle scroll event to update current index
    const handleScroll = useCallback(() => {
        if (!carouselRef.current || isScrollingRef.current) return;

        const container = carouselRef.current;
        const slideWidth = container.offsetWidth;
        const scrollLeft = container.scrollLeft;
        const newIndex = Math.round(scrollLeft / slideWidth);

        if (newIndex !== currentIndex) {
            setCurrentIndex(newIndex);
        }
    }, [currentIndex]);

    // Debounced scroll handler
    useEffect(() => {
        const container = carouselRef.current;
        if (!container) return;

        let timeoutId;
        const debouncedScroll = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleScroll, 100);
        };

        container.addEventListener('scroll', debouncedScroll);
        return () => {
            container.removeEventListener('scroll', debouncedScroll);
            clearTimeout(timeoutId);
        };
    }, [handleScroll]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goToPrev();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                goToNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToNext, goToPrev]);

    // Restore scroll position on mount
    useEffect(() => {
        if (carouselRef.current && currentIndex > 0) {
            // Delay to ensure DOM is ready
            setTimeout(() => scrollToSlide(currentIndex), 100);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        currentIndex,
        carouselRef,
        goToSlide,
        goToNext,
        goToPrev,
        canGoNext: currentIndex < totalSlides - 1,
        canGoPrev: currentIndex > 0
    };
}
