document.addEventListener('DOMContentLoaded', function () {
    // DOM elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const courseList = document.getElementById('course-list');
    const routineTable = document.getElementById('routine-table');
    const clearRoutineButton = document.getElementById('clear-routine');
    const saveRoutineButton = document.getElementById('save-routine');
    const notification = document.getElementById('notification');
    const courseCountElement = document.getElementById('course-count');

    // Store selected courses
    let selectedCourses = [];
    
    // Initialize
    displayCourses(courseData.slice(0, 20)); // Show first 20 courses initially
    updateCourseCount(20, courseData.length);

    // Event listeners
    searchInput.addEventListener('input', handleSearch);
    searchButton.addEventListener('click', handleSearch);
    clearRoutineButton.addEventListener('click', clearRoutine);
    saveRoutineButton.addEventListener('click', saveRoutine);
    
    // Handle search on Enter key
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Search function
    function handleSearch() {
        const query = searchInput.value.trim();
        
        if (query === '') {
            displayCourses(courseData.slice(0, 20)); // Show first 20 courses if empty query
            updateCourseCount(20, courseData.length);
            return;
        }
        
        const results = searchCourses(query);
        displayCourses(results);
        updateCourseCount(results.length, courseData.length);
        
        // Highlight search terms in results
        highlightSearchTerms(query);
    }
    
    // Update course count display
    function updateCourseCount(count, total) {
        courseCountElement.textContent = `(${count} of ${total})`;
    }
    
    // Highlight search terms in the course list
    function highlightSearchTerms(query) {
        if (!query) return;
        
        const terms = query.toLowerCase().split(' ').filter(term => term.length > 0);
        if (terms.length === 0) return;
        
        const courseItems = courseList.querySelectorAll('.course-item');
        
        courseItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            let shouldHighlight = false;
            
            terms.forEach(term => {
                if (text.includes(term)) {
                    shouldHighlight = true;
                }
            });
            
            if (shouldHighlight) {
                item.classList.add('highlight');
            } else {
                item.classList.remove('highlight');
            }
        });
    }

    // Display courses in the list
    function displayCourses(courses) {
        courseList.innerHTML = '';

        if (courses.length === 0) {
            courseList.innerHTML = '<p class="no-results">No courses found. Try different search terms.</p>';
            return;
        }

        courses.forEach(course => {
            const courseItem = document.createElement('div');
            courseItem.className = 'course-item';
            courseItem.dataset.course = JSON.stringify(course);

            const scheduleInfo = parseSchedule(course.schedule);

            courseItem.innerHTML = `
                <h3>${course.course_code_section}</h3>
                <p><strong>Faculty:</strong> ${course.faculty_name}</p>
                <div class="course-schedule">
                    <i class="fas fa-calendar"></i> ${scheduleInfo.days.join(', ')} 
                    <br><i class="fas fa-clock"></i> ${scheduleInfo.timeRange}
                </div>
                <p><strong>Room:</strong> ${course.room}</p>
                <p><strong>Seats:</strong> ${course.available_seats}</p>
            `;

            courseItem.addEventListener('click', function () {
                selectCourse(course);
            });

            courseList.appendChild(courseItem);
        });
    }

    // Parse schedule string into days and time range
    function parseSchedule(scheduleStr) {
        const dayMap = {
            'S': 'Sunday',
            'M': 'Monday',
            'T': 'Tuesday',
            'W': 'Wednesday',
            'R': 'Thursday',
            'A': 'Saturday'
        };

        const parts = scheduleStr.split(' ');
        const dayPart = parts[0];
        const timePart = parts.slice(1).join(' ');
        
        const days = [];
        for (let i = 0; i < dayPart.length; i++) {
            const day = dayMap[dayPart[i]];
            if (day) days.push(day);
        }

        return {
            days: days,
            timeRange: timePart
        };
    }

    // Get time slot index for routine table
    function getTimeSlotIndex(timeRange) {
        const timeSlots = [
            "08:00 AM - 09:30 AM",
            "09:40 AM - 11:10 AM",
            "11:20 AM - 12:50 PM",
            "01:00 PM - 02:30 PM",
            "02:40 PM - 04:10 PM",
            "04:20 PM - 05:50 PM",
            "06:00 PM - 07:30 PM"
        ];

        return timeSlots.indexOf(timeRange);
    }

    // Select a course and add to routine
    function selectCourse(course) {
        const scheduleInfo = parseSchedule(course.schedule);

        // Check for time conflicts
        for (const day of scheduleInfo.days) {
            const existingCourse = selectedCourses.find(c => {
                const cSchedule = parseSchedule(c.schedule);
                return cSchedule.days.includes(day) && cSchedule.timeRange === scheduleInfo.timeRange;
            });

            if (existingCourse) {
                showNotification(`Time conflict with ${existingCourse.course_code_section}`, true);
                return;
            }
        }

        // Add to selected courses
        selectedCourses.push(course);

        // Update routine table
        updateRoutineTable();

        showNotification(`Added ${course.course_code_section} to routine`);
    }

    // Update the routine table with selected courses
    function updateRoutineTable() {
        // Clear all cells first
        const cells = routineTable.querySelectorAll('td[data-day]');
        cells.forEach(cell => {
            cell.innerHTML = '';
            cell.classList.remove('filled');
        });

        // Add selected courses to table
        selectedCourses.forEach(course => {
            const scheduleInfo = parseSchedule(course.schedule);
            const timeSlotIndex = getTimeSlotIndex(scheduleInfo.timeRange);

            if (timeSlotIndex === -1) return;

            scheduleInfo.days.forEach(day => {
                const cell = routineTable.querySelector(`td[data-day="${day}"][data-time="${scheduleInfo.timeRange}"]`);
                if (cell) {
                    cell.innerHTML = `
                        <div class="course-cell">
                            <div class="course-code">${course.course_code_section}</div>
                            <div class="faculty">${course.faculty_name}</div>
                            <div class="room">${course.room}</div>
                        </div>
                    `;
                    cell.classList.add('filled');

                    // Add click event to remove course
                    cell.addEventListener('click', function () {
                        removeCourse(course);
                    });
                }
            });
        });
    }

    // Remove a course from the routine
    function removeCourse(course) {
        const index = selectedCourses.findIndex(c => c.course_code_section === course.course_code_section);
        if (index !== -1) {
            selectedCourses.splice(index, 1);
            updateRoutineTable();
            showNotification(`Removed ${course.course_code_section} from routine`);
        }
    }

    // Clear the entire routine
    function clearRoutine() {
        if (selectedCourses.length === 0) return;
        
        selectedCourses = [];
        updateRoutineTable();
        showNotification('Routine cleared');
    }

    // Save the routine (placeholder function)
    function saveRoutine() {
        if (selectedCourses.length === 0) {
            showNotification('No courses to save', true);
            return;
        }
        
        // Create a simple text representation of the routine
        let routineText = 'My Course Routine\n\n';
        selectedCourses.forEach(course => {
            routineText += `${course.course_code_section} - ${course.faculty_name}\n`;
            routineText += `${course.schedule}, Room: ${course.room}\n\n`;
        });
        
        // Create a blob and download link
        const blob = new Blob([routineText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my_routine.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Routine saved');
    }

    // Show notification
    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.className = 'notification' + (isError ? ' error' : '');
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
});

// Enhanced search function in data.js
function searchCourses(query) {
    if (!query) return courseData.slice(0, 20);
    
    query = query.toLowerCase();
    const terms = query.split(' ').filter(term => term.length > 0);
    
    return courseData.filter(course => {
        // Check each search term against multiple fields
        return terms.every(term => 
            course.course_code_section.toLowerCase().includes(term) ||
            course.faculty_name.toLowerCase().includes(term) ||
            course.schedule.toLowerCase().includes(term) ||
            course.room.toLowerCase().includes(term)
        );
    });
}