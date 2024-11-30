/**
 * @name MediaSlider
 * @version 1.2.0
 * @author @RealTime
 * @description A robust lazy-loading media slider component supporting multiple media types
 */
class MediaSlider {
    constructor(containerId, mediaUrls, options = {}) {
        this.containerId = containerId;
        this.mediaUrls = Array.isArray(mediaUrls) ? mediaUrls : [];
        this.options = {
            maxConcurrentLoads: 2, // Limit concurrent media loads
            timeout: 10000, // 10 seconds timeout for media loading
            ...options
        };
        this.loadedMedia = new Set();
        this.loadingMedia = new Set();
        this.init();
    }

    init() {
        // Ensure Swiper library is loaded before initializing
        this.loadSwiperLibrary()
            .then(() => {
                this.injectStyles();
                this.createSlider();
                this.initializeSwiper();
            })
            .catch(error => {
                console.error('Failed to load Swiper library:', error);
                this.showErrorMessage();
            });
    }

    loadSwiperLibrary() {
        return new Promise((resolve, reject) => {
            // Check if Swiper is already loaded
            if (window.Swiper) {
                return resolve();
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Swiper library'));
            document.body.appendChild(script);
        });
    }

    showErrorMessage() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = `
                <div style="color: red; text-align: center; padding: 20px;">
                    Failed to load media slider. Please try again later.
                </div>
            `;
        }
    }

    injectStyles() {
        const styleId = 'media-slider-styles';
        if (document.getElementById(styleId)) return;

        const styles = `
            <style id="${styleId}">
                .media-slider-container {
                    position: relative;
                    width: 100%;
                    height: 400px;
                    background: #f0f0f0;
                }
                .swiper-slide {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #ffffff;
                }
                .lazy-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f0f0f0;
                    color: #888;
                    text-align: center;
                    padding: 20px;
                    box-sizing: border-box;
                }
                .lazy-error {
                    color: red;
                    background: #ffeeee;
                }
                .swiper-slide img,
                .swiper-slide video,
                .swiper-slide audio,
                .swiper-slide iframe {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    detectMediaType(url) {
        if (!url) return 'unknown';
        const extension = url.split('.').pop().toLowerCase();
        const mediaTypes = {
            'jpg': 'image', 'jpeg': 'image', 'png': 'image', 
            'gif': 'image', 'webp': 'image', 'avif': 'image',
            'mp3': 'audio', 'm4a': 'audio', 'wav': 'audio', 'ogg': 'audio',
            'mp4': 'video', 'webm': 'video', 'ogv': 'video',
            'pdf': 'pdf', 'docx': 'office', 'xlsx': 'office', 'pptx': 'office'
        };
        return mediaTypes[extension] || 'unknown';
    }

    createPlaceholder(url) {
        const mediaType = this.detectMediaType(url);
        return `
            <div class="lazy-placeholder" data-url="${url}">
                Loading ${mediaType} media...
            </div>
        `;
    }

    loadMedia(url) {
        // Prevent duplicate loading
        if (this.loadedMedia.has(url) || this.loadingMedia.has(url)) {
            return Promise.resolve(url);
        }

        this.loadingMedia.add(url);

        return new Promise((resolve, reject) => {
            const mediaType = this.detectMediaType(url);
            let element;

            switch(mediaType) {
                case 'image':
                    element = new Image();
                    element.onload = () => {
                        this.loadedMedia.add(url);
                        this.loadingMedia.delete(url);
                        resolve(url);
                    };
                    element.onerror = () => {
                        this.loadingMedia.delete(url);
                        reject(new Error(`Failed to load image: ${url}`));
                    };
                    element.src = url;
                    break;

                case 'video':
                    element = document.createElement('video');
                    element.onloadedmetadata = () => {
                        this.loadedMedia.add(url);
                        this.loadingMedia.delete(url);
                        resolve(url);
                    };
                    element.onerror = () => {
                        this.loadingMedia.delete(url);
                        reject(new Error(`Failed to load video: ${url}`));
                    };
                    element.src = url;
                    break;

                case 'audio':
                    element = new Audio();
                    element.onloadedmetadata = () => {
                        this.loadedMedia.add(url);
                        this.loadingMedia.delete(url);
                        resolve(url);
                    };
                    element.onerror = () => {
                        this.loadingMedia.delete(url);
                        reject(new Error(`Failed to load audio: ${url}`));
                    };
                    element.src = url;
                    break;

                default:
                    // For PDFs, office docs, etc.
                    resolve(url);
            }

            // Add timeout
            setTimeout(() => {
                if (this.loadingMedia.has(url)) {
                    this.loadingMedia.delete(url);
                    reject(new Error(`Timeout loading media: ${url}`));
                }
            }, this.options.timeout);
        });
    }

    createMediaElement(url) {
        const mediaType = this.detectMediaType(url);
        switch(mediaType) {
            case 'image':
                return `<img src="${url}" alt="Media" loading="lazy">`;
            case 'video':
                return `<video src="${url}" controls width="100%" loading="lazy"></video>`;
            case 'audio':
                return `<audio src="${url}" controls loading="lazy"></audio>`;
            case 'pdf':
                return `<iframe src="https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true" width="100%" height="500"></iframe>`;
            case 'office':
                return `<iframe src="https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true" width="100%" height="500"></iframe>`;
            default:
                return `<div class="lazy-placeholder lazy-error">Unsupported media type</div>`;
        }
    }

    createSlider() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with ID ${this.containerId} not found`);
            return;
        }

        if (this.mediaUrls.length === 0) {
            container.innerHTML = '<div class="lazy-placeholder">No media available</div>';
            return;
        }

        container.innerHTML = `
            <div class="swiper media-slider-container">
                <div class="swiper-wrapper">
                    ${this.mediaUrls.map(url => `
                        <div class="swiper-slide">
                            ${this.createPlaceholder(url)}
                        </div>
                    `).join('')}
                </div>
                <div class="swiper-button-next"></div>
                <div class="swiper-button-prev"></div>
            </div>
        `;
    }

    initializeSwiper() {
        if (!window.Swiper) {
            console.error('Swiper library not loaded');
            return;
        }

        const swiper = new Swiper('.media-slider-container', {
            loop: this.mediaUrls.length > 1,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            on: {
                init: () => {
                    // Load first slide initially
                    this.loadSlideMedia(0);
                },
                slideChangeTransitionStart: (swiper) => {
                    // Load current and next slides
                    this.loadSlideMedia(swiper.activeIndex);
                    if (this.mediaUrls.length > 1) {
                        this.loadSlideMedia(swiper.activeIndex + 1);
                    }
                }
            }
        });
    }

    loadSlideMedia(slideIndex) {
        if (slideIndex < 0 || slideIndex >= this.mediaUrls.length) return;

        const slides = document.querySelectorAll('.swiper-slide');
        const slide = slides[slideIndex];
        if (!slide) return;

        const placeholder = slide.querySelector('.lazy-placeholder');
        if (!placeholder) return;

        const url = placeholder.getAttribute('data-url');
        if (!url) return;

        this.loadMedia(url)
            .then(() => {
                // Replace placeholder with actual media
                placeholder.parentNode.innerHTML = this.createMediaElement(url);
            })
            .catch(error => {
                console.error(error);
                placeholder.innerHTML = `
                    <div class="lazy-placeholder lazy-error">
                        Failed to load media<br>${error.message}
                    </div>
                `;
            });
    }
}

// Expose the class globally if needed
window.MediaSlider = MediaSlider;
