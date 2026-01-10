import { v4 as uuidv4 } from 'uuid'
import { revenueDb, db, mentorsDb, sessionsDb, notesDb } from '../lib/database'

export function seedTestData() {
  console.log('🌱 Seeding test data...')

  // Professions to use
  const professions = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Analyst',
    'DevOps Engineer',
    'Mobile Developer',
    'UI/UX Designer',
    'Data Scientist'
  ]

  const countries = ['USA', 'Spain', 'Mexico', 'Argentina', 'Colombia', 'Chile']

  // Create 50 CV Analysis revenue records
  console.log('Creating CV Analysis revenue records...')
  for (let i = 0; i < 50; i++) {
    const profession = professions[Math.floor(Math.random() * professions.length)]
    const country = countries[Math.floor(Math.random() * countries.length)]
    const daysAgo = Math.floor(Math.random() * 30)
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - daysAgo)

    const revenueId = uuidv4()
    revenueDb.create({
      id: revenueId,
      type: 'cv_analysis',
      amount: 7,
      currency: 'usd',
      userEmail: `user${i}@example.com`,
      userName: `Test User ${i}`,
      profession,
      country,
      stripeSessionId: `cs_test_${uuidv4()}`,
      createdAt
    })

    // Also create CV Analysis record
    const analysisId = uuidv4()
    db.create({
      id: analysisId,
      email: `user${i}@example.com`,
      name: `Test User ${i}`,
      country,
      profession,
      cvFileName: `cv_${i}.pdf`,
      cvFilePath: `/uploads/cv_${i}.pdf`,
      paymentStatus: 'completed',
      analysisStatus: 'completed',
      createdAt,
      updatedAt: createdAt,
      analysisResult: {
        score: 70 + Math.floor(Math.random() * 25),
        atsScore: 65 + Math.floor(Math.random() * 30),
        problems: [],
        improvements: [],
        strengths: [],
        recommendations: []
      }
    })
  }

  // Create some mentors
  console.log('Creating mentors...')
  const mentorIds: string[] = []
  const mentorProfessions = ['Frontend', 'Backend', 'Full Stack', 'DevOps', 'Data Science']
  
  for (let i = 0; i < 5; i++) {
    const mentorId = uuidv4()
    mentorIds.push(mentorId)
    
    mentorsDb.create({
      id: mentorId,
      userId: uuidv4(),
      name: `Mentor ${i + 1}`,
      email: `mentor${i}@example.com`,
      bio: `Experienced ${mentorProfessions[i]} professional with 10+ years in the industry`,
      expertise: [mentorProfessions[i], 'Career Growth', 'Technical Interviews'],
      linkedinUrl: `https://linkedin.com/in/mentor${i}`,
      hourlyRate: 15 + (i * 10),
      totalSessions: 10 + i * 5,
      rating: 4.5 + (Math.random() * 0.5),
      reviewCount: 20 + i * 10,
      availability: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', timezone: 'America/New_York' },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', timezone: 'America/New_York' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', timezone: 'America/New_York' }
      ]
    })
  }

  // Create 20 Mentorship revenue records
  console.log('Creating Mentorship revenue records...')
  for (let i = 0; i < 20; i++) {
    const mentorId = mentorIds[Math.floor(Math.random() * mentorIds.length)]
    const amount = 15 + (Math.floor(Math.random() * 6) * 10) // $15-$65
    const daysAgo = Math.floor(Math.random() * 30)
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - daysAgo)

    const revenueId = uuidv4()
    revenueDb.create({
      id: revenueId,
      type: 'mentorship',
      amount,
      currency: 'usd',
      userEmail: `mentee${i}@example.com`,
      userName: `Mentee ${i}`,
      stripeSessionId: `cs_test_${uuidv4()}`,
      createdAt
    })

    // Create session record
    const sessionId = uuidv4()
    sessionsDb.create({
      id: sessionId,
      mentorId,
      menteeEmail: `mentee${i}@example.com`,
      menteeName: `Mentee ${i}`,
      scheduledAt: createdAt,
      duration: 10,
      status: 'completed',
      meetingLink: `https://meet.google.com/test-${i}`,
      paymentStatus: 'completed'
    })

    // Add some session notes
    if (Math.random() > 0.5) {
      const noteId = uuidv4()
      notesDb.create({
        id: noteId,
        sessionId,
        mentorId,
        content: `Great session discussing career growth and technical skills. Mentee showed strong interest in ${professions[Math.floor(Math.random() * professions.length)]}.`,
        topics: ['Career Growth', 'Technical Skills', 'Best Practices'],
        actionItems: ['Review the recommended resources', 'Practice coding challenges', 'Update LinkedIn profile'],
        nextSteps: ['Schedule follow-up in 2 weeks', 'Complete the coding project', 'Prepare questions for next session'],
        createdAt
      })

      // Update session with note
      sessionsDb.update(sessionId, {
        notes: [notesDb.findById(noteId)!]
      })
    }
  }

  console.log('✅ Test data seeded successfully!')
  console.log(`📊 Created:`)
  console.log(`   - 50 CV Analysis records ($350 revenue)`)
  console.log(`   - 20 Mentorship sessions (~$650 revenue)`)
  console.log(`   - 5 Mentors`)
  console.log(`   - ~10 Session notes`)
  console.log(`\n🎯 Total Revenue: ~$1,000`)
  console.log(`\n✨ Now visit: http://localhost:3000/admin/dashboard`)
}
