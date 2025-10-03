# Create Admin User

## Default Admin Credentials

**There is no pre-created admin account.** You need to create one using one of the methods below.

---

## Method 1: Sign Up & Promote (Recommended)

### Step 1: Create a Regular Account
1. Go to: http://localhost:3000/signup
2. Sign up with:
   - **Email**: `admin@aimpress.com`
   - **Password**: `Admin@123456` (or your preferred password)
   - **Name**: `Admin User`

### Step 2: Promote to Admin via Database
Run this SQL command in your PostgreSQL database:

```sql
-- Update user to admin role
UPDATE "User"
SET role = 'admin'
WHERE email = 'admin@aimpress.com';
```

**Using psql:**
```bash
psql postgresql://postgres:postgres@localhost:5432/marketplace -c "UPDATE \"User\" SET role = 'admin' WHERE email = 'admin@aimpress.com';"
```

**Using Docker:**
```bash
docker exec -it marketplace-postgres-dev psql -U postgres -d marketplace -c "UPDATE \"User\" SET role = 'admin' WHERE email = 'admin@aimpress.com';"
```

### Step 3: Login as Admin
- Go to: http://localhost:3000/login
- Email: `admin@aimpress.com`
- Password: (the one you set during signup)

---

## Method 2: Create Admin via Prisma Studio

### Step 1: Open Prisma Studio
```bash
cd backend
npx prisma studio
```

### Step 2: Create User
1. Click on "User" model
2. Click "Add record"
3. Fill in:
   - **email**: `admin@aimpress.com`
   - **passwordHash**: (see below for hash)
   - **name**: `Admin User`
   - **credits**: `1000`
   - **role**: `admin`

### Step 3: Generate Password Hash
For password `Admin@123456`, use this bcrypt hash:
```
$2b$10$vQp7xJZG0dKL8yN9wEoQ1OXxYZ5qMKGT8rC7mN5pD1aH3fB6gS4Lm
```

Or generate your own:
```bash
cd backend
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YOUR_PASSWORD', 10).then(console.log);"
```

---

## Method 3: Quick SQL Insert

Run this SQL to create admin directly:

```sql
INSERT INTO "User" (id, email, "passwordHash", name, credits, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@aimpress.com',
  '$2b$10$vQp7xJZG0dKL8yN9wEoQ1OXxYZ5qMKGT8rC7mN5pD1aH3fB6gS4Lm',
  'Admin User',
  1000,
  'admin',
  NOW(),
  NOW()
);
```

**Password for this hash**: `Admin@123456`

---

## Verify Admin Access

### 1. Login
- Go to: http://localhost:3000/login
- Use admin credentials

### 2. Check Admin Panel
- After login, you should see "Admin" link in navigation
- Go to: http://localhost:3000/admin
- You should see admin dashboard with:
  - Total Users
  - Total Revenue
  - Templates
  - AI Generations

### 3. Admin Capabilities
- View all users
- Manage user credits
- Ban/unban users
- View all payments
- Moderate templates (approve/reject)
- View AI usage analytics

---

## Security Recommendations

### After First Login:
1. **Change the default password** immediately
2. Use a strong password (min 12 characters)
3. Consider using a password manager
4. Enable 2FA (if implemented)

### Production:
1. **NEVER** use default credentials in production
2. Create admin with strong, unique password
3. Limit admin access to trusted IPs
4. Use environment variables for initial admin setup
5. Log all admin actions

---

## Troubleshooting

### "Access Denied" Error
- Check user role in database: `SELECT email, role FROM "User" WHERE email = 'admin@aimpress.com';`
- Ensure role is exactly `'admin'` (lowercase)

### Can't See Admin Link
- Clear browser cache and cookies
- Re-login to refresh user session
- Check browser console for errors

### Admin Panel Shows 403
- Verify JWT token includes role
- Check backend middleware (adminOnly)
- Restart backend server

---

## Quick Command Reference

**Check User Role:**
```bash
psql postgresql://postgres:postgres@localhost:5432/marketplace -c "SELECT email, role FROM \"User\" WHERE email = 'admin@aimpress.com';"
```

**Promote User to Admin:**
```bash
psql postgresql://postgres:postgres@localhost:5432/marketplace -c "UPDATE \"User\" SET role = 'admin' WHERE email = 'admin@aimpress.com';"
```

**Generate Password Hash:**
```bash
cd backend
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YOUR_PASSWORD', 10).then(console.log);"
```

---

## Default Test Admin (Development Only)

**⚠️ For development/testing only - DO NOT use in production!**

- **Email**: `admin@aimpress.com`
- **Password**: `Admin@123456`
- **Role**: `admin`
- **Credits**: `1000`

Use Method 1 or Method 3 above to create this user.
