/**
 * @name MediaSlider
 * @version 1.1.0
 * @author @RealTime
 * @description A lazy-loading media slider component supporting multiple media types with URL lazy loading
 */

class MediaSlider {
    constructor(containerId, mediaUrls) {
        this.containerId = containerId;
        this.mediaUrls = Array.isArray(mediaUrls) ? mediaUrls : []; // Ensure mediaUrls is an array
        this.loadedMedia = new Set(); // Track which media URLs have been loaded
        this.init();
    }

    init() {
        this.injectStyles();
        this.createSlider();
        this.initializeSwiper();
    }

    injectStyles() {
        const styles = `
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css">
            <style>
                .swiper {
                    width: 100%;
                    height: 100%;
                    margin: auto;
                    border-radius: 10px;
                    box-shadow: 0 0 2px var(--color_theme_shadow);
                }
                
                .swiper-slide {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--color_theme_surface);
                }
                
                .swiper-slide img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }
                
                .swiper-slide audio,
                .swiper-slide video {
                    max-width: 100%;
                }
                
                .swiper-slide iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }
                
                .swiper-slide .lazy-placeholder {
                    width: 100%;
                    height: 200px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f0f0f0;
                    color: #888;
                }
                
                .swiper-button-next,
                .swiper-button-prev {
                    background: var(--color_theme_background);
                    padding: 10px;
                    border-radius: 50%;
                    color: var(--color_theme_text_primary);
                    width: 25px;
                    height: 25px;
                    transition: all 0.3s ease;
                }
                
                .swiper-button-next:hover,
                .swiper-button-prev:hover {
                    background: var(--color_theme_surface);
                    transform: scale(1.1);
                }
                
                .swiper-button-next::after,
                .swiper-button-prev::after {
                    font-size: 20px;
                    font-weight: 700;
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    detectMediaType(url) {
        const extension = url.split('.').pop().toLowerCase();
        const mediaTypes = {
            'jpg': 'image',
            'jpeg': 'image',
            'png': 'image',
            'gif': 'image',
            'webp': 'image',
            'avif': 'image',
            'mp3': 'audio',
            'm4a': 'audio',
            'wav': 'audio',
            'ogg': 'audio',
            'mp4': 'video',
            'webm': 'video',
            'ogv': 'video',
            'pdf': 'pdf',
            'docx': 'office',
            'xlsx': 'office',
            'pptx': 'office'
        };
        return mediaTypes[extension] || 'unknown';
    }

    createPlaceholder(url) {
        return `
            <div class="lazy-placeholder" data-url="${url}">
                Loading ${this.detectMediaType(url)} media...
            </div>
        `;
    }

    createMediaElement(url) {
        const mediaType = this.detectMediaType(url);
        switch(mediaType) {
            case 'image':
                return `<img data-src="${url}" alt="Slide" class="lazy-load">`;
            case 'audio':
                return `<audio class="lazy-load" data-src="${url}" controls></audio>`;
            case 'video':
                return `<video class="lazy-load" data-src="${url}" controls width="100%"></video>`;
            case 'pdf':
                return `<iframe class="lazy-load" data-src="https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true"></iframe>`;
            case 'office':
                return `<iframe class="lazy-load" data-src="https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true"></iframe>`;
            default:
                return `<div>Unsupported media type</div>`;
        }
    }

    createSlider() {
        if (this.mediaUrls.length === 0) {
            document.getElementById(this.containerId).innerHTML = '<div>No media available</div>';
            return; // Exit if there are no media URLs
        }

        const sliderHtml = `
            <div class="swiper">
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
        document.getElementById(this.containerId).innerHTML = sliderHtml;
    }

    initializeSwiper() {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js';
        script.onload = () => {
            const swiper = new Swiper('.swiper', {
                loop: true,
                autoplay: false,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                effect: 'fade',
                fadeEffect: {
                    crossFade: true
                },
                speed: 900,
                preloadImages: true,
                watchSlidesProgress: true,
                on: {
                    slideChangeTransitionStart: (swiper) => {
                        this.lazyLoadMedia(swiper.slides[swiper.activeIndex]);
                    }
                }
            });

            // Load first slide's media initially
            this.lazyLoadMedia(swiper.slides[swiper.activeIndex]);
        };
        document.body.appendChild(script);
    }

    lazyLoadMedia(slideElement) {
        const lazyElements = slideElement.querySelectorAll('.lazy-load');
        
        lazyElements.forEach(el => {
            const url = el.getAttribute('data-src');
            
            // Skip if already loaded
            if (this.loadedMedia.has(url)) {
                this.replaceWithLoadedMedia(el, url);
                return;
            }

            // Create the appropriate media element
            const mediaType = this.detectMediaType(url);
            let newElement;

            switch(mediaType) {
                case 'image':
                    newElement = document.createElement('img');
                    newElement.src = url;
                    newElement.alt = 'Slide';
                    break;
                case 'audio':
                    newElement = document.createElement('audio');
                    newElement.innerHTML = `<source src="${url}" type="audio/${url.split('.').pop()}">`;
                    newElement.controls = true;
                    break;
                case 'video':
                    newElement = document.createElement('video');
                    newElement.innerHTML = `<source src="${url}" type="video/${url.split('.').pop()}">`;
                    newElement.controls = true;
                    newElement.width = '100%';
                    break;
                case 'pdf':
                case 'office':
                    newElement = document.createElement('iframe');
                    newElement.src = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
                    newElement.style.width = '100%';
                    newElement.style.height = '100%';
                    newElement.style.border = 'none';
                    break;
            }

            // Replace placeholder or lazy element
            el.parentNode.replaceChild(newElement, el);
            
            // Mark as loaded
            this.loadedMedia.add(url);
        });
    }

    replaceWithLoadedMedia(lazyElement, url) {
        // If media is already loaded, simply replace the lazy element
        const mediaType = this.detectMediaType(url);
        let newElement;

        switch(mediaType) {
            case 'image':
                newElement = document.createElement('img');
                newElement.src = url;
                newElement.alt = 'Slide';
                break;
            case 'audio':
                newElement = document.createElement('audio');
                newElement.innerHTML = `<source src="${url}" type="audio/${url.split('.').pop()}">`;
                newElement.controls = true;
                break;
            case 'video':
                newElement = document.createElement('video');
                newElement.innerHTML = `<source src="${url}" type="video/${url.split('.').pop()}">`;
                newElement.controls = true;
                newElement.width = '100%';
                break;
            case 'pdf':
            case 'office':
                newElement = document.createElement('iframe');
                newElement.src = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
                newElement.style.width = '100%';
                newElement.style.height = '100%';
                newElement.style.border = 'none';
                break;
        }

        lazyElement.parentNode.replaceChild(newElement, lazyElement);
    }
}
