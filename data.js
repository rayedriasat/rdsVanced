// This file loads the course data from courseData.json
let courseData = [];

// Load the course data from the JSON file
document.addEventListener('DOMContentLoaded', function() {
    // Use XMLHttpRequest for better compatibility
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'courseData.json', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    courseData = JSON.parse(xhr.responseText);
                    // Dispatch an event to notify that course data is loaded
                    document.dispatchEvent(new CustomEvent('courseDataLoaded'));
                } catch (error) {
                    console.error('Error parsing course data:', error);
                }
            } else {
                console.error('Failed to load course data. Status:', xhr.status);
            }
        }
    };
    xhr.send();
});

// Function to get all courses
function getAllCourses() {
    return courseData;
}

// Function to search courses by query
function searchCourses(query) {
    query = query.toLowerCase();
    return courseData.filter(course => {
        return (
            course.course_code_section.toLowerCase().includes(query) ||
            course.faculty_name.toLowerCase().includes(query) ||
            course.schedule.toLowerCase().includes(query) ||
            course.room.toLowerCase().includes(query)
        );
    });
}

// Function to parse schedule string into day and time components
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

// Make sure to update any other functions that use courseData directly
// Function to get time slot index
function getTimeSlotIndex(timeStr) {
  const timeSlots = [
    '08:00 AM - 09:30 AM',
    '09:40 AM - 11:10 AM',
    '11:20 AM - 12:50 PM',
    '01:00 PM - 02:30 PM',
    '02:40 PM - 04:10 PM',
    '04:20 PM - 05:50 PM',
    '06:00 PM - 07:30 PM'
  ];

  return timeSlots.indexOf(timeStr);
}