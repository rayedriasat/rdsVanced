// Global test functions
window.testSimpleExport = function() {
    console.log("Global simple export function called");
    try {
        // Create a very simple export with minimal HTML
        const win = window.open('', '_blank');
        console.log("SIMPLE EXPORT: Window opened:", !!win);
        
        if (!win) {
            console.error("SIMPLE EXPORT: Failed to open window - likely popup blocked");
            alert("Pop-up blocked. Please allow pop-ups and try again.");
            return;
        }
        
        // Create a very basic HTML with just a message
        win.document.write(`
            <html>
            <head>
                <title>Test Export</title>
            </head>
            <body>
                <h1>Test Export Worked!</h1>
                <p>This is a test export window. If you can see this, the export function is working.</p>
                <button onclick="window.close()">Close</button>
            </body>
            </html>
        `);
        
        win.document.close();
        console.log("SIMPLE EXPORT: Document written and closed");
        
        alert("Test export opened in new tab");
    } catch (error) {
        console.error("SIMPLE EXPORT: Error occurred:", error);
        alert("Export failed. Error: " + error.message);
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const courseList = document.getElementById('course-list');
    const courseCount = document.getElementById('course-count');
    const routineTable = document.getElementById('routine-table');
    const clearRoutineButton = document.getElementById('clear-routine');
    const exportRoutineButton = document.getElementById('export-routine');
    const notification = document.getElementById('notification');
    const themeToggle = document.getElementById('theme-toggle');
    
    // State variables
    let selectedCourse = null;
    let savedCourses = {};
    
    console.log("DOM Content Loaded - Initializing application");
    
    // Expose the export function globally for testing
    window.testExport = function() {
        console.log("Manual export function called - will try simple export first");
        
        // First try the simple export to test popup blocking
        if (confirm("Try simple export first?")) {
            simpleExportRoutine();
        } else {
            exportRoutineAsImage();
        }
    };
    
    // Wait for course data to be loaded
    document.addEventListener('courseDataLoaded', function() {
        console.log("Course data loaded event received");
        // Initialize the page once data is loaded
        init();
    });
    
    // If data is already loaded (in case the event was fired before we set up the listener)
    if (courseData && courseData.length > 0) {
        console.log("Course data already available, initializing immediately");
        init();
    }
    
    function init() {
        console.log("Initializing application");
        
        // Test localStorage functionality
        try {
            localStorage.setItem('test', 'test');
            if (localStorage.getItem('test') !== 'test') {
                console.error("localStorage test failed - values don't match");
                showNotification('Warning: localStorage may not be working correctly', 'error');
            } else {
                console.log("localStorage is working correctly");
            }
            localStorage.removeItem('test');
        } catch (e) {
            console.error("localStorage test failed:", e);
            showNotification('Warning: localStorage is not available. Your selections will not be saved between sessions.', 'error');
        }
        
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
        
        clearRoutineButton.addEventListener('click', clearRoutine);
        
        // Verify export button exists
        console.log("Export button exists:", !!exportRoutineButton);
        
        // Add event listener for Export Routine button with direct function binding
        if (exportRoutineButton) {
            exportRoutineButton.onclick = function() {
                console.log("Export button clicked");
                exportRoutineAsImage();
            };
            console.log("Export button click handler set");
        } else {
            console.error("Export button not found in the DOM!");
        }
        
        // Theme toggle functionality
        themeToggle.addEventListener('click', toggleTheme);
        
        // Load saved theme preference
        loadThemePreference();
        
        // Load saved routine data from localStorage
        loadRoutineFromStorage();
        
        console.log("Initialization complete");
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
        console.log("Selecting course:", course.course_code_section);
    
        // Clear only temporary selections, not saved ones
        clearTemporarySelections();

        const scheduleInfo = parseSchedule(course.schedule);
        let conflictSlots = [];

        // First collect all conflict information
        scheduleInfo.days.forEach(day => {
            scheduleInfo.timeSlots.forEach(timeSlot => {
                const cell = document.querySelector(`td[data-day="${day}"][data-time="${timeSlot}"]`);
                
                if (cell && cell.dataset.saved === 'true') {
                    const existingCourse = JSON.parse(cell.dataset.course);
                    cell.classList.add('conflict');
                    
                    conflictSlots.push({
                        day: day,
                        timeSlot: timeSlot,
                        course: existingCourse
                    });
                    
                    console.log(`Conflict detected: ${existingCourse.course_code_section} at ${day} ${timeSlot}`);
                    showNotification(`Conflict with ${existingCourse.course_code_section} at ${day} ${timeSlot}`);
                }
            });
        });

        // Ask for confirmation only if there are conflicts
        if (conflictSlots.length > 0) {
            console.log("Conflicts found:", conflictSlots.length);
            
            if (confirm('There is a conflict with an existing course. Do you want to replace it?')) {
                console.log("User confirmed to replace conflicting courses");
                
                // Only remove the conflicting courses from savedCourses
                conflictSlots.forEach(slot => {
                    const key = `${slot.day}-${slot.timeSlot}`;
                    console.log(`Removing conflict at ${key}`);
                    
                    delete savedCourses[key];
                    
                    // Clear the conflicting cell
                    const conflictCell = document.querySelector(`td[data-day="${slot.day}"][data-time="${slot.timeSlot}"]`);
                    if (conflictCell) {
                        conflictCell.innerHTML = '';
                        conflictCell.className = '';
                        delete conflictCell.dataset.course;
                        delete conflictCell.dataset.saved;
                    }
                });
            } else {
                console.log("User canceled replacing conflicting courses");
                
                // User decided not to replace, clear conflict highlights
                conflictSlots.forEach(slot => {
                    const conflictCell = document.querySelector(`td[data-day="${slot.day}"][data-time="${slot.timeSlot}"]`);
                    if (conflictCell) {
                        conflictCell.classList.remove('conflict');
                    }
                });
                return;
            }
        } else {
            console.log("No conflicts found, proceeding with selection");
        }

        // Count of cells where course will be added
        let cellsUpdated = 0;
        
        // Save the course across all time slots
        scheduleInfo.days.forEach(day => {
            scheduleInfo.timeSlots.forEach(timeSlot => {
                const cell = document.querySelector(`td[data-day="${day}"][data-time="${timeSlot}"]`);

                if (cell) {
                    // Clear any existing content and classes but maintain data-saved attribute
                    cell.innerHTML = '';
                    cell.className = '';

                    // Add the course cell with remove button
                    cell.innerHTML = `
                        <div class="course-cell saved">
                            <div class="remove-course"><i class="fas fa-times"></i></div>
                            <strong>${course.course_code_section}</strong><br>
                            ${course.faculty_name}
                        </div>
                    `;
                    
                    // Set the data attributes for the cell
                    cell.dataset.course = JSON.stringify(course);
                    cell.dataset.saved = 'true';
                    cell.dataset.temporary = 'false';

                    // If this is a multi-slot course, add a special class
                    if (scheduleInfo.timeSlots.length > 1) {
                        cell.classList.add('multi-slot');
                    }

                    // Add to saved courses in our local object
                    const key = `${day}-${timeSlot}`;
                    savedCourses[key] = {...course}; // Create a new object copy
                    cellsUpdated++;
                    
                    // Add click event to the remove button
                    const removeBtn = cell.querySelector('.remove-course');
                    if (removeBtn) {
                        removeBtn.addEventListener('click', function(e) {
                            e.stopPropagation(); // Prevent event bubbling
                            removeCourse(day, timeSlot, course);
                        });
                    }
                }
            });
        });

        console.log(`Course ${course.course_code_section} added to ${cellsUpdated} cells`);
        
        // Save to localStorage immediately after all updates
        // This ensures that the courses are saved even if the browser is closed
        saveRoutineToStorage();
        
        showNotification('Course added to routine!', 'success');
        return conflictSlots.length === 0; // Return whether there were conflicts
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
            console.log("Saving courses to localStorage. Course count:", Object.keys(savedCourses).length);
            
            if (Object.keys(savedCourses).length === 0) {
                console.log("No courses to save, clearing localStorage");
                localStorage.removeItem('savedRoutine');
                return;
            }
            
            // Convert course objects to strings to ensure they're properly serialized
            const saveData = {};
            Object.keys(savedCourses).forEach(key => {
                saveData[key] = savedCourses[key];
            });
            
            const dataToSave = JSON.stringify(saveData);
            console.log("Data being saved (length):", dataToSave.length);
            
            localStorage.setItem('savedRoutine', dataToSave);
            console.log("Courses saved successfully to localStorage");
            
            // Verify the save worked
            const savedData = localStorage.getItem('savedRoutine');
            if (!savedData) {
                console.error("Verification failed - no data retrieved after save");
            } else {
                console.log("Verification passed - data retrieved after save (length):", savedData.length);
            }
        } catch (error) {
            console.error('Error saving routine to localStorage:', error);
            showNotification('Failed to save routine data. Your browser storage might be full.', 'error');
        }
    }
    
    // Function to load routine data from localStorage
    function loadRoutineFromStorage() {
        try {
            const savedRoutineData = localStorage.getItem('savedRoutine');
            console.log("Loading from localStorage, data present:", !!savedRoutineData);
            
            if (savedRoutineData) {
                try {
                    savedCourses = JSON.parse(savedRoutineData);
                    console.log("Parsed saved courses. Course count:", Object.keys(savedCourses).length);
                    
                    // Display saved courses in the routine table
                    Object.entries(savedCourses).forEach(([key, course]) => {
                        const [day, timeSlot] = key.split('-');
                        const cell = document.querySelector(`td[data-day="${day}"][data-time="${timeSlot}"]`);
                        
                        if (cell) {
                            const scheduleInfo = parseSchedule(course.schedule);
                            
                            cell.innerHTML = `
                                <div class="course-cell saved">
                                    <div class="remove-course"><i class="fas fa-times"></i></div>
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
                            
                            // Add click event to the remove button
                            const removeBtn = cell.querySelector('.remove-course');
                            if (removeBtn) {
                                removeBtn.addEventListener('click', function(e) {
                                    e.stopPropagation(); // Prevent event bubbling
                                    removeCourse(day, timeSlot, course);
                                });
                            }
                        }
                    });
                    
                    showNotification('Routine loaded from saved data!', 'info');
                } catch (parseError) {
                    console.error('Error parsing saved routine data:', parseError);
                    showNotification('Failed to parse saved routine data.', 'error');
                    // Clear corrupt data
                    localStorage.removeItem('savedRoutine');
                    savedCourses = {};
                }
            } else {
                console.log("No saved routine data found in localStorage");
            }
        } catch (error) {
            console.error('Error loading routine from localStorage:', error);
            showNotification('Failed to load saved routine data.', 'error');
        }
    }

    function clearTemporarySelections() {
        // Only clear cells that are marked as temporary, not saved ones
        const temporaryCells = document.querySelectorAll('td[data-temporary="true"]:not([data-saved="true"])');
        temporaryCells.forEach(cell => {
            cell.innerHTML = '';
            cell.className = '';
            delete cell.dataset.course;
            delete cell.dataset.temporary;
        });

        // Also clear any conflict highlights but preserve the saved data
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

    function removeCourse(day, timeSlot, course) {
        console.log("Removing course:", course, "from day:", day, "timeSlot:", timeSlot);
        
        // Get all cells with this course
        const scheduleInfo = parseSchedule(course.schedule);
        
        // Remove course from all its time slots
        scheduleInfo.days.forEach(courseDay => {
            scheduleInfo.timeSlots.forEach(courseTimeSlot => {
                const key = `${courseDay}-${courseTimeSlot}`;
                // Remove from saved courses object
                if (savedCourses[key]) {
                    console.log("Deleting course from slot:", key);
                    delete savedCourses[key];
                }
                
                // Clear the cell in the UI
                const cell = document.querySelector(`td[data-day="${courseDay}"][data-time="${courseTimeSlot}"]`);
                if (cell) {
                    cell.innerHTML = '';
                    cell.className = '';
                    delete cell.dataset.course;
                    delete cell.dataset.saved;
                    delete cell.dataset.temporary;
                }
            });
        });
        
        // Save changes to localStorage
        saveRoutineToStorage();
        
        showNotification(`${course.course_code_section} removed from routine`, 'info');
    }

    // Function to export the routine table as an image
    function exportRoutineAsImage() {
        console.log("EXPORT: Function started");
        showNotification("Preparing your routine for export...", "info");
        
        try {
            console.log("EXPORT: Inside try block");
            
            // Get the routine table
            const routineTableElement = document.getElementById('routine-table');
            console.log("EXPORT: Got table element?", !!routineTableElement);
            
            if (!routineTableElement) {
                console.error("EXPORT: Routine table not found");
                showNotification("Routine table not found.", "error");
                return;
            }
            
            // Temporarily hide the remove buttons
            const removeButtons = document.querySelectorAll('.remove-course');
            console.log("EXPORT: Found remove buttons:", removeButtons.length);
            
            removeButtons.forEach(btn => {
                btn.style.display = 'none';
            });
            console.log("EXPORT: Hide remove buttons complete");
            
            // Create a clean copy of the table HTML
            const tableHTML = routineTableElement.outerHTML;
            console.log("EXPORT: Got table HTML length:", tableHTML.length);
            
            // Open a new window with print-friendly version
            console.log("EXPORT: About to open new window");
            const printWindow = window.open('', '_blank');
            console.log("EXPORT: Window opened?", !!printWindow);
            
            if (!printWindow) {
                console.error("EXPORT: Failed to open window - popup blocked?");
                showNotification("Pop-up blocked. Please allow pop-ups and try again.", "error");
                // Restore the remove buttons
                removeButtons.forEach(btn => {
                    btn.style.display = 'flex';
                });
                return;
            }
            
            // Write a complete HTML document with the table and styling
            console.log("EXPORT: Writing to the new window");
            try {
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>My Class Routine</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                padding: 20px;
                                background-color: #f8f9fa;
                            }
                            h1 {
                                text-align: center;
                                color: #3a0ca3;
                                margin-bottom: 20px;
                            }
                            .instructions {
                                text-align: center;
                                margin-bottom: 20px;
                                padding: 10px;
                                background-color: #e8f5e9;
                                border-radius: 5px;
                            }
                            .button-container {
                                text-align: center;
                                margin: 20px 0;
                            }
                            button {
                                padding: 10px 20px;
                                background-color: #4361ee;
                                color: white;
                                border: none;
                                border-radius: 5px;
                                cursor: pointer;
                                font-size: 16px;
                                margin: 0 10px;
                            }
                            button:hover {
                                background-color: #3a0ca3;
                            }
                            table {
                                border-collapse: collapse;
                                width: 100%;
                                margin: 0 auto;
                            }
                            th, td {
                                border: 1px solid #ddd;
                                padding: 8px;
                                text-align: center;
                            }
                            th {
                                background-color: #f1f3f9;
                                font-weight: bold;
                            }
                            th:first-child, td:first-child {
                                font-weight: bold;
                                background-color: #f1f3f9;
                            }
                            .course-cell {
                                background-color: #1e40af;
                                color: white;
                                padding: 5px;
                                border-radius: 3px;
                                display: inline-block;
                                width: 90%;
                                margin: 0 auto;
                            }
                            .course-cell strong {
                                display: block;
                                margin-bottom: 3px;
                                font-size: 14px;
                            }
                            @media print {
                                .no-print {
                                    display: none;
                                }
                                body {
                                    background-color: white;
                                    padding: 0;
                                }
                                button {
                                    display: none;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <h1>My Class Routine</h1>
                        <div class="instructions no-print">
                            <p>You can save this page as PDF or take a screenshot. Alternatively, you can print it.</p>
                        </div>
                        <div class="button-container no-print">
                            <button onclick="window.print()">Print Routine</button>
                            <button onclick="window.close()">Close Window</button>
                            <button onclick="saveAsJPG()">Save as JPG</button>
                        </div>
                        ${tableHTML}
                        
                        <script>
                            console.log("New window script loaded");
                            
                            function saveAsJPG() {
                                console.log("saveAsJPG function called");
                                try {
                                    // Try to use browser's screenshot API if available
                                    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
                                        console.log("Using screenshot API");
                                        navigator.mediaDevices.getDisplayMedia({video: true})
                                            .then(function(stream) {
                                                console.log("Got media stream");
                                                // Handle the stream...
                                                stream.getTracks().forEach(track => track.stop());
                                                alert("Please take a screenshot using your operating system's screenshot tool (PrtScn or Win+Shift+S on Windows, Cmd+Shift+3 on Mac)");
                                            })
                                            .catch(function(err) {
                                                console.error("Error capturing display:", err);
                                                alert("Please take a screenshot using your operating system's screenshot tool (PrtScn or Win+Shift+S on Windows, Cmd+Shift+3 on Mac)");
                                            });
                                    } else {
                                        console.log("Screenshot API not available");
                                        alert("Please take a screenshot using your operating system's screenshot tool (PrtScn or Win+Shift+S on Windows, Cmd+Shift+3 on Mac)");
                                    }
                                } catch(e) {
                                    console.error("Error in saveAsJPG:", e);
                                    alert("Please take a screenshot using your operating system's screenshot tool");
                                }
                            }
                        </script>
                    </body>
                    </html>
                `);
                console.log("EXPORT: Document written to new window");
                
                // Attempt to close the document to finalize it
                try {
                    printWindow.document.close();
                    console.log("EXPORT: Document closed");
                } catch (closeErr) {
                    console.error("EXPORT: Error closing document:", closeErr);
                }
            } catch (writeErr) {
                console.error("EXPORT: Error writing to window:", writeErr);
                showNotification("Error creating export. Please try again.", "error");
            }
            
            // Restore the remove buttons in the original window
            console.log("EXPORT: Setting timeout to restore buttons");
            setTimeout(() => {
                console.log("EXPORT: Restoring buttons");
                removeButtons.forEach(btn => {
                    btn.style.display = 'flex';
                });
                console.log("EXPORT: Buttons restored");
                showNotification("Routine prepared! Check the new tab.", "success");
            }, 100);
            
        } catch (error) {
            console.error("EXPORT: Critical error:", error);
            showNotification("Export failed. Please try again or take a screenshot.", "error");
            
            // Restore the remove buttons
            const removeButtons = document.querySelectorAll('.remove-course');
            removeButtons.forEach(btn => {
                btn.style.display = 'flex';
            });
        }
    }

    // Simple alternative export function
    function simpleExportRoutine() {
        console.log("SIMPLE EXPORT: Starting simple export");
        
        try {
            // Create a very simple export with minimal HTML
            const win = window.open();
            console.log("SIMPLE EXPORT: Window opened:", !!win);
            
            if (!win) {
                console.error("SIMPLE EXPORT: Failed to open window - likely popup blocked");
                showNotification("Pop-up blocked. Please allow pop-ups and try again.", "error");
                return;
            }
            
            // Create a very basic HTML with just a message
            win.document.write(`
                <html>
                <head>
                    <title>Test Export</title>
                </head>
                <body>
                    <h1>Test Export Worked!</h1>
                    <p>This is a test export window. If you can see this, the export function is working.</p>
                    <button onclick="window.close()">Close</button>
                </body>
                </html>
            `);
            
            win.document.close();
            console.log("SIMPLE EXPORT: Document written and closed");
            
            showNotification("Test export opened in new tab", "success");
        } catch (error) {
            console.error("SIMPLE EXPORT: Error occurred:", error);
            showNotification("Export failed. Please check browser console.", "error");
        }
    }
});