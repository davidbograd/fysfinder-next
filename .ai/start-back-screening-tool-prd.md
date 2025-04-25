# STarT Back Screening Tool Implementation PRD

## Overview

Implementation of the Danish version of the STarT Back Screening Tool, a validated questionnaire for assessing risk levels in patients with back pain.

## URL Structure

- URL: `/start-back-screening-tool`
- Language: Danish
- Accessibility: Public access

## Survey Configuration

### Header Section

- Title: "STarT Back Screening Tool – Dansk version"
- Description: Brief introduction about the purpose of the screening tool
- Estimated completion time: 5-10 minutes
- Target audience: Patients with back pain

### Questions Structure

```typescript
const questions = [
  {
    id: "q1",
    text: "Jeg har haft smerter i det ene eller begge ben i forbindelse med mine rygsmerter.",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q2",
    text: "Jeg har haft smerter i skulderen eller nakken i forbindelse med mine rygsmerter.",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q3",
    text: "Jeg har haft vanskeligt ved at gå på grund af mine rygsmerter.",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q4",
    text: "Jeg har haft svært ved at komme op fra en stol på grund af mine rygsmerter.",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q5",
    text: "Det har generet mig i mit daglige arbejde (hjemme eller ude).",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q6",
    text: "Jeg har været bekymret pga. mine rygsmerter.",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q7",
    text: "Jeg har følt mig anspændt eller stresset pga. mine rygsmerter.",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q8",
    text: "Generelt har jeg ikke haft det godt pga. mine rygsmerter.",
    type: "SINGLE_CHOICE",
    required: true,
  },
  {
    id: "q9",
    text: "I løbet af de sidste 2 uger har jeg tænkt, at det måske aldrig bliver bedre med min ryg.",
    type: "SINGLE_CHOICE",
    required: true,
  },
];

const answerOptions = [
  { id: "totally_agree", text: "Helt enig", score: 1 },
  { id: "agree", text: "Enig", score: 1 },
  { id: "neutral", text: "Hverken enig eller uenig", score: 0 },
  { id: "disagree", text: "Uenig", score: 0 },
  { id: "totally_disagree", text: "Helt uenig", score: 0 },
];
```

### Scoring Logic

```typescript
interface StartBackScore {
  totalScore: number; // Range: 0-9
  psychosocialScore: number; // Range: 0-5 (Q5-Q9)
  riskLevel: "low" | "medium" | "high";
}

const scoringLogic = {
  calculateScore: (answers: Answer[]): StartBackScore => {
    // Special handling for Q9 (only "Helt enig" scores 1)
    const q9Score = answers[8].answer === "totally_agree" ? 1 : 0;

    // Calculate total score
    const totalScore =
      answers.slice(0, 8).reduce((sum, answer) => sum + answer.score, 0) +
      q9Score;

    // Calculate psychosocial score (Q5-Q9)
    const psychosocialScore =
      answers.slice(4, 8).reduce((sum, answer) => sum + answer.score, 0) +
      q9Score;

    // Determine risk level
    let riskLevel: "low" | "medium" | "high";
    if (totalScore <= 3) {
      riskLevel = "low";
    } else if (psychosocialScore < 4) {
      riskLevel = "medium";
    } else {
      riskLevel = "high";
    }

    return { totalScore, psychosocialScore, riskLevel };
  },
};
```

### Results Categories

```typescript
const resultCategories = {
  low: {
    name: "Lav risiko",
    description: "Total score ≤ 3",
    recommendation: "...",
  },
  medium: {
    name: "Mellem risiko",
    description: "Total score ≥ 4 og psykosocial score < 4",
    recommendation: "...",
  },
  high: {
    name: "Høj risiko",
    description: "Total score ≥ 4 og psykosocial score ≥ 4",
    recommendation: "...",
  },
};
```

## Technical Implementation Plan

### Database Schema

```typescript
interface StartBackSurveyResponse {
  id: string;
  createdAt: Date;
  answers: {
    questionId: string;
    answer: string;
    score: number;
  }[];
  results: {
    totalScore: number;
    psychosocialScore: number;
    riskLevel: string;
  };
}
```

### UI Components Needed

1. SurveyHeader

   - Title
   - Description
   - Progress indicator

2. QuestionCard

   - Question text
   - Radio button group for answers
   - Validation

3. ResultsDisplay
   - Total score
   - Psychosocial score
   - Risk level with explanation
   - Recommendations based on risk level

### Implementation Steps

1. [ ] Create survey configuration file with questions and scoring logic
2. [ ] Set up database table for survey responses
3. [ ] Implement UI components
   - [ ] Survey container
   - [ ] Question component with radio buttons
   - [ ] Progress indicator
   - [ ] Results display
4. [ ] Implement scoring logic
5. [ ] Add result explanations and recommendations
6. [ ] Add Danish language support
7. [ ] Implement analytics tracking
8. [ ] Test scoring accuracy

### Testing Requirements

1. Scoring Logic Tests

   - Test all possible combinations of answers
   - Verify special case for Q9
   - Validate risk level calculations

2. UI/UX Tests

   - Verify Danish text display
   - Test mobile responsiveness
   - Validate WCAG compliance

3. Integration Tests
   - Test data flow from UI to database
   - Verify result calculations and storage

## Analytics Requirements

Track:

- Completion rate
- Time spent per question
- Distribution of risk levels
- Most common answer patterns

## Next Steps

1. Review and approve PRD
2. Set up project structure
3. Begin implementation of core components
4. Implement scoring logic
5. Add UI/UX elements
6. Testing and validation
