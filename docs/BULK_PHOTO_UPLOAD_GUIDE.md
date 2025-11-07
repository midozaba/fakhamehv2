# Bulk Car Photo Upload Guide

## Overview
You can now upload multiple car photos at once instead of uploading them one by one through the admin panel!

## How to Use

### Step 1: Prepare Your Photos
Name your image files with the **7-digit car number** from your database. For example:
- `7041195.jpg` - for car with car_num 7041195
- `7050085.png` - for car with car_num 7050085
- `7054088.jpg` - for car with car_num 7054088

**Important:**
- The filename MUST contain the exact 7-digit car number
- Supported formats: JPG, PNG, GIF, WEBP
- Maximum file size: 5MB per image
- You can include other text in the filename like "7041195_front.jpg" or "car_7041195.png" - the script will extract the car number automatically

### Step 2: Access the Bulk Upload Tool
1. Log in to the Admin Panel
2. Navigate to the **Cars** tab
3. Click the green **"Upload Photos"** button in the top right

### Step 3: Upload Photos
1. In the bulk upload modal, click **"Select Car Images"**
2. Select multiple image files at once (hold Ctrl/Cmd to select multiple)
3. You'll see a list of selected files with their sizes
4. Click **"Upload X Photo(s)"** to start the upload

### Step 4: Review Results
After upload completes, you'll see three sections:

- **Successfully Uploaded (Green)** - Photos that were matched and uploaded successfully
- **Failed (Red)** - Photos that couldn't be uploaded (car not found, file errors, etc.)
- **Skipped (Yellow)** - Photos that were skipped (invalid filename format)

Each result shows:
- The original filename
- The car number extracted from the filename
- The car details it matched to (brand, type, model)
- Any error messages if upload failed

### Step 5: Close and Verify
1. Click **"Close"** to close the modal
2. The car list will automatically refresh
3. You can verify the photos were uploaded by editing individual cars or viewing the cars list

## Example Workflow

If you have these cars in your database:
- Car #7041195 (Hyundai H1 2018)
- Car #7050085 (Hyundai i10 2020)
- Car #7054088 (Kia Cerato 2022)

Name your photos:
- `7041195.jpg`
- `7050085.jpg`
- `7054088.jpg`

Then select all three at once and upload!

## Tips

1. **Batch Processing**: You can upload up to 100 images at once
2. **Automatic Replacement**: If a car already has a photo, it will be automatically replaced with the new one
3. **Error Recovery**: Failed uploads won't affect successful ones - each file is processed independently
4. **Name Flexibility**: The script looks for 7-digit numbers in the filename, so these all work:
   - `7041195.jpg`
   - `car_7041195_front.jpg`
   - `IMG_7041195.png`
   - `7041195_burgundy_2018.jpg`

## Troubleshooting

**"Could not extract 7-digit car number from filename"**
- Make sure your filename contains exactly 7 digits
- Example: `7041195.jpg` ✓ but `041195.jpg` ✗

**"No car found with car number XXXXXXX"**
- The car number in the filename doesn't exist in your database
- Check your cars.sql or database to verify the car number
- Make sure you're using the `car_num` field, not the `id` field

**"Image size must be less than 5MB"**
- Compress your image or reduce its resolution
- Most car photos should be well under 5MB

## Summary

This tool will save you tons of time! Instead of:
1. Opening each car individually
2. Clicking "Edit"
3. Selecting the photo
4. Uploading
5. Saving
6. Repeat 79 times...

You can now:
1. Name your photos with car numbers
2. Select all photos at once
3. Click upload
4. Done!

Happy uploading! 🚗📸
