# RDS2vanced - Course Schedule Planner

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](https://github.com/rayedriasat/rdsVanced/issues)
[![GitHub stars](https://img.shields.io/github/stars/rayedriasat/rdsVanced?style=social)](https://github.com/rayedriasat/rdsVanced/stargazers)

A modern, interactive web application for university students to plan their course schedule. RDS2vanced allows users to browse available courses, create conflict-free schedules, and export their weekly routine as an image.

<p align="center">
  <img src=".github/screenshots/screenshot.png" alt="RDS2vanced Screenshot" width="80%">
</p>

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-live-demo)
- [Installation](#-installation)
- [Usage](#-how-to-use)
- [Technologies Used](#-technologies-used)
- [Project Structure](#-project-structure)
- [Browser Compatibility](#-browser-compatibility)
- [Future Improvements](#-future-improvements)
- [License](#-license)
- [Credits](#-credits)
- [Contributing](#-contributing)

## 🌟 Features

- **Interactive Course Search**: Quickly find courses by code, faculty name, or schedule
- **Visual Schedule Builder**: Intuitive interface for building your weekly routine
- **Conflict Detection**: Automatic detection and warning for scheduling conflicts
- **Auto-Save**: Course selections are automatically saved to local storage
- **Theme Toggle**: Switch between light and dark modes for comfortable viewing
- **Export Options**: Export your routine as JPG or PDF for sharing and printing
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🚀 Live Demo

Check out the live demo: [RDS2vanced Demo](https://rayedriasat.github.io/rdsVanced)

## 💻 Installation

### Prerequisites
- A web server or local development environment
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/rayedriasat/rdsVanced.git
   cd rdsVanced
   ```

2. Start a local server:
   
   Using Node.js and http-server:
   ```bash
   npm install -g http-server
   http-server -c-1 -o
   ```
   
   Or using Python:
   ```bash
   # Python 3
   python -m http.server
   
   # Python 2
   python -m SimpleHTTPServer
   ```

3. Open in your browser:
   ```
   http://localhost:8080
   ```

## 📖 How to Use

1. **Browse Courses**: Use the search bar to find courses by code, faculty name, or schedule
2. **Select Courses**: Click on a course card to add it to your weekly routine
3. **Review Schedule**: Your selected courses appear in the weekly timetable
4. **Resolve Conflicts**: If conflicts occur, you'll be prompted to choose which course to keep
5. **Remove Courses**: Click the 'X' on any course in the timetable to remove it
6. **Export Schedule**: Click "Export as Image" to save your routine as a JPG file

<details>
<summary>View Screenshot Gallery</summary>
<br>
  
| Light Mode | Dark Mode |
|------------|-----------|
| ![Light Mode](.github/screenshots/light-mode.png) | ![Dark Mode](.github/screenshots/dark-mode.png) |
  
| Course Selection | Export View |
|------------------|------------|
| ![Course Selection](.github/screenshots/course-selection.png) | ![Export View](.github/screenshots/export-view.png) |
  
</details>

## 🔧 Technologies Used

- **HTML5**: For structure and semantic markup
- **CSS3**: For styling, animations, and responsive design
- **JavaScript**: For interactive behavior and data handling
- **LocalStorage API**: For saving course selections between sessions
- **HTML2Canvas**: For generating JPG exports of the timetable

## 📋 Project Structure

```
rdsVanced/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # Main application logic
├── data.js             # Data loading utilities
├── courseData.json     # Course information database
└── README.md           # Project documentation
```

## 🌐 Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

## 🔍 Future Improvements

- [ ] Add filter options for days, time slots, and course levels
- [ ] Implement course description viewing
- [ ] Add multi-semester planning capability
- [ ] Create user accounts for saving multiple schedules
- [ ] Add sharing options via social media or direct links

See the [open issues](https://github.com/rayedriasat/rdsVanced/issues) for a full list of proposed features and known issues.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

Developed by [Rayed Riasat Rabbi (thercube)](https://www.linkedin.com/in/rayed-riasat-rabbi/)

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=rayedriasat/rdsVanced&type=Date)](https://star-history.com/#rayedriasat/rdsVanced&Date) 