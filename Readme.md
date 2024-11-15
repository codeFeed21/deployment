# Booking.com Backend

The backend system for Booking.com, developed with Node.js, incorporates Express for efficient request handling and routing. Multer is used to streamline file upload processes, ensuring seamless integration of multimedia content. Prisma ORM connects the application to Supabase/PostgreSQL, facilitating sophisticated database interactions with a straightforward API. This architecture supports reliable data management, secure user interactions, and efficient booking workflows, offering a comprehensive backend solution for a dynamic and user-friendly booking platform.

# Technologies used

1. Nodejs
2. Typescript
3. Express.js
4. Multer
5. Prisma ORMs
6. Supabase/PostgreSQL
7. @supabase/supabase-js

- If you are using Supabase make sure to configure the code in controller section and configure the supabase bucket for the same.

## Here's a more granular breakdown of Booking.com's Server and its requests

### 1. Requests (API Endpoints):

#### User/DashBoard Management:

1. /api/v1/user/register (POST): Creates a new user account.
2. /api/v1/user/login (POST): Authenticates a user and returns a token for secure access.
3. /api/v1/user/ (GET): Retrieves the currently logged-in user's profile information.
4. /api/v1/user/ (PUT): Updates the information of the current user Logged In.

#### Cabins

#### Bookings

#### Settings

#### Check-in check-out

# For Contributing

- See [`contributing.md`](contributing.md) for more information and setting up.
