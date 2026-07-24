const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Event = require('./models/Event');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventopia';

const seedDatabase = async () => {
  try {
    console.log(`Connecting to database at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected.');

    // Clear existing data
    console.log('Cleaning existing Users and Events collections...');
    await User.deleteMany({});
    await Event.deleteMany({});
    console.log('Collections cleared.');

    // Create Admin User
    console.log('Creating Admin account...');
    const adminUser = new User({
      name: 'Eventopia Administrator',
      email: 'admin@eventopia.com',
      password: 'AdminPassword123',
      college: 'IIT Bombay',
      institutionType: 'IIT',
      role: 'admin',
      subscriptions: {
        subscribeAllInstitutes: true
      }
    });
    await adminUser.save();
    console.log('Admin account created successfully.');
    console.log('Username: admin@eventopia.com | Password: AdminPassword123');

    // Create Regular User
    console.log('Creating student account...');
    const normalUser = new User({
      name: 'Vishnu Sindhal',
      email: 'user@eventopia.com',
      password: 'UserPassword123',
      college: 'IIIT Surat',
      institutionType: 'IIIT',
      role: 'user',
      subscriptions: {
        institutes: ['IIIT Surat', 'IIT Bombay', 'NIT Trichy'],
        institutionTypes: ['IIT', 'IIIT'],
        categories: ['Hackathon', 'Technical', 'Coding Contest']
      }
    });
    await normalUser.save();
    console.log('Student account created successfully.');
    console.log('Username: user@eventopia.com | Password: UserPassword123');

    // 10 Detailed Events
    console.log('Creating 10 demo events...');
    const eventsData = [
      {
        title: 'Mood Indigo 2026',
        description: 'Mood Indigo is the annual cultural festival of IIT Bombay. Spanning four days, it is the largest college cultural festival in Asia, attracting over 150,000 students from all over India. Featuring celebrity concerts, theatrical shows, fine arts, literature events, and high-energy music competitions, Mood Indigo is a legendary platform for talent and creative expression.',
        type: 'Cultural Fest',
        college: 'IIT Bombay',
        institutionType: 'IIT',
        date: new Date('2026-12-18T09:00:00Z'),
        endDate: new Date('2026-12-21T22:00:00Z'),
        venue: 'Open Air Theater, Gymkhana Grounds, IIT Bombay campus',
        organizer: 'Mood Indigo Team, IIT Bombay Gymkhana',
        contact: 'mi-organizers@iitb.ac.in',
        registrationLink: 'https://moodi.org/register',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60',
        highlights: ['Asia\'s largest cultural festival', 'Live concerts featuring international and Bollywood artists', 'Competitions with prizes worth over 10 Lakhs', 'Creative workshops and panel discussions'],
        schedule: [
          { time: 'Day 1 - 10:00 AM', activity: 'Inauguration Ceremony followed by Street Play finals' },
          { time: 'Day 2 - 04:00 PM', activity: 'Acoustics & Fusion Music Competitions' },
          { time: 'Day 3 - 07:00 PM', activity: 'Popular Night - Live Band Concert' },
          { time: 'Day 4 - 06:00 PM', activity: 'Pro-Live Performance & Award Ceremony' }
        ],
        registrationDeadline: new Date('2026-12-10T23:59:59Z'),
        status: 'approved',
        createdBy: normalUser._id
      },
      {
        title: 'Kashiyatra 2026',
        description: 'Kashiyatra is the annual socio-cultural festival of IIT (BHU) Varanasi. Celebrated in the holy city of Varanasi, the festival embodies the heritage and spirit of the Ganges. It serves as a national-level platform for classical music, dance, visual arts, quizzes, fashion shows, and rock band standoffs. An experience of art, intellect, and spirituality combined.',
        type: 'Cultural Fest',
        college: 'IIT BHU',
        institutionType: 'IIT',
        date: new Date('2026-10-15T10:00:00Z'),
        endDate: new Date('2026-10-18T18:00:00Z'),
        venue: 'Swatantrata Bhawan, IIT BHU Campus, Varanasi',
        organizer: 'Kashiyatra Cultural Committee',
        contact: 'kashiyatra@iitbhu.ac.in',
        registrationLink: 'https://kashiyatra.org',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60',
        highlights: ['Varanasi socio-cultural experience', 'Theme-based band battles', 'National classical vocal & dance awards', 'Grand fashion parade'],
        schedule: [
          { time: '10:00 AM', activity: 'Opening address by the Director' },
          { time: '02:00 PM', activity: 'Literary debate and poetry sessions' },
          { time: '07:30 PM', activity: 'Fusion Night performance' }
        ],
        registrationDeadline: new Date('2026-10-05T23:59:59Z'),
        status: 'approved',
        createdBy: normalUser._id
      },
      {
        title: 'Pragyan Hackathon 2026',
        description: 'Pragyan is the internationally acclaimed techno-managerial organisation of NIT Trichy. This flagship hackathon invites programmers, developers, designers, and system architects to collaborate and build innovative solutions for global real-world challenges. Focus tracks include Web3, FinTech, Sustainability, and Healthcare. Mentorship from industry experts and massive cash prizes make it a premier technical event.',
        type: 'Hackathon',
        college: 'NIT Trichy',
        institutionType: 'NIT',
        date: new Date('2026-08-28T08:00:00Z'),
        endDate: new Date('2026-08-30T17:00:00Z'),
        venue: 'Orion Hall & Computer Support Group, NIT Trichy',
        organizer: 'Pragyan Technical Team',
        contact: 'hackathon@pragyan.org',
        registrationLink: 'https://pragyan.org/hackathon',
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60',
        highlights: ['36-Hour continuous hacking event', 'Mentors from Google, Microsoft, and AWS', 'Dedicated tracks for AI/ML and Blockchain', 'Prizes & recruitment opportunities'],
        schedule: [
          { time: '08:00 AM', activity: 'Team Registration and Setup' },
          { time: '09:30 AM', activity: 'Problem Statements Release & Coding Starts' },
          { time: 'Next Day 02:00 PM', activity: 'Mid-way Progress Evaluation' },
          { time: 'Final Day 03:00 PM', activity: 'Pitching & Presentation to Jury' }
        ],
        registrationDeadline: new Date('2026-08-20T23:59:59Z'),
        status: 'approved',
        createdBy: normalUser._id
      },
      {
        title: 'IIIT Hyderabad Felicity 2026',
        description: 'Felicity is IIIT Hyderabad\'s annual techno-cultural festival. Bringing together the best of both worlds, it features cutting-edge coding competitions, robotics arenas, game development challenges, as well as captivating art exhibits, drama nights, and a high-profile EDM concert. It celebrates the unique technical prowess and diverse creativity of IIIT-H.',
        type: 'Technical',
        college: 'IIIT Hyderabad',
        institutionType: 'IIIT',
        date: new Date('2026-09-12T09:00:00Z'),
        endDate: new Date('2026-09-14T20:00:00Z'),
        venue: 'Felicity Grounds & Main Audi, IIIT Hyderabad Campus',
        organizer: 'Felicity Student Council',
        contact: 'felicity@iiit.ac.in',
        registrationLink: 'https://felicity.iiit.ac.in',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60',
        highlights: ['National coding contest "Threads"', 'Robowars championship', 'Standup comedy & EDM night', 'Gaming tournament (Valorant, FIFA)'],
        schedule: [
          { time: '09:00 AM', activity: 'Registration & Tech Talks' },
          { time: '01:00 PM', activity: 'Robotics qualifiers' },
          { time: '07:00 PM', activity: 'EDM night featuring international DJ' }
        ],
        registrationDeadline: new Date('2026-09-08T23:59:59Z'),
        status: 'approved',
        createdBy: normalUser._id
      },
      {
        title: 'Inter-IIT Tech Meet 14.0',
        description: 'The Inter-IIT Tech Meet is the annual pan-IIT technical competition where student contingents from all 23 IITs compete across multiple intense, high-impact challenges. Hosted by IIT Madras this year, the tech meet presents industry-sponsored problem statements from companies like ISRO, DRDO, Jaguar Land Rover, and Microsoft. Over three days, students showcase revolutionary ideas, research projects, and functional prototypes.',
        type: 'Tech Fest',
        college: 'IIT Madras',
        institutionType: 'IIT',
        date: new Date('2026-11-05T08:00:00Z'),
        endDate: new Date('2026-11-08T18:00:00Z'),
        venue: 'IC&SR Auditorium, IIT Madras',
        organizer: 'Inter-IIT Tech Committee, IIT Madras',
        contact: 'techmeet14@iitm.ac.in',
        registrationLink: 'https://interiit-tech.org',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60',
        highlights: ['High-stakes pan-IIT competition', 'Real-world problem statements by ISRO and DRDO', 'Product design, software, and hardware tracks', 'Technical networking with top companies'],
        schedule: [
          { time: 'Day 1 - 09:00 AM', activity: 'Inaugural and High Prep projects presentation' },
          { time: 'Day 2 - 10:00 AM', activity: 'Coding and Data Science challenge evaluations' },
          { time: 'Day 3 - 11:00 AM', activity: 'Hardware and Drone demonstration' },
          { time: 'Day 4 - 04:00 PM', activity: 'Closing ceremony & Championship Trophy declaration' }
        ],
        registrationDeadline: new Date('2026-10-25T23:59:59Z'),
        status: 'approved',
        createdBy: normalUser._id
      },
      {
        title: 'ACM ICPC Regional Selection',
        description: 'The ACM International Collegiate Programming Contest is the premier global competitive programming competition. IIIT Gwalior is proud to host the regional selection round for North-Central India. Teams of three students will work together to solve a complex set of algorithmic and mathematical problems in a restricted 5-hour time window. Only one team per computer!',
        type: 'Coding Contest',
        college: 'IIIT Gwalior',
        institutionType: 'IIIT',
        date: new Date('2026-09-20T08:30:00Z'),
        endDate: new Date('2026-09-20T17:30:00Z'),
        venue: 'Central Computer Center, IIIT Gwalior',
        organizer: 'Department of CSE & Programming Club',
        contact: 'icpc-regional@iiitm.ac.in',
        registrationLink: 'https://icpc.global',
        image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=60',
        highlights: ['Official path to ICPC World Finals', '5-hour intense algorithmic contest', 'Top competitive programmers in the country', 'Sponsorship by JetBrains and AWS'],
        schedule: [
          { time: '08:30 AM', activity: 'Practice session and environment setup' },
          { time: '10:00 AM', activity: 'Main Contest starts (Strictly 5 Hours)' },
          { time: '03:00 PM', activity: 'Contest ends, system lock' },
          { time: '04:00 PM', activity: 'Problem discussion and results ceremony' }
        ],
        registrationDeadline: new Date('2026-09-10T23:59:59Z'),
        status: 'approved',
        createdBy: normalUser._id
      },
      {
        title: 'Srijan Hackathon 2.0',
        description: 'Srijan is the flagship hackathon organized by IIIT Surat. With a goal of promoting innovation and building projects that aid community development, this 24-hour hackathon tasks students with building software or hardware solutions for local administration, student helper portals, or waste management trackers. Come build something that matters!',
        type: 'Hackathon',
        college: 'IIIT Surat',
        institutionType: 'IIIT',
        date: new Date('2026-10-22T09:00:00Z'),
        endDate: new Date('2026-10-23T12:00:00Z'),
        venue: 'Lab Block Sem Hall, IIIT Surat',
        organizer: 'Srijan Coding Club, IIIT Surat',
        contact: 'srijan@iiitsurat.ac.in',
        registrationLink: 'https://srijan-iiitsurat.github.io',
        image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=60',
        highlights: ['Focus on community helper applications', 'Great for beginners and intermediates', 'On-site mentorship by local tech leaders', 'Internship opportunities for top performers'],
        schedule: [
          { time: '09:00 AM', activity: 'Registration & breakfast' },
          { time: '10:00 AM', activity: 'Hackathon begins' },
          { time: 'Next Day 10:00 AM', activity: 'Coding stops & evaluation starts' }
        ],
        registrationDeadline: new Date('2026-10-18T23:59:59Z'),
        status: 'approved',
        createdBy: normalUser._id
      },
      {
        // PENDING EVENT FOR DEMOING ADMIN APPROVAL
        title: 'Incident 2026 - National Battle of Bands',
        description: 'The National Battle of Bands at Incident (NIT Surathkal\'s cultural fest) is the ultimate battleground for semi-professional rock and fusion bands across India. Competing for fame, bragging rights, and a massive cash prize, bands will bring their absolute best sets of original compositions and covers to light up the beachside amphitheater.',
        type: 'Cultural Fest',
        college: 'NIT Surathkal',
        institutionType: 'NIT',
        date: new Date('2026-12-05T16:00:00Z'),
        endDate: new Date('2026-12-05T22:30:00Z'),
        venue: 'Beachside Amphitheater, NIT Surathkal Campus',
        organizer: 'Incident Committee, NITK',
        contact: 'incident@nitk.edu.in',
        registrationLink: 'https://incident.nitk.ac.in/bob',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60',
        highlights: ['Beachside stage and rock setup', 'Judging by legendary Indian rock artists', 'Travel and stay allowances for selected bands'],
        schedule: [
          { time: '04:00 PM', activity: 'Sound checks and slot draws' },
          { time: '06:00 PM', activity: 'Bands start competing (15 mins slots)' },
          { time: '09:30 PM', activity: 'Guest headliner performance & winner announcement' }
        ],
        registrationDeadline: new Date('2026-11-20T23:59:59Z'),
        status: 'pending',
        createdBy: normalUser._id
      },
      {
        // PENDING EVENT FOR DEMOING ADMIN APPROVAL
        title: 'Shaastra 2026 - AI in Healthcare Seminar',
        description: 'As part of Shaastra, IIT Madras\'s technical festival, this seminar focuses on the revolution of artificial intelligence in clinical diagnostics and drug discovery. The event features keynote presentations from leading oncologists, senior machine learning engineers from Google Health, and pioneering biotech founders. An essential event for anyone interested in bioinformatics and digital medicine.',
        type: 'Seminar',
        college: 'IIT Madras',
        institutionType: 'IIT',
        date: new Date('2026-11-12T10:00:00Z'),
        endDate: new Date('2026-11-12T16:00:00Z'),
        venue: 'Homi Bhabha Auditorium, IIT Madras',
        organizer: 'Shaastra Relations & Tech Committee',
        contact: 'seminar@shaastra.org',
        registrationLink: 'https://shaastra.org/ai-healthcare',
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60',
        highlights: ['Keynote panels with MDs and ML PhDs', 'Live case study reviews', 'Q&A session and networking luncheon'],
        schedule: [
          { time: '10:00 AM', activity: 'Welcome address & Intro to AI in Diagnostics' },
          { time: '11:30 AM', activity: 'Keynote Panel: Generative AI for Drug Synthesis' },
          { time: '01:00 PM', activity: 'Networking lunch' },
          { time: '02:30 PM', activity: 'Student research papers display & feedback session' }
        ],
        registrationDeadline: new Date('2026-11-08T23:59:59Z'),
        status: 'pending',
        createdBy: normalUser._id
      },
      {
        // PENDING EVENT FOR DEMOING ADMIN APPROVAL
        title: 'National College Basketball Championship',
        description: 'NIT Warangal hosts the annual National Inter-College Basketball Championship. Teams from top IITs, NITs, and regional state colleges will clash in a league-cum-knockout format to win the coveted Warangal Arena Trophy. The tournament follows official FIBA rules and is refereed by state-level officials.',
        type: 'Sports Event',
        college: 'NIT Warangal',
        institutionType: 'NIT',
        date: new Date('2026-09-05T07:30:00Z'),
        endDate: new Date('2026-09-08T18:00:00Z'),
        venue: 'Indoor Sports Arena, NIT Warangal',
        organizer: 'Sports Association NITW',
        contact: 'sports@nitw.ac.in',
        registrationLink: 'https://sports.nitw.ac.in',
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=60',
        highlights: ['Professional wooden indoor court setup', 'Standard FIBA match guidelines', 'Certificates and cash awards for winners and runners-up'],
        schedule: [
          { time: 'Day 1 - 08:00 AM', activity: 'League matches start (simultaneous courts)' },
          { time: 'Day 2 - 09:00 AM', activity: 'Quarterfinals and Semifinals' },
          { time: 'Day 3 - 03:00 PM', activity: 'Third place play-off and Grand Finale match' }
        ],
        registrationDeadline: new Date('2026-08-25T23:59:59Z'),
        status: 'pending',
        createdBy: normalUser._id
      }
    ];

    console.log('Inserting events...');
    await Event.insertMany(eventsData);
    console.log('Events inserted successfully.');

    console.log('====================================================');
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Created accounts:');
    console.log('  1. ADMIN: email="admin@eventopia.com" password="AdminPassword123"');
    console.log('  2. USER:  email="user@eventopia.com"  password="UserPassword123"');
    console.log('Created events: 10 total (7 approved, 3 pending)');
    console.log('====================================================');

    await mongoose.disconnect();
    console.log('Database disconnected. Seed process finished.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding the database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();
