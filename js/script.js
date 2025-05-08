// 프로젝트 아이템 토글 기능
document.addEventListener('DOMContentLoaded', () => { // DOM 로드 후 스크립트 실행 보장
    const projectItems = document.querySelectorAll('.project-item');

    projectItems.forEach(item => {
        // 프로젝트 헤더 부분을 클릭 가능하도록 함
        const header = item.querySelector('.project-header');
        // project-meta-header도 클릭 영역에 포함시키고 싶다면 item 자체에 이벤트를 다는 것도 고려
        header.addEventListener('click', () => {
            // 클릭된 아이템에 'active' 클래스를 토글 (추가/제거)
            item.classList.toggle('active');

            // 토글 시 상세 내용의 표시 상태를 제어
            const details = item.querySelector('.project-details');

            // CSS transition을 사용하면 더 부드러운 애니메이션 가능
            // 여기서는 간단히 display 속성만 변경
            if (item.classList.contains('active')) {
                details.style.display = 'block'; // 활성화되면 보여줌
                // height 애니메이션을 사용하려면 details.style.height = 'auto'; 등 설정 필요 (CSS와 연동)
            } else {
                details.style.display = 'none'; // 비활성화되면 숨김
                // height 애니메이션을 사용하려면 details.style.height = '0'; 등 설정 필요 (CSS와 연동)
            }
        });
    });

    // 네비게이션 메뉴 클릭 시 부드러운 스크롤
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // 기본 앵커 동작 방지

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // 헤더/네비게이션 바 높이를 고려하여 스크롤 위치 조정
                // 실제 높이에 맞게 조정해야 합니다.
                 const headerHeight = document.querySelector('header').offsetHeight;
                 const navHeight = document.querySelector('nav').offsetHeight;
                 const offset = headerHeight + navHeight + 20; // 헤더, 네비 높이 + 여백 조정

                window.scrollTo({
                    top: targetElement.offsetTop - offset,
                    behavior: 'smooth' // 부드러운 스크롤 적용
                });
            }
        });
    });
});