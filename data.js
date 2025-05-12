// This file contains the parsed course data from the Excel file
const courseData = [
  {
    course_code_section: "CSE101.1",
    faculty_name: "John Doe",
    schedule: "ST 08:00 AM - 09:30 AM",
    title: "Introduction to Computer Science"
  },
  {
    course_code_section: "CSE101.2",
    faculty_name: "Jane Smith",
    schedule: "MW 09:40 AM - 11:10 AM",
    title: "Introduction to Computer Science"
  },
  {
    course_code_section: "CSE201.1",
    faculty_name: "Robert Johnson",
    schedule: "RA 11:20 AM - 12:50 PM",
    title: "Data Structures"
  },
  {
    course_code_section: "MAT101.1",
    faculty_name: "Emily Brown",
    schedule: "ST 01:00 PM - 02:30 PM",
    title: "Calculus I"
  },
  {
    course_code_section: "PHY101.1",
    faculty_name: "Michael Wilson",
    schedule: "MW 02:40 PM - 04:10 PM",
    title: "Physics I"
  },
  {
    course_code_section: "ENG101.1",
    faculty_name: "Sarah Davis",
    schedule: "RA 04:20 PM - 05:50 PM",
    title: "English Composition"
  },
  {
    course_code_section: "CSE301.1",
    faculty_name: "David Miller",
    schedule: "ST 06:00 PM - 07:30 PM",
    title: "Database Systems"
  }
];

// Note: This is sample data. In a real implementation, you would parse the Excel file
// and populate this array with the actual data from the file.

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
  
  return {
    days: daysList,
    startTime: startTime,
    endTime: endTime,
    timeRange: timeRange
  };
}

// Function to get all courses
function getAllCourses() {
  return courseData;
}

// Function to search courses
function searchCourses(query) {
  query = query.toLowerCase();
  return courseData.filter(course => 
    course.course_code_section.toLowerCase().includes(query) ||
    course.faculty_name.toLowerCase().includes(query) ||
    course.title.toLowerCase().includes(query)
  );
}

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