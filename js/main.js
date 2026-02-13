document.querySelectorAll('nav a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const nav = document.querySelector('.main-nav');
            const navHeight = nav ? nav.offsetHeight : 0;
            window.scrollTo({
                top: target.offsetTop - navHeight - 10,
                behavior: 'smooth'
            });
        }
    });
});

const slider = document.querySelector('.news-slider-wrapper');
let isDown = false;
let startX;
let scrollLeft;

if (slider) {
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('active');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('active');
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active');
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
    });

    let touchStartX = 0;
    let touchScrollLeft = 0;

    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].pageX - slider.offsetLeft;
        touchScrollLeft = slider.scrollLeft;
    }, { passive: true });

    slider.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const x = e.touches[0].pageX - slider.offsetLeft;
        const walk = (x - touchStartX) * 2;
        slider.scrollLeft = touchScrollLeft - walk;
    }, { passive: false });
}

window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = scrolled + '%';
    }
});

const sections = document.querySelectorAll('.section');
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    sections.forEach((section) => observer.observe(section));
} else {
    sections.forEach((section) => {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
    });
}

window.showPubTab = function (event, tabName) {
    const allContents = document.querySelectorAll('.pub-content');
    allContents.forEach((content) => {
        content.classList.remove('active');
    });

    const allTabs = document.querySelectorAll('.pub-tab');
    allTabs.forEach((tab) => {
        tab.classList.remove('active');
    });

    const selectedContent = document.getElementById('pub-' + tabName);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }

    if (event && event.target) {
        event.target.classList.add('active');
    }
};

function populateFilteredPubs(filterType) {
    const allPubsList = document.querySelector('#pub-all .publication-list');
    if (!allPubsList) return;

    const allPubs = allPubsList.children;
    let targetList;

    if (filterType === 'first') {
        targetList = document.getElementById('first-author-list');
    } else if (filterType === 'supervised') {
        targetList = document.getElementById('supervised-list');
    } else if (filterType === 'coauthor') {
        targetList = document.getElementById('coauthor-list');
    }

    if (!targetList) return;

    targetList.innerHTML = '';
    let count = 0;

    const coAdvisedTitles = [
        'Visuo-Tactile Feedback with Hand Outline Styles for Modulating Affective Roughness Perception',
        'RealityCrafter: User-guided Editable 3D Scene Generation from a Single Image in Mixed Reality',
        'Human-Scene Interaction Data Generation with Virtual Environment using User-Centric Scene Graph',
        'Object cluster registration of dissimilar rooms using geometric spatial affordance graph to generate shared virtual spaces',
        'Spatial Affordance-Aware Affine Transformation Between Heterogeneous Spaces for Mixed Reality Remote Collaboration',
        'SceneLinker: Compositional 3D Scene Generation via Semantic Scene Graph from RGB Sequences',
        'Task Breakpoint Generation using Origin-Centric Graph in Virtual Reality Recordings for Adaptive Playback',
        'Int3DNet: Scene-Motion Cross Attention Network for 3D Intention Prediction in Mixed Reality'
    ];

    Array.from(allPubs).forEach((pub) => {
        const authors = pub.querySelector('.pub-authors');
        const title = pub.querySelector('.pub-title');
        if (!authors) return;

        const authorText = authors.textContent;
        const titleText = title
            ? title.textContent
                .replace(/\s+/g, ' ')
                .replace(/[–—]/g, '-')
                .replace('🏆 ', '')
                .replace('🏅 ', '')
                .trim()
            : '';
        if (!authorText.includes('Dooyoung Kim')) return;

        const authorList = authorText
            .split(/,|\sand\s/)
            .map((a) => a.trim())
            .filter((a) => a.length > 0);

        if (authorList.length === 0) return;

        const firstAuthor = authorList[0];
        const lastAuthor = authorList[authorList.length - 1];
        const isFirst = firstAuthor.includes('Dooyoung Kim');
        const isLast = lastAuthor.includes('Dooyoung Kim');
        const isMiddle = !isFirst && !isLast && authorText.includes('Dooyoung Kim');
        const isCoAdvised = coAdvisedTitles.some((t) => titleText.includes(t));

        if (
            (filterType === 'first' && isFirst) ||
            (filterType === 'supervised' && isCoAdvised) ||
            (filterType === 'coauthor' && isMiddle && !isCoAdvised)
        ) {
            targetList.appendChild(pub.cloneNode(true));
            count++;
        }
    });

    if (count === 0) {
        targetList.innerHTML = '<li style="padding: 20px; text-align: center; color: #888;">No publications in this category.</li>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    populateFilteredPubs('first');
    populateFilteredPubs('supervised');
    populateFilteredPubs('coauthor');
});
