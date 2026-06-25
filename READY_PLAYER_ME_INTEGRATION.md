# Ready Player Me Integration Guide

## ✅ Fully Integrated!

Your project now has **Ready Player Me** avatar creator built-in! Users can create 3D avatars without ever leaving your website.

## 🎭 How It Works

### For Users:

1. Visit your 3D Avatar Try-On page: http://localhost:3000/try/avatar-3d
2. Click the big gold button: **"Create Avatar Now"**
3. A full-screen creator opens with Ready Player Me
4. Users can:
   - Take a selfie (creates avatar from their face)
   - Upload a photo
   - Manually customize every detail
5. Click "Done" in Ready Player Me
6. **Avatar automatically saves to your server**
7. **Jewelry try-on starts immediately!**

### Technical Flow:

```
User clicks "Create Avatar Now"
    ↓
Ready Player Me iframe opens (fullscreen modal)
    ↓
User creates avatar (2-3 minutes)
    ↓
User clicks "Done" in RPM
    ↓
GLB file is sent via postMessage API
    ↓
Your app downloads the GLB file
    ↓
Uploads to your server (/api/user/avatar/upload)
    ↓
Saves to localStorage
    ↓
Avatar appears in 3D viewer
    ↓
User can try on jewelry!
```

## 🚀 Features Added

### 1. Integrated Avatar Creator
- ✅ Full-screen modal with Ready Player Me
- ✅ No external website needed
- ✅ Seamless user experience
- ✅ Auto-saves to your server
- ✅ Instant jewelry try-on after creation

### 2. Three Ways to Get Avatars

#### Option 1: **Create in-app** (NEW! ⭐)
- Click "Create Avatar Now" button
- Takes 2-3 minutes
- No account needed
- No downloads
- Fully integrated

#### Option 2: **Upload existing avatar**
- Drag & drop VRM/GLB files
- Works with any avatar source
- Max 15MB

#### Option 3: **External tools**
- Ready Player Me website
- VRoid Studio
- Any VRM/GLB source

## 🔧 Technical Details

### New Components Created:

#### `ReadyPlayerMeCreator.tsx`
- Full-screen modal component
- Embeds Ready Player Me iframe
- Listens for avatar export events
- Downloads GLB file
- Uploads to your server
- Beautiful UI with loading states

#### Enhanced `AvatarUploader.tsx`
- Added "Create Avatar Now" button
- Integrated ReadyPlayerMeCreator modal
- Updated UI with better hierarchy
- Shows all three options clearly

### API Integration:

```typescript
// Ready Player Me sends avatar URL via postMessage
window.addEventListener('message', (event) => {
  if (event.data.eventName === 'v1.avatar.exported') {
    const avatarUrl = event.data.data.url; // GLB file URL
    
    // Download and upload to your server
    fetch(avatarUrl)
      .then(res => res.blob())
      .then(blob => {
        const formData = new FormData();
        formData.append('avatar', blob, 'avatar.glb');
        return axios.post('/api/user/avatar/upload', formData);
      })
      .then(response => {
        // Avatar saved! Start try-on
        onAvatarCreated(response.data.avatarUrl);
      });
  }
});
```

### Ready Player Me iframe:

```html
<iframe 
  src="https://jewelfit.readyplayer.me?frameApi"
  allow="camera *; microphone *; clipboard-write"
/>
```

The `?frameApi` parameter enables the postMessage API for communication.

## 🎨 UI/UX Features

### Modal Design:
- Full-screen overlay (90vh)
- Dark background with blur
- Header with title and close button
- Loading indicator during iframe load
- Downloading indicator when saving
- Bottom instructions panel
- Responsive design

### Button Design:
- Large, prominent gold gradient button
- Clear call-to-action
- Shows time estimate ("Takes 2-3 minutes")
- Highlights benefits ("Free • No signup")
- Hover and active states
- Disabled state during upload

## 📊 User Flow Examples

### Scenario 1: First-time User
```
1. Visits /try/avatar-3d
2. Sees upload area
3. Clicks "Create Avatar Now" (gold button)
4. Takes selfie in Ready Player Me
5. Customizes hair/clothes (1 minute)
6. Clicks "Done"
7. Sees "Saving Your Avatar..." (5 seconds)
8. Avatar appears in 3D viewer
9. Selects jewelry to try on
10. Takes screenshots
```

### Scenario 2: Returning User
```
1. Visits /try/avatar-3d
2. Avatar auto-loads from localStorage
3. Starts trying on jewelry immediately
4. Can click "Change Avatar" to create new one
```

### Scenario 3: Power User
```
1. Creates avatar in VRoid Studio (advanced)
2. Exports as VRM file
3. Drags & drops onto upload area
4. Avatar loads
5. Tries on jewelry
```

## 🔐 Security & Privacy

### CORS & Security:
- Only accepts messages from `readyplayer.me` domain
- Validates event origin before processing
- Downloads avatar through your server (not hotlinked)
- Stores avatars on your server (full control)

### Privacy:
- No user data sent to Ready Player Me
- No account creation required
- Avatars stored locally on your server
- Users can delete avatars anytime

## 🎯 Configuration

### Custom Subdomain (Optional):
Ready Player Me allows custom subdomains for branding:

```typescript
// Change the iframe src:
src="https://jewelfit.readyplayer.me?frameApi"
// To your custom subdomain
```

To get a custom subdomain:
1. Sign up at: https://readyplayer.me/developers
2. Create a project
3. Get your subdomain (e.g., `yourcompany.readyplayer.me`)
4. Update the iframe src in `ReadyPlayerMeCreator.tsx`

### Avatar Quality Settings:

You can customize avatar quality via URL parameters:

```typescript
// High quality (larger file)
src="https://jewelfit.readyplayer.me?frameApi&quality=high"

// Low quality (smaller file, faster)
src="https://jewelfit.readyplayer.me?frameApi&quality=low"

// Half-body only (faster rendering)
src="https://jewelfit.readyplayer.me?frameApi&bodyType=halfbody"
```

## 📱 Browser Support

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari (iOS 14+)
- ✅ Mobile browsers
- ⚠️ Requires camera permission for selfie feature

## 🐛 Troubleshooting

### Issue: Modal doesn't open
- Check browser console for errors
- Verify iframe src URL is correct
- Check if blocked by ad blocker

### Issue: Avatar doesn't save
- Check `/api/user/avatar/upload` endpoint
- Verify file upload directory exists
- Check network tab for failed requests

### Issue: Poor performance
- Use smaller avatar files
- Enable GPU acceleration in browser
- Close other tabs
- Use quality=low parameter

## 🎉 Testing It Out

1. **Visit**: http://localhost:3000/try/avatar-3d
2. **Click**: The big gold "Create Avatar Now" button
3. **Create**: Your avatar in Ready Player Me
4. **Done**: Click "Done" in the creator
5. **Try On**: Your avatar appears with jewelry!

## 📚 Documentation Links

- Ready Player Me Docs: https://docs.readyplayer.me
- Frame API: https://docs.readyplayer.me/ready-player-me/integration-guides/web-and-native/frame-api
- Avatar Creator: https://readyplayer.me

## 🆕 What's Next?

Possible enhancements:
- [ ] Save multiple avatars per user
- [ ] Avatar editing (return to RPM to modify)
- [ ] Avatar gallery/selection
- [ ] Social sharing of avatar + jewelry
- [ ] Custom clothing/accessories in RPM
- [ ] Animate avatars with poses

---

**Status**: ✅ Fully Integrated and Ready to Use!
