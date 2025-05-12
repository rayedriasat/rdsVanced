document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const courseList = document.getElementById('course-list');
    const routineTable = document.getElementById('routine-table');
    const saveRoutineButton = document.getElementById('save-routine');
    const clearRoutineButton = document.getElementById('clear-routine');
    const notification = document.getElementById('notification');
    
    // State variables
    let selectedCourse = null;
    let savedCourses = {};
    
    // Initialize the page
    init();
    
    function init() {
        // Load all courses initially
        displayCourses(getAllCourses());
        
        // Add event listeners
        searchButton.addEventListener('click', handleSearch);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
        
        saveRoutineButton.addEventListener('click', saveRoutine);
        clearRoutineButton.addEventListener('click', clearRoutine);
    }
    
    function handleSearch() {
        const query = searchInput.value.trim();
        if (query === '') {
            displayCourses(getAllCourses());
        } else {
            displayCourses(searchCourses(query));
        }
    }
    
    function displayCourses(courses) {
        courseList.innerHTML = '';
        
        if (courses.length === 0) {
            courseList.innerHTML = '<p>No courses found.</p>';
            return;
        }
        
        courses.forEach(course => {
            const courseItem = document.createElement('div');
            courseItem.className = 'course-item';
            courseItem.dataset.course = JSON.stringify(course);
            
            const scheduleInfo = parseSchedule(course.schedule);
            
            courseItem.innerHTML = `
                <h3>${course.course_code_section}</h3>
                <p>${course.title}</p>
                <p><strong>Faculty:</strong> ${course.faculty_name}</p>
                <p><strong>Schedule:</strong> ${course.schedule}</p>
            `;
            
            courseItem.addEventListener('click', function() {
                selectCourse(course);
            });
            
            courseList.appendChild(courseItem);
        });
    }
    
    function selectCourse(course) {
        // Clear previous temporary selections
        clearTemporarySelections();
        
        selectedCourse = course;
        const scheduleInfo = parseSchedule(course.schedule);
        
        // Check for conflicts and display the course in the routine
        let hasConflict = false;
        
        scheduleInfo.days.forEach(day => {
            const cell = document.querySelector(`td[data-day="${day}"][data-time="${scheduleInfo.timeRange}"]`);
            
            if (cell) {
                // Check if there's already a saved course in this slot
                if (cell.dataset.saved === 'true') {
                    const existingCourse = JSON.parse(cell.dataset.course);
                    cell.classList.add('conflict');
                    hasConflict = true;
                    
                    showNotification(`Conflict with ${existingCourse.course_code_section} at ${day} ${scheduleInfo.timeRange}`);
                } else {
                    // Display the course as temporary
                    cell.innerHTML = `
                        <div class="course-cell temporary">
                            <strong>${course.course_code_section}</strong><br>
                            ${course.title}
                        </div>
                    `;
                    cell.dataset.course = JSON.stringify(course);
                    cell.dataset.temporary = 'true';
                }
            }
        });
        
        return !hasConflict;
    }
    
    function saveRoutine() {
        if (!selectedCourse) {
            showNotification('No course selected to save.');
            return;
        }
        
        const scheduleInfo = parseSchedule(selectedCourse.schedule);
        let hasConflict = false;
        
        // Check for conflicts
        scheduleInfo.days.forEach(day => {
            const cell = document.querySelector(`td[data-day="${day}"][data-time="${scheduleInfo.timeRange}"]`);
            
            if (cell && cell.dataset.saved === 'true') {
                hasConflict = true;
            }
        });
        
        if (hasConflict) {
            // Ask for confirmation to replace existing course
            if (confirm('There is a conflict with an existing course. Do you want to replace it?')) {
                // Remove the conflicting course from savedCourses
                scheduleInfo.days.forEach(day => {
                    const key = `${day}-${scheduleInfo.timeRange}`;
                    delete savedCourses[key];
                });
            } else {
                clearTemporarySelections();
                return;
            }
        }
        
        // Save the course
        scheduleInfo.days.forEach(day => {
            const cell = document.querySelector(`td[data-day="${day}"][data-time="${scheduleInfo.timeRange}"]`);
            
            if (cell) {
                // Clear any existing content and classes
                cell.innerHTML = '';
                cell.className = '';
                
                // Add the saved course
                cell.innerHTML = `
                    <div class="course-cell saved">
                        <strong>${selectedCourse.course_code_section}</strong><br>
                        ${selectedCourse.title}
                    </div>
                `;
                cell.dataset.course = JSON.stringify(selectedCourse);
                cell.dataset.saved = 'true';
                cell.dataset.temporary = 'false';
                
                // Add to saved courses
                const key = `${day}-${scheduleInfo.timeRange}`;
                savedCourses[key] = selectedCourse;
            }
        });
        
        // Clear the selection
        selectedCourse = null;
        
        showNotification('Course saved to routine!', 'success');
    }
    
    function clearRoutine() {
        if (confirm('Are you sure you want to clear the entire routine?')) {
            const cells = document.querySelectorAll('td[data-day]');
            cells.forEach(cell => {
                cell.innerHTML = '';
                cell.className = '';
                delete cell.dataset.course;
                delete cell.dataset.saved;
                delete cell.dataset.temporary;
            });
            
            savedCourses = {};
            selectedCourse = null;
            
            showNotification('Routine cleared!', 'success');
        }
    }
    
    function clearTemporarySelections() {
        const temporaryCells = document.querySelectorAll('td[data-temporary="true"]');
        temporaryCells.forEach(cell => {
            cell.innerHTML = '';
            cell.className = '';
            delete cell.dataset.course;
            delete cell.dataset.temporary;
        });
        
        // Also clear any conflict highlights
        const conflictCells = document.querySelectorAll('.conflict');
        conflictCells.forEach(cell => {
            cell.classList.remove('conflict');
        });
    }
    
    function showNotification(message, type = 'error') {
        notification.textContent = message;
        notification.style.display = 'block';
        
        if (type === 'success') {
            notification.style.backgroundColor = '#2ecc71';
        } else {
            notification.style.backgroundColor = '#e74c3c';
        }
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
});