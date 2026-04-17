# 🚨 HotSOS: Mobile Safety Application

### Capstone Project – IT Undergraduate Thesis

HotSOS is a **real-time emergency response mobile application** designed to improve the safety of **adults and children**. The application allows users to send **one-tap SOS alerts**, automatically **share their location**, and notify responders through **instant push notifications**.

The goal of HotSOS is to provide a **fast, reliable emergency communication system** that allows responders to quickly identify and assist individuals in danger.

## 📂 Project Structure

### 📱 safetyapp/ (Frontend - React Native & Expo)

#### **Core Components** (`/components`)

- **`SOSButton.js`**: A specialized trigger component with built-in logic to prevent accidental activations (e.g., long-press requirements).
- **`ContactManager.js`**: Handles the display, addition, and removal of users within the personal emergency network.
- **`EmergencyTracker.js`**: The map-view engine that renders interactive Google Maps markers for victims' real-time locations.
- **`QuickAuth.js`**: Reusable form elements (inputs/buttons) used to standardize the UI/UX for login and registration.

#### **Application Screens** (`/screens`)

- **`HomeScreen.js`**: The primary interface featuring the SOS Trigger. It handles hardware GPS coordinate capture and database logging.
- **`AlertsScreen.js`**: A live feed utilizing **Supabase Realtime** to display incoming emergency alerts from the user's network instantly.
- **`LoginScreen.js` / `RegisterScreen.js`**: Handles secure user onboarding and authentication via Supabase Auth.
- **`ProfileScreen.js`**: Manages user identity (Avatar, Nickname) and registers unique **Expo Push Tokens** for remote alerting.
- **`AddContactsScreen.js`**: A privacy-focused search system allowing users to build a trusted network via nicknames.

#### **Utilities & Config**

- **`utils/supabase.js`**: Centralized Supabase client configuration for database and storage access.
- **`utils/notificationHelper.js`**: Logic for managing device permissions and dispatching alerts to the Expo Push API.
- **`app.json`**: Global manifest for app permissions, naming, and deployment settings.

---

### ⚡ supabase/ (Backend & Database)

- **`migrations/`**: Version-controlled SQL scripts containing the database schema, table relationships, and Row Level Security (RLS) policies.
- **`config.toml`**: Configuration settings linking the local development environment to the Supabase Cloud instance.

## 🛠️ Tech Stack

- **Framework:** Expo (React Native)
- **Language:** JavaScript
- **Database & Auth:** Supabase (PostgreSQL)
- **Real-time:** Supabase WebSockets
- **Maps:** Google Maps SDK
- **Package Manager:** npm
  └── HotSOS_Documentation.pdf # Info about the project

# Core Dependencies (For Reference):

# The project requires the following libraries to handle the backend, GPS, and the Android image upload fix:

- **`@supabase/supabase-js`: Database & Auth**
- **`base64-arraybuffer`: Decodes image data for Android uploads**
- **`expo-image-picker`: Gallery/Camera access**
- **`expo-location`: GPS coordinate capture**
- **`expo-notifications`: Push alert engine**
- **`react-native-maps`: Google Maps integration**
- **`react-native-safe-area-context`: UI layout management**

# 🚀 Getting Started

## 1️⃣ Prerequisites

Before running the project, install the following:

- Node.js
- Expo Go app (installed on your phone)
- EAS CLI

Install EAS CLI globally:

```bash
npm install -g eas-cli
```

---

## 2️⃣ Installation

Clone the repository and install dependencies.

```bash
git clone <your-repo-link>
cd safetyapp
npm install
```

---

# 🗄 Database Setup (Supabase)

