# Survey Template PRD

## Overview

This document serves as a template for creating new survey pages on our platform. Each survey follows a standardized structure while allowing for customization in scoring and question types.

## URL Structure

- Base URL: `/[survey-slug]`
- Example: `/personality-test` or `/career-assessment`
- Each survey must have a unique, URL-friendly slug

## Core Features

### Survey Structure

1. **Header Section**

   - Survey title
   - Brief description/introduction
   - Estimated completion time
   - Target audience (if applicable)

2. **Question Flow**

   - Sequential presentation of questions
   - Progress indicator
   - Navigation controls (Next/Previous)
   - Option to review answers before submission

3. **Response Types**
   - Multiple choice (single selection)

### Scoring System

1. **Score Configuration**

   ```typescript
   interface QuestionScore {
     questionId: string;
     answers: {
       answerId: string;
       score: number;
       category?: string; // For multi-dimensional scoring
     }[];
   }
   ```

2. **Scoring Methods**
   - Defined by the individual survey

### Results

1. **Results Page**
   - Overall score/category
   - Detailed breakdown
   - Recommendations (if applicable)
   - Option to share results

## Technical Requirements

### Data Structure

```typescript
interface Survey {
  id: string;
  slug: string;
  title: string;
  description: string;
  questions: Question[];
  scoringLogic: ScoringLogic;
  resultCategories: ResultCategory[];
}

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options: Answer[];
}

interface Answer {
  id: string;
  text: string;
  score: number;
  category?: string;
}

interface ScoringLogic {
  type: "simple" | "weighted" | "categorical";
  rules: ScoringRule[];
}

interface ResultCategory {
  id: string;
  name: string;
  description: string;
  minScore: number;
  maxScore: number;
}
```

### Required Components

1. Survey Container
2. Question Component
3. Progress Bar
4. Navigation Controls
5. Results Display
6. Score Calculator

## User Experience

1. **Accessibility**

   - WCAG 2.1 compliance
   - Keyboard navigation
   - Screen reader compatibility

2. **Responsive Design**

   - Mobile-first approach
   - Tablet and desktop optimization

3. **Performance**
   - < 3s initial load time
   - Smooth transitions between questions
   - Client-side validation

## Analytics Requirements

1. **Track:**
   - Completion rates
   - Time per question
   - Drop-off points
   - Result distribution
   - User demographics (if available)

## Implementation Checklist

- [ ] Create survey configuration file
- [ ] Set up database schema
- [ ] Implement scoring logic
- [ ] Design and implement UI components
- [ ] Add analytics tracking
- [ ] Test across devices
- [ ] Validate accessibility
- [ ] Document scoring methodology

## Security Considerations

1. Rate limiting
2. Input validation
3. Data encryption
4. User data privacy compliance

## Testing Requirements

1. Unit tests for scoring logic
2. Integration tests for data flow
3. UI/UX testing
4. Cross-browser testing
5. Mobile responsiveness testing

---

**Note:** This template should be customized for each specific survey implementation. Pay special attention to the scoring logic and result categories, as these will vary between surveys.
