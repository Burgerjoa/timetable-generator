// 강의 데이터 로드
fetch('./data/courses.json')
    .then(response => response.json())
    .then(data => initializeApp(data.courses));

function initializeApp(courses) {
    // 강의 목록 렌더링
    const courseList = document.getElementById('courseList');
    courses.forEach(course => {
        const card = document.createElement('div');
        card.className = 'course-card';
        card.innerHTML = `
      <h3>${course.name}</h3>
      <p>코드: ${course.code}</p>
      <div class="schedules">${renderSchedules(course.schedules)}</div>
    `;
        card.onclick = () => toggleCourseSelection(course);
        courseList.appendChild(card);
    });
}

// 시간표 생성 함수
function generateTimetables() {
    const selected = getSelectedCourses();
    const results = calculateCombinations(selected);
    renderTimetables(results);
}