Open the **Supabase SQL Editor** and run the following commands to ensure the `profiles` table has the required columns.

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nickname TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token TEXT;
```

---

# 📱 Development Workflow (Active Coding)

# 💻 Debugger Apk of your app

Use this workflow when you want to **see changes instantly on your phone while coding**.

### Step 1 — Build the Development Client (One Time)

```bash
npx eas build --profile development --platform android
```

Download and install the generated **APK** on your phone.

---

### Step 2 — Start the Development Server

```bash
npm run start-clean
```

Keep the development app open on your phone.

When you **save files in VS Code**, the app will **automatically live reload**.

---

# 📦 Production Workflow (Final Defense Build)

# 💻 Standalone Apk for your app

Use this workflow to generate a **standalone APK** for your thesis defense or distribution.

```bash
eas build --profile preview --platform android
```

Wait **10–20 minutes**, then download the APK and install it.

---

# 🔧 Troubleshooting & Bug Fixes

## 1️⃣ Network / Connection Issues

### WiFi Repeater Bug

Make sure your **laptop and phone are connected to the same main router**, not a WiFi repeater.

---

### QR Code Won't Scan

If the QR code fails:

1. Tap **Enter URL Manually** on your phone
2. Enter the address shown in your terminal

```
Ex. exp://192.168.x.x:8081
```

---

### IP Connection Fix

If your phone cannot detect your laptop:
**Just run this**

```bash
npx expo start --host lan --scheme hotsos
```

**scan the qr code or manually enter the ip address from metro**

---

## 2️⃣ Common Errors

### "Network Request Failed"

This usually means your **Supabase project is paused due to inactivity**.

Fix:

1. Open the Supabase dashboard
2. Go to your **HotSOS project**
3. Click **Resume Project**

---

### "Maximum Update Depth Exceeded"

Ensure the `useEffect` inside `HomeScreen.js`:

Uses the dependency:

```javascript
[session?.user?.id];
```

And has a guard clause:

```javascript
if (expoPushToken) return;
```

---

### SafeAreaView Import Error

Always import `SafeAreaView` from:

```javascript
react - native - safe - area - context;
```

NOT from:

```
react-native
```

---

## 3️⃣ Database Deletion Errors

If Supabase prevents deleting users, run the reset SQL:

```sql
TRUNCATE TABLE public.alerts CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
DELETE FROM auth.users;
```

---

# 🗄 Database Schema

The HotSOS application uses **Supabase (PostgreSQL)** as its backend database.
Below is the simplified schema showing the core tables used for storing user profiles, emergency alerts, and trusted contacts.

---

## SQL QUERY

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.alerts (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
user_id uuid NOT NULL,
contact_name text,
latitude double precision NOT NULL,
longitude double precision NOT NULL,
status text DEFAULT 'active'::text,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT alerts_pkey PRIMARY KEY (id),
CONSTRAINT alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.emergency_alerts (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
user_id uuid,
is_active boolean DEFAULT true,
started_at timestamp with time zone DEFAULT now(),
ended_at timestamp with time zone,
current_latitude double precision,
current_longitude double precision,
updated_at timestamp with time zone DEFAULT now(),
latitude double precision,
longitude double precision,
status text DEFAULT 'active'::text,
victim_id uuid,
created_at timestamp with time zone DEFAULT now(),
push_token text,
CONSTRAINT emergency_alerts_pkey PRIMARY KEY (id),
CONSTRAINT emergency_alerts_victim_id_fkey FOREIGN KEY (victim_id) REFERENCES auth.users(id)
);
CREATE TABLE public.emergency_contacts (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
user_id uuid,
contact_user_id uuid,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT emergency_contacts_pkey PRIMARY KEY (id),
CONSTRAINT emergency_contacts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
CONSTRAINT emergency_contacts_contact_user_id_fkey FOREIGN KEY (contact_user_id) REFERENCES auth.users(id),
CONSTRAINT fk_contact_profile FOREIGN KEY (contact_user_id) REFERENCES public.profiles(id),
CONSTRAINT fk_owner_profile FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
id uuid NOT NULL,
full_name text,
push_token text,
created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
avatar_url text,
nickname text,
CONSTRAINT profiles_pkey PRIMARY KEY (id),
CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- Allow users to search for each other's nicknames
CREATE POLICY "Enable read access for all users"
ON public.profiles FOR SELECT TO authenticated USING (true);

## alerts

Stores alert records created by users.

| Column       | Type             | Description              |
| ------------ | ---------------- | ------------------------ |
| id           | uuid             | Alert record ID          |
| user_id      | uuid             | References auth.users    |
| contact_name | text             | Contact name             |
| latitude     | double precision | Alert latitude           |
| longitude    | double precision | Alert longitude          |
| status       | text             | Alert status             |
| created_at   | timestamp        | Alert creation timestamp |

## emergency_alerts

Stores emergency alert records and live tracking details.

| Column            | Type             | Description                        |
| ----------------- | ---------------- | ---------------------------------- |
| id                | uuid             | Emergency alert ID                 |
| user_id           | uuid             | User ID                            |
| is_active         | boolean          | Whether the alert is active        |
| started_at        | timestamp        | Time the alert started             |
| ended_at          | timestamp        | Time the alert ended               |
| current_latitude  | double precision | Current latitude                   |
| current_longitude | double precision | Current longitude                  |
| updated_at        | timestamp        | Last update timestamp              |
| latitude          | double precision | Initial latitude                   |
| longitude         | double precision | Initial longitude                  |
| status            | text             | Emergency status                   |
| victim_id         | uuid             | References auth.users              |
| created_at        | timestamp        | Emergency alert creation timestamp |
| push_token        | text             | Push notification token            |

## emergency_contacts

Stores emergency contact relationships between users.

| Column          | Type      | Description                     |
| --------------- | --------- | ------------------------------- |
| id              | uuid      | Emergency contact record ID     |
| user_id         | uuid      | Owner user ID                   |
| contact_user_id | uuid      | Contact user ID                 |
| created_at      | timestamp | Relationship creation timestamp |

## profiles

Stores additional information about authenticated users.

| Column     | Type      | Description                |
| ---------- | --------- | -------------------------- |
| id         | uuid      | References auth.users      |
| full_name  | text      | User's full name           |
| push_token | text      | Push notification token    |
| created_at | timestamp | Account creation timestamp |
| updated_at | timestamp | Last profile update        |
| avatar_url | text      | Profile picture            |
| nickname   | text      | User nickname              |

## Database Relationships

- `profiles.id` → references **auth.users.id**
- `alerts.user_id` → references **auth.users.id**
- `emergency_alerts.victim_id` → references **auth.users.id**

These relationships ensure that alerts and contacts are associated with authenticated users.

# 📡 Notification Lifecycle: Technical Workflow (supabase workflow)

The core functionality of **HotSOS** is its ability to instantly route an emergency signal from a **victim's device** to a **responder's device**. This process is achieved through coordinated interaction between:

- The **mobile device hardware**
- The **Supabase cloud database**
- The **Expo Push Notification Service**

The workflow ensures that emergency alerts are delivered **in real time**, even when responder applications are running in the background.

---

# 🔁 Step-by-Step Technical Flow

## 1️⃣ The Trigger (Client-Side)

When a user activates the **SOS button**, the application uses the `expo-location` module to retrieve **high-accuracy GPS coordinates** from the device hardware.

The app collects:

- `latitude`
- `longitude`

These coordinates represent the **precise location of the emergency event**.

---

## 2️⃣ Data Persistence (Supabase Database)

Once the coordinates are captured, the application performs an **asynchronous database insertion**.

```sql
INSERT INTO alerts (user_id, latitude, longitude)
VALUES (<user_id>, <latitude>, <longitude>);
```

This record becomes the **official event log**, storing:

- the user who triggered the alert
- the emergency location
- a server-generated timestamp

The **alerts table** acts as the central source of truth for all emergency events.

---

## 3️⃣ Foreground Synchronization (Supabase Realtime)

For responders who currently have the application open, **Supabase Realtime** is used.

Supabase utilizes **WebSockets** to broadcast database changes.

When a new row is inserted into the `alerts` table:

- The database **automatically pushes the update**
- All subscribed clients receive the update
- The **AlertsScreen refreshes instantly**

This removes the need for **manual refresh or polling**.

---

## 4️⃣ Remote Alerting (Push Notifications)

To notify responders whose applications are **closed or running in the background**, HotSOS uses **Expo Push Notifications**.

The process follows a **two-stage notification system**.

### Stage 1: Registry Lookup

The application queries the `profiles` table to retrieve all registered responder **Expo Push Tokens**.

```sql
SELECT push_token FROM profiles;
```

Each token uniquely identifies a device capable of receiving push notifications.

---

### Stage 2: API Dispatch

The victim's device sends a **secure POST request** to the Expo Push API.

```
https://exp.host/--/api/v2/push/send
```

The request contains:

- push token
- alert message
- optional metadata

---

### Global Routing

Expo acts as a **universal notification bridge**.

The push notification is routed through:

| Platform | Notification Service                   |
| -------- | -------------------------------------- |
| Android  | Firebase Cloud Messaging (FCM)         |
| iOS      | Apple Push Notification Service (APNs) |

This ensures that responders receive:

- system notifications
- vibration alerts
- lock screen notifications

even if the application is **not currently open**.

---

# ⚠️ Technical Limitations & Boundaries

As a **capstone project using a Backend-as-a-Service architecture**, HotSOS operates within several practical constraints.

---

## 1️⃣ Expo Go "SDK 53" Native Constraint

**Limitation**

Push notifications cannot be tested within the standard **Expo Go application**.

**Technical Context**

Beginning with **Expo SDK 53**, native push notification entitlements were removed from the Expo Go sandbox environment for security reasons.

**Solution**

Testing requires building a **Custom Development Client**.

```
npx eas build --profile development --platform android
```

The generated APK includes the required:

- `google-services.json`
- Firebase messaging configuration

This enables the device to communicate with **Google's push messaging infrastructure**.

---

## 2️⃣ Mandatory Network Connectivity

**Limitation**

The SOS system requires an **active internet connection**.

**Technical Context**

Supabase operates as a **cloud-hosted PostgreSQL database**, meaning the application must establish a successful **TCP/IP connection** before the alert can be stored.

In **network dead zones**, the database request may fail or time out.

**Future Improvement**

A potential enhancement is implementing an **SMS fallback system** using the `expo-sms` module.

If the cloud API is unreachable, the device could automatically send an emergency text message to trusted contacts.

---

## 3️⃣ Snapshot Location Accuracy

**Limitation**

HotSOS captures a **single location snapshot** during the SOS trigger instead of continuously tracking movement.

**Technical Context**

Modern mobile operating systems enforce strict **background battery optimizations**. Continuous GPS tracking requires:

- "Always On" location permissions
- background task scheduling
- persistent services

These significantly increase **battery consumption and system complexity**.

## 4️⃣ OS-Level Background Restrictions

**Limitation**

On certain Android devices, aggressive battery saving may silence notifications if the app is closed.

**Technical Context**

## This is an OS-level behavior that requires specialized "High Priority" channel configuration and FCM (Firebase) in production builds.

# ⚙️ Essential Database Configuration

To enable **real-time updates** in the application, Supabase replication must be configured.

### Steps

1. Open the **Supabase Dashboard**
2. Navigate to:

```
Database → Replication
```

3. Under `supabase_realtime`, enable the **Source toggle** for the `alerts` table.

This configuration allows the database to **stream new rows through WebSockets**, enabling instant updates in the application interface.

---

# 🧠 Summary

The HotSOS alert delivery pipeline combines:

- **Device GPS hardware**
- **Supabase Realtime database synchronization**
- **Expo Push Notification routing**
- **FCM / APNs platform messaging**

This architecture enables **real-time emergency communication** between victims and responders while maintaining a scalable cloud-based infrastructure.

# 👥 Contributors

**Ryan Ranada**
Lead Developer / IT Student
