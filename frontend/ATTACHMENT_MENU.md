# Attachment Menu - Feature Guide

## Overview

The attachment menu provides a Claude-like file upload experience with a clean popover interface.

## Features

### "+" Button
- Located on the left side of the input box
- Rotates 45° to become an "×" when open
- Smooth color transition when active (becomes indigo accent color)
- Click to toggle the popover menu

### Popover Menu

A beautiful dropdown menu that appears above the input with:

#### Two Upload Options:

**1. Add Data**
- Icon: Blue-to-cyan gradient document with chart icon
- Accepts: CSV, Excel (.xlsx, .xls), TXT files
- Supports: Multiple file selection
- Max size: 50MB per file
- Description: "Upload CSV, Excel, or text files"

**2. Add Template**
- Icon: Purple-to-pink gradient document icon
- Accepts: DOCX files only
- Supports: Single file selection
- Max size: 10MB
- Description: "Upload DOCX template (optional)"

#### Menu Styling:
- Rounded corners (rounded-2xl)
- Shadow-2xl for depth
- Smooth fade-in and slide-up animation
- Dark/light theme support
- Hover effects on each option
- Divider between options
- Footer with file size hints

### File Upload Behavior

When files are selected:
1. Popover closes automatically
2. System message appears in chat showing uploaded file(s)
3. Files are stored in component state
4. Input resets for next upload

Example system messages:
- `📊 Data files uploaded: research_data.csv`
- `📄 Template uploaded: journal_template.docx`

## Usage

```jsx
import AttachmentMenu from './components/AttachmentMenu';

function ComposerBar() {
  const handleFileSelect = ({ type, files }) => {
    console.log('Type:', type); // 'data' or 'template'
    console.log('Files:', files); // Array of File objects
  };

  return (
    <AttachmentMenu onFileSelect={handleFileSelect} />
  );
}
```

## Integration Points

The attachment menu is integrated into:
- **ComposerBar**: Replaces the old paperclip button
- **ChatUI**: Handles file state and displays system messages
- **Message**: Renders system messages with special styling

## System Message Styling

System messages appear centered with:
- Rounded pill shape
- Light gray background
- Small text size
- Border outline
- Subtle appearance (not as prominent as user/assistant messages)

## Click-Outside Behavior

The menu automatically closes when:
- User clicks anywhere outside the popover
- User selects a file
- User clicks the "+" button again

## Animations

- **Open**: Fade in + slide up (200ms)
- **Button rotation**: 45° transform (200ms)
- **Hover states**: Smooth background transitions

## Future Enhancements

Potential additions:
- File preview before upload
- Drag-and-drop support
- Progress indicators for large files
- Remove uploaded files
- File type icons in system messages
- Integration with backend upload API
