# Tracking & Analytics Implementation Guide

## Overview
This document outlines the comprehensive tracking infrastructure implemented for Car Street, including Google Tag Manager, Google Analytics 4, Meta Pixel, and Google Ads remarketing.

## 🔵 1. INSTALLED COMPONENTS

### 1.1 Google Tag Manager (GTM)
- **Location**: `index.html` (head and body)
- **Container ID**: `GTM-XXXXXXX` (placeholder - replace with your actual GTM ID)
- **Status**: ✅ Installed - needs your GTM container ID

### 1.2 Google Analytics 4 (GA4)
- **Setup**: Configure through GTM dashboard
- **Measurement ID**: Add via GTM tag configuration
- **Features Enabled**:
  - Enhanced measurement
  - Cross-domain tracking support
  - User-ID support ready

### 1.3 Meta Pixel (Facebook/Instagram)
- **Setup**: Configure through GTM dashboard
- **Features Ready**:
  - Advanced matching (email, phone, name)
  - PageView tracking
  - Custom event tracking

### 1.4 Google Ads Remarketing
- **Setup**: Configure through GTM dashboard
- **Features Ready**:
  - Dynamic remarketing data layer
  - Conversion tracking ready

## 🔵 2. IMPLEMENTED TRACKING EVENTS

All tracking utilities are in `src/utils/tracking.ts`:

### 2.1 Vehicle View Event ⭐ (Major)
**Triggers**: When user opens any vehicle detail page
- **GA4 Event**: `view_item` with vehicle details
- **Meta Pixel**: `ViewContent` with vehicle data
- **Google Ads**: Dynamic remarketing with product ID
- **Data Captured**: VIN, name, price, year, make, model

### 2.2 Inventory Search Event
**Triggers**: When user filters/searches inventory
- **Event**: `search_inventory`
- **Parameters**: search query, selected filters (price, make, etc.)

### 2.3 Click-to-Call Event
**Triggers**: When user clicks phone number
- **GA4 Event**: `click_call`
- **Meta Pixel**: `Contact` event

### 2.4 Form Start Event
**Ready for implementation** when forms are added:
- Finance form
- Trade-in form
- Contact form
- Credit application

### 2.5 Form Submission Event
**Ready for implementation** when forms are added:
- Tracks lead generation
- Sends to GA4, Meta Pixel, and Google Ads conversion

### 2.6 Budget Calculator Event
**Triggers**: When user calculates payment and searches inventory
- Custom event with budget parameters

## 🔵 3. VEHICLE DATA STRUCTURE

### 3.1 Global Vehicle Object
Each vehicle page sets:
```javascript
window.vehicleData = {
  id: "[VIN]",
  name: "[YEAR] [MAKE] [MODEL]",
  price: [PRICE],
  year: [YEAR],
  make: "[MAKE]",
  model: "[MODEL]"
}
```

### 3.2 Structured Data (JSON-LD)
Automatically generated for each vehicle page:
- Schema.org Vehicle + Product types
- SEO-optimized
- Includes VIN, specifications, pricing, availability

## 🔵 4. USER IDENTIFICATION & CRM

### 4.1 CRM Integration Hook
**Location**: `index.html` and `src/utils/tracking.ts`
```javascript
window.identifyUser(emailOrPhone, userData)
```

**Ready for integration with**:
- HubSpot
- Zoho CRM
- Salesforce
- Any custom CRM

### 4.2 Viewed Vehicle History
- Stored in localStorage
- Tracks last 5 viewed vehicles
- Sent to CRM when user is identified

## 🔵 5. REMARKETING SETUP

### 5.1 Meta Dynamic Product Ads
**Feed Generator**: `src/utils/vehicleFeedGenerator.ts`
- XML format for Meta Commerce Manager
- CSV format available
- Auto-updates with inventory

### 5.2 Google Ads Dynamic Remarketing
- Event tracking implemented
- Dynamic remarketing tags ready
- Product feed can be exported

## 🔵 6. PRIVACY & CONSENT

### 6.1 Cookie Consent Banner
**Component**: `src/components/tracking/CookieConsent.tsx`
- GDPR compliant
- Three options: Accept All, Reject Non-Essential, Manage Preferences
- Persistent storage of preferences

### 6.2 Consent-Based Tracking
- Respects user choices
- Disables marketing pixels if rejected
- Maintains essential functionality

## 🔵 7. SETUP INSTRUCTIONS

### Step 1: Google Tag Manager
1. Create GTM account at tagmanager.google.com
2. Get your container ID (GTM-XXXXXXX)
3. Replace `GTM-XXXXXXX` in `index.html` with your actual ID

### Step 2: Google Analytics 4
1. Create GA4 property in Google Analytics
2. Get your Measurement ID (G-XXXXXXXXXX)
3. In GTM:
   - New Tag → Google Analytics: GA4 Configuration
   - Add your Measurement ID
   - Trigger: All Pages

### Step 3: Meta Pixel
1. Create Meta Pixel in Facebook Events Manager
2. Get your Pixel ID
3. In GTM:
   - New Tag → Custom HTML
   - Add Meta Pixel base code
   - Trigger: All Pages

### Step 4: Google Ads
1. Create remarketing tag in Google Ads
2. Get your Conversion ID
3. In GTM:
   - New Tag → Google Ads Remarketing
   - Add Conversion ID
   - Trigger: All Pages

### Step 5: Configure GTM Variables
Set up these dataLayer variables in GTM:
- `event`
- `search_query`
- `selected_filters`
- `vehicle_id`
- `form_type`
- `ecomm_prodid`
- `ecomm_totalvalue`
- `ecomm_pagetype`

### Step 6: Set Up GTM Triggers
Create triggers for:
- `view_item` (vehicle views)
- `search_inventory` (inventory searches)
- `click_call` (phone clicks)
- `form_start` (form interactions)
- `form_submit` (form submissions)

## 🔵 8. TESTING CHECKLIST

- [ ] GTM container loads on all pages
- [ ] GA4 pageviews tracked
- [ ] Meta Pixel fires on pageview
- [ ] Vehicle view events tracked
- [ ] Search events captured
- [ ] Click-to-call tracked
- [ ] Cookie consent works
- [ ] Structured data validates (use Google Rich Results Test)
- [ ] GTM Preview mode works

## 🔵 9. VEHICLE FEED EXPORT

To export vehicle feed for dynamic ads:
1. Access admin dashboard
2. Navigate to inventory section
3. Use feed generator utilities
4. Export as XML or CSV
5. Upload to Meta Commerce Manager or Google Merchant Center

## 🔵 10. MONITORING & OPTIMIZATION

### Key Metrics to Track:
- Vehicle detail page views
- Inventory search behavior
- Click-to-call conversion rate
- Form submission rate
- Remarketing audience size
- Return visitor rate

### Recommended Reports:
- GA4: Enhanced measurement events
- Meta Ads Manager: Custom audience growth
- Google Ads: Remarketing list size
- GTM: Tag firing verification

## 📞 SUPPORT

For questions about implementation:
1. Check GTM Preview mode for debugging
2. Use browser console to verify dataLayer events
3. Test with Google Tag Assistant Chrome extension
4. Verify structured data with Google Rich Results Test

## 🔄 NEXT STEPS

1. **Immediate**: Replace GTM container ID
2. **Week 1**: Configure GA4, Meta Pixel, Google Ads in GTM
3. **Week 2**: Test all events and verify data flow
4. **Week 3**: Set up remarketing campaigns
5. **Week 4**: Export vehicle feed and launch dynamic ads

---

**Implementation Complete**: ✅ All tracking infrastructure code deployed and ready for configuration.
