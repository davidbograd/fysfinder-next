# Clinic Owners Landing Page - Implementation SOP

## Overview

This SOP outlines the essential steps required to create a landing page for clinic owners, featuring clinic search functionality and key benefits of Fysfinder. All content must be in Danish.

## Core Implementation Checklist

### Setup

- [ ] Create new page file at `src/app/tilmeld/page.tsx`
- [ ] Set up metadata for SEO optimization

### Hero Section

- [ ] Implement hero section with:
  - [ ] Headline highlighting patient connection
  - [ ] Search functionality for clinics to check if their clinic is already on the platform
    - [ ] Import search functionality from `src/app/search/page.tsx`
  - [ ] Secondary CTA for clinics that they can't find. "Tilføj din klinik". Should be a button for now, linking to # as a placeholder.

### Core Sections

- [ ] "How It Works" section:

  1. [ ] Find and claim your clinic
  2. [ ] Set up your profile
  3. [ ] Connect with patients

  - [ ] Add icons for each step
  - [ ] Danish descriptions

- [ ] Social proof section:
  - [ ] One testimonial only

### Technical Requirements

- [ ] Mobile-first responsive design
- [ ] Component optimization
- [ ] Error boundaries
- [ ] Core functionality tests

### Content

- [ ] Danish copy for:
  - [ ] Headlines
  - [ ] Core sections
  - [ ] CTAs
  - [ ] Error messages

## Essential Notes

- All content in Danish
- Mobile-first approach
- Medical-appropriate design
