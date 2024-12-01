class MediaSlider {
    constructor(containerId, mediaUrls) {
        this.containerId = containerId;
        this.mediaUrls = Array.isArray(mediaUrls) ? mediaUrls : []; // Ensure mediaUrls is an array
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
                
                .document-viewer {
                    width: 100%;
                    height: 100%;
                    overflow: auto;
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

    createMediaElement(url) {
        const mediaType = this.detectMediaType(url);
        switch(mediaType) {
            case 'image':
                return `<img src="${url}" alt="Slide">`;
            case 'audio':
                return `<audio controls><source src="${url}" type="audio/${url.split('.').pop()}"></audio>`;
            case 'video':
                return `<video controls width="100%"><source src="${url}" type="video/${url.split('.').pop()}"></video>`;
            case 'pdf':
                return `<iframe src="https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true"></iframe>`;
            case 'office':
                return `<iframe src="https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true"></iframe>`;
            default:
                return `<iframe src="https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true"></iframe>`;
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
                            ${this.createMediaElement(url)}
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
            new Swiper('.swiper', {
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
                watchSlidesProgress: true
            });
        };
        document.body.appendChild(script);
    }
}