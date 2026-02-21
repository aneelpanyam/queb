import type { SetupConfiguration } from './setup-config-types'

export const WORKBOOK_SEED_CONFIG: SetupConfiguration = {
  id: 'seed-config-place-workbook',
  name: 'Place Activity Workbook for Kids',
  description:
    'Create an activity workbook for children visiting a specific place. Specify the destination, age group, and difficulty — the AI generates engaging questions across multiple topics with short write-in answers and fun facts. Export to KDP-ready PDF with blank answer boxes and an answer key.',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  steps: [
    {
      id: 'step-place',
      name: 'Destination',
      description: 'Where are the kids going? Specify the place, country, and what makes it special.',
      fields: [
        {
          fieldId: 'empty-field',
          required: true,
          customName: 'place',
          customLabel: 'Place / Destination',
          customSelectionMode: 'single',
          promptOverride:
            'List 20 popular tourist destinations and landmarks that are great for kids and families. Include a mix of: national parks (Grand Canyon, Yellowstone), cities (London, Tokyo, Paris), historical sites (Pyramids of Giza, Machu Picchu), and natural wonders (Great Barrier Reef, Niagara Falls). Return each as a specific name.',
        },
        {
          fieldId: 'empty-field',
          required: false,
          customName: 'country',
          customLabel: 'Country / Region',
          customSelectionMode: 'single',
          promptOverride:
            'For the destination "{{place}}", list the country and 5-8 notable regions, states, or provinces near this destination that visitors might also explore. Include the primary country first.',
        },
        {
          fieldId: 'empty-field',
          required: false,
          customName: 'placeDescription',
          customLabel: 'What makes this place special?',
          customSelectionMode: 'single',
          promptOverride:
            'For the destination "{{place}}" in "{{country}}", describe in 8-10 short phrases what makes this place special for kids visiting. Focus on: unique animals, natural features, historical facts, cultural highlights, and fun activities. Each phrase should be 5-10 words.',
        },
      ],
    },
    {
      id: 'step-audience',
      name: 'Target Audience',
      description: 'Define the age group and difficulty for the workbook questions.',
      fields: [
        {
          fieldId: 'empty-field',
          required: true,
          customName: 'ageGroup',
          customLabel: 'Age Group',
          customSelectionMode: 'single',
          promptOverride:
            'List these age group options for children\'s activity books, one per line:\n- Ages 5-7 (Early Readers)\n- Ages 8-10 (Elementary)\n- Ages 10-12 (Upper Elementary)\n- Ages 12-14 (Middle School)\n- Ages 8-12 (General Kids)',
        },
        {
          fieldId: 'empty-field',
          required: true,
          customName: 'difficulty',
          customLabel: 'Difficulty Level',
          customSelectionMode: 'single',
          promptOverride:
            'List these difficulty levels for workbook questions:\n- Easy (simple recall questions, short answers)\n- Medium (understanding and application questions)\n- Hard (critical thinking and reasoning questions)\n- Mixed (variety of easy, medium, and hard)',
        },
      ],
    },
  ],
  outputs: [
    { outputTypeId: 'workbook' },
  ],
}
