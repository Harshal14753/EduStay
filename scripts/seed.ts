
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.accommodationListing.deleteMany();
  await prisma.foodServiceListing.deleteMany();
  await prisma.university.deleteMany();
  await prisma.user.deleteMany();

  // Create universities
  const universities = await prisma.university.createMany({
    data: [
      { id: 'iit_bombay', name: 'IIT Bombay', stream: 'ENGINEERING', city: 'Mumbai', state: 'Maharashtra' },
      { id: 'iit_delhi', name: 'IIT Delhi', stream: 'ENGINEERING', city: 'Delhi', state: 'Delhi' },
      { id: 'bits_pilani', name: 'BITS Pilani', stream: 'ENGINEERING', city: 'Pilani', state: 'Rajasthan' },
      { id: 'nit_trichy', name: 'NIT Trichy', stream: 'ENGINEERING', city: 'Tiruchirappalli', state: 'Tamil Nadu' },
      { id: 'aiims_delhi', name: 'AIIMS Delhi', stream: 'MEDICAL', city: 'Delhi', state: 'Delhi' },
      { id: 'pgimer_chandigarh', name: 'PGIMER Chandigarh', stream: 'MEDICAL', city: 'Chandigarh', state: 'Chandigarh' },
      { id: 'jipmer_puducherry', name: 'JIPMER Puducherry', stream: 'MEDICAL', city: 'Puducherry', state: 'Puducherry' },
      { id: 'kmc_manipal', name: 'KMC Manipal', stream: 'MEDICAL', city: 'Manipal', state: 'Karnataka' }
    ]
  });

  console.log('✅ Created universities');

  // Create test account (required)
  const testAccountPassword = await bcrypt.hash('johndoe123', 12);
  const testAccount = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@doe.com',
      password: testAccountPassword,
      phone: '9999999999',
      userType: 'STUDENT',
      university: 'iit_bombay',
      stream: 'ENGINEERING',
      serviceType: 'BOTH'
    }
  });

  // Create sample students
  const students = [];
  const studentData = [
    { name: 'Rahul Sharma', email: 'rahul.sharma@student.edu', phone: '9876543210', university: 'iit_bombay', stream: 'ENGINEERING', serviceType: 'BOTH' },
    { name: 'Priya Patel', email: 'priya.patel@student.edu', phone: '9876543211', university: 'aiims_delhi', stream: 'MEDICAL', serviceType: 'ACCOMMODATION' },
    { name: 'Amit Kumar', email: 'amit.kumar@student.edu', phone: '9876543212', university: 'bits_pilani', stream: 'ENGINEERING', serviceType: 'FOOD' },
    { name: 'Sneha Reddy', email: 'sneha.reddy@student.edu', phone: '9876543213', university: 'nit_trichy', stream: 'ENGINEERING', serviceType: 'BOTH' },
    { name: 'Arjun Singh', email: 'arjun.singh@student.edu', phone: '9876543214', university: 'iit_delhi', stream: 'ENGINEERING', serviceType: 'ACCOMMODATION' }
  ];

  for (const student of studentData) {
    const hashedPassword = await bcrypt.hash('student123', 12);
    const createdStudent = await prisma.user.create({
      data: {
        ...student,
        password: hashedPassword,
        userType: 'STUDENT',
        stream: student.stream as any,
        serviceType: student.serviceType as any
      }
    });
    students.push(createdStudent);
  }

  console.log('✅ Created students');

  // Create sample property owners
  const owners = [];
  const ownerData = [
    { name: 'Rajesh Properties', email: 'rajesh@properties.com', phone: '9876540001', businessType: 'COMPANY' },
    { name: 'Sunita PG Services', email: 'sunita@pgservices.com', phone: '9876540002', businessType: 'INDIVIDUAL' },
    { name: 'Mumbai Student Housing', email: 'info@mumbaihousing.com', phone: '9876540003', businessType: 'COMPANY' },
    { name: 'Delhi Food Services', email: 'delhi@foodservices.com', phone: '9876540004', businessType: 'COMPANY' },
    { name: 'Anita Tiffin Center', email: 'anita@tiffin.com', phone: '9876540005', businessType: 'INDIVIDUAL' },
    { name: 'Campus Hostel Group', email: 'info@campushostel.com', phone: '9876540006', businessType: 'INSTITUTION' }
  ];

  for (const owner of ownerData) {
    const hashedPassword = await bcrypt.hash('owner123', 12);
    const createdOwner = await prisma.user.create({
      data: {
        ...owner,
        password: hashedPassword,
        userType: 'PROPERTY_OWNER',
        businessType: owner.businessType as any
      }
    });
    owners.push(createdOwner);
  }

  console.log('✅ Created property owners');

  // Create accommodation listings
  const accommodationImages = [
    'https://websiteupload.s3.ap-south-1.amazonaws.com/2024/05/omi01986-hdr.jpg',
    'https://i.pinimg.com/736x/eb/fe/2d/ebfe2dff8ccd7ed0282745dec414b3fb.jpg',
    'https://www.terrapinrow.com/wp-content/uploads/sites/31/2024/07/4-Bedroom-Kitchen.jpg',
    'https://www.studenthq.co.uk/files/images/students-in-housing.jpg',
    'https://www.ysuites.co/wp-content/uploads/2022/03/Studio-Apartments-in-Australia-for-students.jpg',
    'https://www.ashrayliving.com/upload/1753804272what%20is%20coliving.png',
    'https://img.cofynd.com/images/original/98c71cd83dedf831af67be8409cb204a3e503d7e.jpg',
    'https://cdn.scape.com.au/cdn-cgi/imagedelivery/TOESH0qEsuV1ljtDfMkhNw/86711853-e1f6-448d-64d4-8b5368839f00/w=1024,h=683'
  ];

  const accommodations = [];
  const accommodationData = [
    {
      propertyName: 'Cozy PG near IIT Bombay',
      monthlyRent: 15000,
      deposit: 10000,
      roomType: 'SINGLE',
      accommodationType: 'PG',
      foodPreference: 'VEG',
      address: '15/A, Powai Colony, Near IIT Bombay Main Gate, Mumbai - 400076',
      contactInfo: '9876540001',
      description: 'Well-maintained PG with all modern amenities, just 5 minutes walk from IIT Bombay campus.',
      nearbyUniversities: ['IIT Bombay'],
      amenities: ['WiFi', 'AC', 'Laundry', 'Security', 'Mess'],
      livingPreferences: ['Students Only', 'No Smoking'],
      ownerId: owners[0].id,
      photos: [accommodationImages[0], accommodationImages[1]]
    },
    {
      propertyName: 'Student Hostel - Powai',
      monthlyRent: 12000,
      deposit: 8000,
      roomType: 'DOUBLE',
      accommodationType: 'HOSTEL',
      foodPreference: 'BOTH',
      address: 'Plot 42, Hiranandani Gardens, Powai, Mumbai - 400076',
      contactInfo: '9876540002',
      description: 'Modern hostel facility with gym, study room, and recreational activities.',
      nearbyUniversities: ['IIT Bombay'],
      amenities: ['WiFi', 'Gym', 'Study Room', 'Security', 'Parking'],
      livingPreferences: ['Co-ed', 'No Visitors After 10 PM'],
      ownerId: owners[1].id,
      photos: [accommodationImages[2], accommodationImages[3]]
    },
    {
      propertyName: 'Premium Studio Apartment',
      monthlyRent: 25000,
      deposit: 20000,
      roomType: 'STUDIO',
      accommodationType: 'APARTMENT',
      foodPreference: 'BOTH',
      address: 'Tower C, Vaswani Reserve, Kalyani Nagar, Pune - 411014',
      contactInfo: '9876540003',
      description: 'Fully furnished studio apartment with kitchen, perfect for graduate students.',
      nearbyUniversities: ['BITS Pilani'],
      amenities: ['WiFi', 'AC', 'Parking', 'Security', 'Kitchen'],
      livingPreferences: ['Graduate Students', 'Professional Environment'],
      ownerId: owners[2].id,
      photos: [accommodationImages[4], accommodationImages[5]]
    },
    {
      propertyName: 'Budget-Friendly Sharing Room',
      monthlyRent: 8000,
      deposit: 5000,
      roomType: 'SHARING',
      accommodationType: 'PG',
      foodPreference: 'VEG',
      address: 'Sector 14, Near PGIMER, Chandigarh - 160014',
      contactInfo: '9876540004',
      description: 'Affordable sharing accommodation for medical students near PGIMER.',
      nearbyUniversities: ['PGIMER Chandigarh'],
      amenities: ['WiFi', 'Laundry', 'Study Area'],
      livingPreferences: ['Medical Students Only', 'Quiet Environment'],
      ownerId: owners[3].id,
      photos: [accommodationImages[6], accommodationImages[7]]
    },
    {
      propertyName: 'Luxury PG for Girls',
      monthlyRent: 18000,
      deposit: 15000,
      roomType: 'SINGLE',
      accommodationType: 'PG',
      foodPreference: 'VEG',
      address: '23/B, Karol Bagh, Near Delhi University, New Delhi - 110005',
      contactInfo: '9876540005',
      description: 'Premium PG accommodation for girls with 24/7 security and all facilities.',
      nearbyUniversities: ['IIT Delhi', 'AIIMS Delhi'],
      amenities: ['WiFi', 'AC', 'Security', 'Mess', 'Laundry', 'Study Room'],
      livingPreferences: ['Girls Only', '24/7 Security', 'No Male Visitors'],
      ownerId: owners[4].id,
      photos: [accommodationImages[0], accommodationImages[2]]
    },
    {
      propertyName: 'Modern Flat for Students',
      monthlyRent: 20000,
      deposit: 15000,
      roomType: 'DOUBLE',
      accommodationType: 'FLAT',
      foodPreference: 'BOTH',
      address: 'Flat 301, Sunrise Apartments, Anna Nagar, Chennai - 600040',
      contactInfo: '9876540006',
      description: 'Spacious 2BHK flat perfect for engineering students, close to college.',
      nearbyUniversities: ['NIT Trichy'],
      amenities: ['WiFi', 'AC', 'Parking', 'Kitchen'],
      livingPreferences: ['Engineering Students', 'Shared Cooking'],
      ownerId: owners[5].id,
      photos: [accommodationImages[3], accommodationImages[4]]
    }
  ];

  for (const accommodationInfo of accommodationData) {
    const accommodation = await prisma.accommodationListing.create({
      data: {
        ...accommodationInfo,
        dailyRate: Math.max(1, Math.round(accommodationInfo.monthlyRent / 30)),
        roomType: accommodationInfo.roomType as any,
        accommodationType: accommodationInfo.accommodationType as any,
        foodPreference: accommodationInfo.foodPreference as any
      }
    });
    accommodations.push(accommodation);
  }

  console.log('✅ Created accommodation listings');

  // Create food service listings
  const foodImages = [
    'http://tiffinstash.com/cdn/shop/articles/5April24_1.jpg?v=1713765219',
    'https://sukhis.com/app/uploads/2022/05/image2-3.jpg',
    'https://chinese4kids.net/wp-content/uploads/2023/09/fast-food-vocabulary.jpg',
    'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiUyWEyTyX-MZuTKnfmbjPfueyraWerqgAj_LH5dapz8cCBv3CUTettD-N6OqjDCtzf352kJn-UssPPsHqVhgka7BAZrDOSLX_b17f5obeqUJNvjA6mjZHeyES-TAOOybYH1Mg46AN4t_c/s1600/image2.jpg',
    'https://blog.schoolspecialty.com/wp-content/uploads/2019/12/Designing_School_Cafeterias_Support_Informal_Learning_Opportunities-1200x624.jpg',
    'https://www.hauteandhealthyliving.com/wp-content/uploads/2021/09/Healthy-Kids-Breakfast-Ideas-main-picture-scaled.jpg'
  ];

  const foodServices = [];
  const foodServiceData = [
    {
      serviceName: 'South Indian Tiffin Express',
      serviceType: 'TIFFIN_SERVICE',
      priceRange: 'BUDGET',
      address: 'Shop 15, Powai Market, Near IIT Bombay, Mumbai - 400076',
      contactInfo: 'anita@tiffin.com',
      description: 'Authentic South Indian meals delivered fresh daily. Specializing in dosa, idli, sambar.',
      operatingHours: '7:00 AM - 9:00 PM',
      cuisineType: ['South Indian', 'Breakfast', 'Snacks'],
      vegOptions: true,
      nonVegOptions: false,
      deliveryAvailable: true,
      ownerId: owners[4].id,
      photos: [foodImages[0], foodImages[5]]
    },
    {
      serviceName: 'Campus Mess - North Indian',
      serviceType: 'MESS',
      priceRange: 'BUDGET',
      address: '12/A, Student Colony, Sector 15, Chandigarh - 160015',
      contactInfo: '9876540007',
      description: 'Traditional North Indian mess serving unlimited meals for students.',
      operatingHours: '8:00 AM - 10:00 PM',
      cuisineType: ['North Indian', 'Punjabi'],
      vegOptions: true,
      nonVegOptions: true,
      deliveryAvailable: false,
      ownerId: owners[3].id,
      photos: [foodImages[1], foodImages[4]]
    },
    {
      serviceName: 'Dragon Palace Chinese',
      serviceType: 'RESTAURANT',
      priceRange: 'MODERATE',
      address: 'FC Road, Near Fergusson College, Pune - 411004',
      contactInfo: '9876540008',
      description: 'Popular Chinese restaurant among students, known for quick service and affordable prices.',
      operatingHours: '12:00 PM - 11:00 PM',
      cuisineType: ['Chinese', 'Fast Food', 'Indo-Chinese'],
      vegOptions: true,
      nonVegOptions: true,
      deliveryAvailable: true,
      ownerId: owners[0].id,
      photos: [foodImages[2], foodImages[3]]
    },
    {
      serviceName: 'Continental Corner Cafe',
      serviceType: 'CAFE',
      priceRange: 'MODERATE',
      address: 'Ground Floor, Student Center, IIT Delhi, New Delhi - 110016',
      contactInfo: '9876540009',
      description: 'Cozy cafe serving continental breakfast, sandwiches, and beverages.',
      operatingHours: '7:00 AM - 10:00 PM',
      cuisineType: ['Continental', 'Beverages', 'Snacks'],
      vegOptions: true,
      nonVegOptions: false,
      deliveryAvailable: false,
      ownerId: owners[1].id,
      photos: [foodImages[3], foodImages[5]]
    },
    {
      serviceName: 'Student Canteen Deluxe',
      serviceType: 'CANTEEN',
      priceRange: 'BUDGET',
      address: 'Building 2, Ground Floor, NIT Campus, Tiruchirappalli - 620015',
      contactInfo: '9876540010',
      description: 'Large capacity canteen serving variety of meals for engineering students.',
      operatingHours: '6:00 AM - 10:00 PM',
      cuisineType: ['North Indian', 'South Indian', 'Snacks'],
      vegOptions: true,
      nonVegOptions: true,
      deliveryAvailable: false,
      ownerId: owners[5].id,
      photos: [foodImages[4], foodImages[1]]
    },
    {
      serviceName: 'Healthy Bites Tiffin',
      serviceType: 'TIFFIN_SERVICE',
      priceRange: 'MODERATE',
      address: 'Manipal University Area, Manipal - 576104',
      contactInfo: '9876540011',
      description: 'Health-focused tiffin service with organic ingredients and balanced nutrition.',
      operatingHours: '8:00 AM - 8:00 PM',
      cuisineType: ['North Indian', 'South Indian', 'Continental'],
      vegOptions: true,
      nonVegOptions: true,
      deliveryAvailable: true,
      ownerId: owners[2].id,
      photos: [foodImages[5], foodImages[0]]
    }
  ];

  for (const foodServiceInfo of foodServiceData) {
    const foodService = await prisma.foodServiceListing.create({
      data: {
        ...foodServiceInfo,
        serviceType: foodServiceInfo.serviceType as any,
        priceRange: foodServiceInfo.priceRange as any
      }
    });
    foodServices.push(foodService);
  }

  console.log('✅ Created food service listings');

  // Create sample reviews
  const reviewData = [
    // Accommodation Reviews
    { rating: 5, comment: 'Excellent PG with great facilities and very clean rooms!', userId: students[0].id, accommodationListingId: accommodations[0].id },
    { rating: 4, comment: 'Good location near campus, but WiFi could be better.', userId: students[1].id, accommodationListingId: accommodations[0].id },
    { rating: 5, comment: 'Best hostel experience! Great community and facilities.', userId: students[2].id, accommodationListingId: accommodations[1].id },
    { rating: 4, comment: 'Studio is well-furnished but slightly expensive.', userId: students[3].id, accommodationListingId: accommodations[2].id },
    { rating: 3, comment: 'Decent place for the price, basic amenities provided.', userId: students[4].id, accommodationListingId: accommodations[3].id },
    { rating: 5, comment: 'Very safe and secure for girls, highly recommended!', userId: students[1].id, accommodationListingId: accommodations[4].id },
    
    // Food Service Reviews
    { rating: 5, comment: 'Amazing South Indian food, tastes just like home!', userId: students[0].id, foodServiceListingId: foodServices[0].id },
    { rating: 4, comment: 'Good variety and unlimited meals, value for money.', userId: students[2].id, foodServiceListingId: foodServices[1].id },
    { rating: 4, comment: 'Fast service and tasty Chinese food, perfect for students.', userId: students[3].id, foodServiceListingId: foodServices[2].id },
    { rating: 5, comment: 'Great ambiance for study sessions, excellent coffee!', userId: students[1].id, foodServiceListingId: foodServices[3].id },
    { rating: 3, comment: 'Large portions but food quality varies sometimes.', userId: students[4].id, foodServiceListingId: foodServices[4].id },
    { rating: 5, comment: 'Healthy options and on-time delivery, very satisfied!', userId: students[0].id, foodServiceListingId: foodServices[5].id }
  ];

  for (const review of reviewData) {
    await prisma.review.create({
      data: review
    });
  }

  console.log('✅ Created reviews');

  // Create sample inquiries
  const inquiryData = [
    {
      message: 'Hi, I am interested in visiting your PG this weekend. What would be the best time?',
      studentName: 'Rahul Sharma',
      studentEmail: 'rahul.sharma@student.edu',
      studentPhone: '9876543210',
      status: 'PENDING',
      studentId: students[0].id,
      accommodationListingId: accommodations[0].id
    },
    {
      message: 'Do you provide meal plans? What are the monthly charges including food?',
      studentName: 'Priya Patel',
      studentEmail: 'priya.patel@student.edu',
      studentPhone: '9876543211',
      status: 'PENDING',
      studentId: students[1].id,
      foodServiceListingId: foodServices[0].id
    },
    {
      message: 'Is the hostel room available for immediate occupancy? I need to move in next week.',
      studentName: 'Amit Kumar',
      studentEmail: 'amit.kumar@student.edu',
      studentPhone: '9876543212',
      status: 'RESPONDED',
      response: 'Yes, we have rooms available. Please call us to schedule a visit.',
      studentId: students[2].id,
      accommodationListingId: accommodations[1].id
    },
    {
      message: 'What are the delivery timings and minimum order requirements?',
      studentName: 'Sneha Reddy',
      studentEmail: 'sneha.reddy@student.edu',
      studentPhone: '9876543213',
      status: 'RESPONDED',
      response: 'We deliver between 12 PM - 8 PM. Minimum order is ₹100.',
      studentId: students[3].id,
      foodServiceListingId: foodServices[2].id
    }
  ];

  for (const inquiry of inquiryData) {
    await prisma.inquiry.create({
      data: {
        ...inquiry,
        status: inquiry.status as any
      }
    });
  }

  console.log('✅ Created inquiries');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Seeded data summary:');
  console.log(`- Universities: 8`);
  console.log(`- Students: 6 (including test account)`);
  console.log(`- Property Owners: 6`);
  console.log(`- Accommodation Listings: 6`);
  console.log(`- Food Service Listings: 6`);
  console.log(`- Reviews: 12`);
  console.log(`- Inquiries: 4`);
  console.log('\n🔐 Test Account:');
  console.log('Email: john@doe.com');
  console.log('Password: johndoe123');
  console.log('Type: STUDENT');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
