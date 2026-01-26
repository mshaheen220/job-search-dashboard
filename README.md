# Job Search Dashboard

A professional, interactive dashboard for tracking job applications, managing pipeline status, and analyzing job search metrics.

## Features

- **Real-time metrics**: Total applications, callback rate, interview rate, and active pipeline
- **Visual analytics**: Multi-line charts for applications and response activity
- **Pipeline funnel**: Track jobs through recruitment stages
- **Company tracking**: Monitor applications by company with response rates
- **Closure analysis**: Understand why applications are closed
- **Interview tracking**: Manage interview rounds, interviewers, and notes
- **Custom categories**: Organize companies with custom tags and colors
- **Backup & Restore**: Export your data to JSON and restore backups
- **Light/Dark theme**: Toggle between themes for comfortable viewing
- **Responsive design**: Works on desktop and tablet devices

## Technology Stack

- **React 18** - UI framework
- **Chart.js 4.4.1** - Data visualization
- **Babel** - JSX compilation
- **Responsive CSS** - Custom styling with CSS variables

## Getting Started

### Prerequisites

- Node.js (optional - runs entirely in the browser)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jburgh/job-search-dashboard.git
cd job-search-dashboard
```

2. Open in your browser:
```bash
open index.html
# or simply double-click index.html in Finder
```

### Using with a local server (recommended)

For the best experience, serve the app locally:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Python 2
python2 -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server
```

Then visit `http://localhost:8000` in your browser.

## Customization

You can customize the dashboard's configuration and styling without modifying the core files. This allows you to keep your personal settings (like your name, links, or preferred colors) separate from the source code.

### Configuration Overrides (`js/locals.js`)

1. Create a file named `js/locals.js` in the `js` directory.
2. Define your overrides in `window.LOCAL_CONSTANTS`.

Example `js/locals.js`:
```javascript
window.LOCAL_CONSTANTS = {
    APP_CONFIG: {
        AUTHOR_NAME: 'Your Name',
        URLS: {
            GITHUB: '',
            PAYPAL: '',
            PERSONAL: 'https://your-website.com'
        }
    }
};
```

### Style Overrides (`css/locals.css`)

1. Create a file named `css/locals.css` in the `css` directory.
2. Add standard CSS to override variables or styles.

Example `css/locals.css`:
```css
:root {
    /* Change primary accent color */
    --accent-primary: #8b5cf6;
}
```

### Version Control

The `.gitignore` file is pre-configured to ignore `js/locals.js` and `css/locals.css`. This ensures your personal information and preferences are not committed to the repository.

## Data Storage

Job data is stored in your browser's localStorage. Your data persists across sessions but is only stored locally on this device.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

Personal use only.

## Author

Jill Shaheen
Michael Shaheen