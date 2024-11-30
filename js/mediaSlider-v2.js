class MediaSlider {
    constructor(containerId, mediaUrls) {
        this.containerId = containerId;
        this.mediaUrls = Array.isArray(mediaUrls) ? mediaUrls : [];
        this.observer = null;
        this.init();
    }

    init() {
        this.injectStyles();
        this.createSlider();
        this.initializeSwiper();
        this.setupLazyLoading();
    }

    setupLazyLoading() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const mediaElement = entry.target;
                    const actualSrc = mediaElement.dataset.src;
                    
                    if (mediaElement.tagName.toLowerCase() === 'img') {
                        mediaElement.src = actualSrc;
                    } else if (mediaElement.tagName.toLowerCase() === 'video' || 
                             mediaElement.tagName.toLowerCase() === 'audio') {
                        mediaElement.src = actualSrc;
                        mediaElement.load();
                    }
                    
                    this.observer.unobserve(mediaElement);
                }
            });
        }, {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        });
    }

    createMediaElement(url) {
        const mediaType = this.detectMediaType(url);
        let element;

        switch(mediaType) {
            case 'image':
                element = `<div class="swiper-slide">
                    <img loading="lazy" data-src="${url}" alt="media content" class="media-lazy"/>
                </div>`;
                break;
            case 'video':
                element = `<div class="swiper-slide">
                    <video controls data-src="${url}" class="media-lazy">
                        <source type="video/${url.split('.').pop()}">
                    </video>
                </div>`;
                break;
            case 'audio':
                element = `<div class="swiper-slide">
                    <audio controls data-src="${url}" class="media-lazy">
                        <source type="audio/${url.split('.').pop()}">
                    </audio>
                </div>`;
                break;
            default:
                element = `<div class="swiper-slide">
                    <div class="unsupported-media">Unsupported media type</div>
                </div>`;
        }
        return element;
    }

    createSlider() {
        const container = document.getElementById(this.containerId);
        const sliderHTML = `
            <div class="swiper">
                <div class="swiper-wrapper">
                    ${this.mediaUrls.map(url => this.createMediaElement(url)).join('')}
                </div>
                <div class="swiper-pagination"></div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
            </div>`;
        
        container.innerHTML = sliderHTML;

        // Start observing lazy elements
        document.querySelectorAll('.media-lazy').forEach(element => {
            this.observer.observe(element);
        });
    }

    detectMediaType(url) {
        const extension = url.split('.').pop().toLowerCase();
        const mediaTypes = {
            'jpg': 'image', 'jpeg': 'image', 'png': 'image',
            'gif': 'image', 'webp': 'image', 'avif': 'image',
            'mp3': 'audio', 'm4a': 'audio', 'wav': 'audio',
            'ogg': 'audio', 'mp4': 'video', 'webm': 'video',
            'ogv': 'video'
        };
        return mediaTypes[extension] || 'unknown';
    }

    injectStyles() {
        const styles = `
            .swiper { width: 100%; height: 100%; }
            .swiper-slide { 
                display: flex; 
                justify-content: center; 
                align-items: center; 
            }
            .swiper-slide img, 
            .swiper-slide video, 
            .swiper-slide audio { 
                max-width: 100%; 
                height: auto; 
            }
        `;
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
}