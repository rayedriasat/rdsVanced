document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const courseList = document.getElementById('course-list');
    const courseCount = document.getElementById('course-count');
    const routineTable = document.getElementById('routine-table');
    const saveRoutineButton = document.getElementById('save-routine');
    const clearRoutineButton = document.getElementById('clear-routine');
    const notification = document.getElementById('notification');
    const themeToggle = document.getElementById('theme-toggle');
    
    // State variables
    let selectedCourse = null;
    let savedCourses = {};
    
    // Wait for course data to be loaded
    document.addEventListener('courseDataLoaded', function() {
        // Initialize the page once data is loaded
        init();
    });
    
    // If data is already loaded (in case the event was fired before we set up the listener)
    if (courseData && courseData.length > 0) {
        init();
    }
    
    function init() {
        // Load all courses initially
        const courses = getAllCourses();
        displayCourses(courses);
        updateCourseCount(courses.length);
        
        // Add event listeners
        searchButton.addEventListener('click', handleSearch);
        
        // Make search responsive on every keypress
        searchInput.addEventListener('input', function() {
            handleSearch();
        });
        
        // Add event listener for Enter key press
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handleSearch();
            }
        });
        
        saveRoutineButton.addEventListener('click', saveRoutine);
        clearRoutineButton.addEventListener('click', clearRoutine);
        
        // Theme toggle functionality
        themeToggle.addEventListener('click', toggleTheme);
        
        // Load saved theme preference
        loadThemePreference();
        
        // Load saved routine data from localStorage
        loadRoutineFromStorage();
    }

    function handleSearch() {
        const query = searchInput.value.trim();

        if (query === '') {
            const courses = getAllCourses();
            displayCourses(courses);
            updateCourseCount(courses.length);
        } else {
            const courses = searchCourses(query);
            displayCourses(courses);
            updateCourseCount(courses.length);
        }
    }

    function updateCourseCount(count) {
        courseCount.textContent = `(${count})`;
    }

    function displayCourses(courses) {
        courseList.innerHTML = '';

        if (courses.length === 0) {
            courseList.innerHTML = '<p class="no-courses">No courses found.</p>';
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
                    <i class="fas fa-calendar-alt"></i> ${scheduleInfo.days.join(', ')} 
                    <br>${scheduleInfo.timeRange}
                </div>
            `;

            courseItem.addEventListener('click', function () {
                selectCourse(course);
            });

            courseList.appendChild(courseItem);
        });
    }

    function parseSchedule(scheduleStr) {
        const parts = scheduleStr.split(' ');
        const days = parts[0];
        const timeRange = parts.slice(1).join(' ');

        // Map day codes to actual days
        const dayMap = {
            'S': 'Sunday',
            'M': 'Monday',
            'T': 'Tuesday',
            'W': 'Wednesday',
            'R': 'Thursday',
            'F': 'Friday',
            'A': 'Saturday'
        };

        const daysList = [];
        for (let i = 0; i < days.length; i++) {
            const dayCode = days[i];
            if (dayMap[dayCode]) {
                daysList.push(dayMap[dayCode]);
            }
        }

        // Parse time range
        const timeMatch = timeRange.match(/(\d+:\d+ [AP]M) - (\d+:\d+ [AP]M)/);
        let startTime = '';
        let endTime = '';

        if (timeMatch) {
            startTime = timeMatch[1];
            endTime = timeMatch[2];
        }

        // Calculate all time slots this course spans
        const timeSlots = getTimeSlotsBetween(startTime, endTime);

        return {
            days: daysList,
            startTime: startTime,
            endTime: endTime,
            timeRange: timeRange,
            timeSlots: timeSlots
        };
    }

    // Function to get all time slots between start and end times
    function getTimeSlotsBetween(startTime, endTime) {
        const timeSlots = [
            '08:00 AM - 09:30 AM',
            '09:40 AM - 11:10 AM',
            '11:20 AM - 12:50 PM',
            '01:00 PM - 02:30 PM',
            '02:40 PM - 04:10 PM',
            '04:20 PM - 05:50 PM',
            '06:00 PM - 07:30 PM'
        ];

        // Convert times to comparable format (minutes since midnight)
        function timeToMinutes(timeStr) {
            const [time, period] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);

            if (period === 'PM' && hours !== 12) {
                hours += 12;
            } else if (period === 'AM' && hours === 12) {
                hours = 0;
            }

            return hours * 60 + minutes;
        }

        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);

        // Find all slots that overlap with the course time
        return timeSlots.filter(slot => {
            const [slotStart, slotEnd] = slot.split(' - ');
            const slotStartMinutes = timeToMinutes(slotStart);
            const slotEndMinutes = timeToMinutes(slotEnd);

            // Check if there's any overlap
            return (
                (startMinutes <= slotStartMinutes && endMinutes > slotStartMinutes) || // Course starts before slot and ends during/after
                (startMinutes >= slotStartMinutes && startMinutes < slotEndMinutes) // Course starts during the slot
            );
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
            // For each time slot this course spans
            scheduleInfo.timeSlots.forEach(timeSlot => {
                const cell = document.querySelector(`td[data-day="${day}"][data-time="${timeSlot}"]`);

                if (cell) {
                    // Check if there's already a saved course in this slot
                    if (cell.dataset.saved === 'true') {
                        const existingCourse = JSON.parse(cell.dataset.course);
                        cell.classList.add('conflict');
                        hasConflict = true;

                        showNotification(`Conflict with ${existingCourse.course_code_section} at ${day} ${timeSlot}`);
                    } else {
                        // Display the course as temporary
                        cell.innerHTML = `
                            <div class="course-cell temporary">
                                <strong>${course.course_code_section}</strong><br>
                                ${course.faculty_name}
                            </div>
                        `;
                        cell.dataset.course = JSON.stringify(course);
                        cell.dataset.temporary = 'true';

                        // If this is a multi-slot course, add a special class
                        if (scheduleInfo.timeSlots.length > 1) {
                            cell.classList.add('multi-slot');
                        }
                    }
                }
            });
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

        // Check for conflicts across all time slots
        scheduleInfo.days.forEach(day => {
            scheduleInfo.timeSlots.forEach(timeSlot => {
                const cell = document.querySelector(`td[data-day="${day}"][data-time="${timeSlot}"]`);

                if (cell && cell.dataset.saved === 'true') {
                    hasConflict = true;
                }
            });
        });

        if (hasConflict) {
            // Ask for confirmation to replace existing course
            if (confirm('There is a conflict with an existing course. Do you want to replace it?')) {
                // Remove the conflicting course from savedCourses
                scheduleInfo.days.forEach(day => {
                    scheduleInfo.timeSlots.forEach(timeSlot => {
                        const key = `${day}-${timeSlot}`;
                        delete savedCourses[key];
                    });
                });
            } else {
                clearTemporarySelections();
                return;
            }
        }

        // Save the course across all time slots
        scheduleInfo.days.forEach(day => {
            scheduleInfo.timeSlots.forEach(timeSlot => {
                const cell = document.querySelector(`td[data-day="${day}"][data-time="${timeSlot}"]`);

                if (cell) {
                    // Clear any existing content and classes
                    cell.innerHTML = '';
                    cell.className = '';

                    // Add the saved course
                    cell.innerHTML = `
                        <div class="course-cell saved">
                            <strong>${selectedCourse.course_code_section}</strong><br>
                            ${selectedCourse.faculty_name}
                        </div>
                    `;
                    cell.dataset.course = JSON.stringify(selectedCourse);
                    cell.dataset.saved = 'true';
                    cell.dataset.temporary = 'false';

                    // If this is a multi-slot course, add a special class
                    if (scheduleInfo.timeSlots.length > 1) {
                        cell.classList.add('multi-slot');
                    }

                    // Add to saved courses
                    const key = `${day}-${timeSlot}`;
                    savedCourses[key] = selectedCourse;
                }
            });
        });

        // Clear the selection
        selectedCourse = null;

        // Save to localStorage
        saveRoutineToStorage();

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
            
            // Clear localStorage
            localStorage.removeItem('savedRoutine');
            
            showNotification('Routine cleared!', 'success');
        }
    }

    // Function to save routine data to localStorage
    function saveRoutineToStorage() {
        try {
            localStorage.setItem('savedRoutine', JSON.stringify(savedCourses));
        } catch (error) {
            console.error('Error saving routine to localStorage:', error);
            showNotification('Failed to save routine data. Your browser storage might be full.', 'error');
        }
    }
    
    // Function to load routine data from localStorage
    function loadRoutineFromStorage() {
        try {
            const savedRoutineData = localStorage.getItem('savedRoutine');
            
            if (savedRoutineData) {
                savedCourses = JSON.parse(savedRoutineData);
                
                // Display saved courses in the routine table
                Object.entries(savedCourses).forEach(([key, course]) => {
                    const [day, timeSlot] = key.split('-');
                    const cell = document.querySelector(`td[data-day="${day}"][data-time="${timeSlot}"]`);
                    
                    if (cell) {
                        const scheduleInfo = parseSchedule(course.schedule);
                        
                        cell.innerHTML = `
                            <div class="course-cell saved">
                                <strong>${course.course_code_section}</strong><br>
                                ${course.faculty_name}
                            </div>
                        `;
                        cell.dataset.course = JSON.stringify(course);
                        cell.dataset.saved = 'true';
                        
                        // If this is a multi-slot course, add a special class
                        if (scheduleInfo.timeSlots.length > 1) {
                            cell.classList.add('multi-slot');
                        }
                    }
                });
                
                showNotification('Routine loaded from saved data!', 'info');
            }
        } catch (error) {
            console.error('Error loading routine from localStorage:', error);
            showNotification('Failed to load saved routine data.', 'error');
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
            notification.style.backgroundColor = 'var(--notification-success)';
        } else if (type === 'info') {
            notification.style.backgroundColor = 'var(--notification-info)';
        } else {
            notification.style.backgroundColor = 'var(--notification-error)';
        }

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Theme toggle functionality
    function toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        // Update icon first for better perceived performance
        const icon = themeToggle.querySelector('i');
        if (newTheme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }

        // Use requestAnimationFrame to apply theme change on next frame
        requestAnimationFrame(() => {
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    function loadThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);

            // Update icon based on current theme
            const icon = themeToggle.querySelector('i');
            if (savedTheme === 'dark') {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        }
    }
});