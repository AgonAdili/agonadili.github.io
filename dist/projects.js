/*
 * The projects in the Work section, in display order.
 *
 * Featured projects get the large cards; when there is an odd number of them, the last card spans
 * the full width. Every other project appears in the "More projects" list. Each card and row opens
 * the same detail panel, and every project has its own link: https://agonadili.github.io/#work/<slug>
 *
 *   slug          Short id used in the link: lowercase, no spaces.
 *   name          Project name.
 *   tagline       One line, about eight words.
 *   type          For example 'Web application', 'Website', 'Mobile app' or 'ERP'.
 *   year          Shown on the card badge, in the list and in the panel.
 *   role, stack   Optional facts in the panel, for example 'Design & development' and ['Vue', 'Laravel'].
 *   description   Two to four sentences: the problem, what you built, the result.
 *   highlights    Three or four short points.
 *   links         Buttons in the panel, for example [{ label: 'Visit site', url: 'https://…' }].
 *   image         Screenshot in assets/projects/: 1800 × 1240 WebP named after the slug. imageAlt describes it.
 *                 Until a screenshot is ready, use './assets/projects/placeholder.svg'.
 *   background    Colour behind the image, matched to its top-left corner (or, on a full-width card with
 *                 feature text, to its left edge); dark colours switch the card's labels to light text.
 *   concept       true marks an illustrative concept rather than shipped work.
 *   featured      true puts the project in the large cards.
 *   feature       Optional text for a full-width card: { kicker, title: ['Line one', 'Line two'], caption }.
 */
export const projects = [
  {
    slug: 'eacore',
    name: 'EACore',
    tagline: 'People, fleet, stock and money in one system.',
    type: 'ERP',
    year: 2026,
    role: 'Design, development & deployment',
    stack: ['Django', 'Python', 'MySQL', 'Tailwind CSS', 'ReportLab'],
    description: 'An ERP for a construction company that grew from a payroll tool into 17 connected modules: HR and payroll, fleet and maintenance, warehouses, procurement, accounting, receivables, a document archive and construction records. Approvals and notifications carry work between departments.',
    highlights: ['17 connected modules', 'Payroll & attendance', 'Fleet & maintenance', 'Procurement to accounting'],
    image: './assets/projects/eacore.webp',
    imageAlt: 'EACore home screen in Macedonian: counts of overdue invoices, payments due and low stock, a list of approvals waiting, and shortcuts to every module.',
    background: '#e8ebed',
    featured: true,
  },
  {
    slug: 'avtoprime',
    name: 'AvtoPrime',
    tagline: 'A car marketplace with instant search and live chat.',
    type: 'Web application',
    year: 2026,
    role: 'Design & development',
    stack: ['Next.js', 'NestJS', 'Prisma', 'Typesense', 'Stripe', 'Socket.IO'],
    description: 'A marketplace for buying and selling cars. Sellers list cars with photos and can pay to promote them; buyers search instantly, save searches, compare cars and message sellers in real time. The API also handles payments, image uploads and sign-in with Google or Apple.',
    highlights: ['Instant search', 'Live messaging', 'Paid promotions', 'Google & Apple sign-in'],
    image: './assets/projects/avtoprime.webp',
    imageAlt: 'AvtoPrime listings page: search filters beside a grid of cars for sale, with promoted listings outlined in gold.',
    background: '#eef1f6',
    featured: true,
  },
  {
    slug: 'stock-management',
    name: 'Stock Management',
    tagline: 'Sales, stock and invoices for a trading company.',
    type: 'Business software',
    year: 2026,
    role: 'Design & development',
    stack: ['React', 'TypeScript', 'Vite', 'Node.js', 'SQLite', 'Tailwind CSS'],
    description: 'A private workspace that replaced a company’s legacy system. Products and stock, customers and suppliers, sales invoices, purchase orders, deliveries and bank balances live in one place; invoices are generated as PDFs, and any sale priced below the agreed minimum is flagged.',
    highlights: ['Invoices & PDFs', 'Stock & reorder alerts', 'Price audit', 'Payments & balances'],
    image: './assets/projects/stock-management.webp',
    imageAlt: 'Stock Management overview: sales this month, unpaid invoices, products to reorder and the latest sales with their payment status.',
    background: '#042a35',
    featured: true,
    feature: { kicker: 'From purchase to payment.', title: ['Stock, sales', 'and invoices.'], caption: 'Business software / Stock Management' },
  },
  {
    slug: 'hotel-management',
    name: 'Hotel Management',
    tagline: 'The back office behind a seaside hotel.',
    type: 'Web application',
    year: 2026,
    role: 'Design & development',
    stack: ['Next.js', 'Django', 'Django REST Framework', 'MySQL', 'Tailwind CSS'],
    description: 'The back office of a seaside hotel. Reception works with bookings, guests and rooms; managers set seasonal rates, promotions, extra services and cancellation policies, moderate reviews and run reports. Every change is written to an audit log, and each staff role sees only what it needs.',
    highlights: ['Bookings & guests', 'Seasonal rates', 'Reports & audit log', 'Role-based access'],
    image: './assets/projects/hotel-management.webp',
    imageAlt: 'Hotel back office dashboard: today’s arrivals and occupancy, revenue this month, recent bookings and rooms that need attention.',
    background: '#f3f4f6',
  },
  {
    slug: 'hotel-website',
    name: 'Hotel Website',
    tagline: 'Direct booking for a hotel by the sea.',
    type: 'Website',
    year: 2026,
    role: 'Design & development',
    stack: ['Next.js', 'React', 'Tailwind CSS', 'Django REST Framework'],
    description: 'The hotel’s own booking site. Guests browse rooms and experiences, read reviews, book their dates, manage the stay from their account and review it afterwards. It shares one backend with the back office, so a booking made online is immediately in front of reception. Payments sit behind a bank-agnostic layer, because Stripe does not serve Albanian businesses.',
    highlights: ['Room search & booking', 'Guest accounts', 'Reviews', 'Bank-ready payments'],
    image: './assets/projects/hotel-website.webp',
    imageAlt: 'Hotel website rooms page: a dates and guests search above room cards with photos and prices per night.',
    background: '#f4f0e9',
  },
  {
    slug: 'restaurant-orders',
    name: 'Restaurant Orders',
    tagline: 'From table to kitchen in seconds, no internet needed.',
    type: 'Web application',
    year: 2026,
    role: 'Design & development',
    stack: ['Node.js', 'Express', 'WebSockets', 'SQLite', 'JavaScript'],
    description: 'An ordering system that runs on the restaurant’s own WiFi. Waiters take orders on tablets, drinks appear on the bar monitor and food on the kitchen screen, and the central PC handles bills and reports. It keeps working without internet and alerts the right waiter when a plate is ready.',
    highlights: ['Bar & kitchen screens', 'Works offline', 'Pickup alerts', 'Receipt printing'],
    image: './assets/projects/restaurant-orders.webp',
    imageAlt: 'Kitchen screen: open orders by table, each with its dishes, a timer and an All ready button.',
    background: '#2c3836',
  },
];
