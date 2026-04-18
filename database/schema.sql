-- ============================================================
--  Lost & Found System — MySQL Schema
--  Database: lost_found_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS lost_found_db;
USE lost_found_db;

-- ─── USERS ───────────────────────────────────────────────────
CREATE TABLE users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)        NOT NULL,
    email       VARCHAR(150)        NOT NULL UNIQUE,
    password    VARCHAR(255)        NOT NULL,
    phone       VARCHAR(20),
    address     TEXT,
    profile_pic VARCHAR(500),
    role        ENUM('USER','ADMIN') DEFAULT 'USER',
    verified    BOOLEAN             DEFAULT FALSE,
    created_at  DATETIME            DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME            DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── CATEGORIES ──────────────────────────────────────────────
CREATE TABLE categories (
    id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(100) NOT NULL UNIQUE,
    icon  VARCHAR(50)
);

INSERT INTO categories (name, icon) VALUES
('Electronics',  'laptop'),
('Wallet/Purse', 'credit-card'),
('Keys',         'key'),
('Bag/Luggage',  'briefcase'),
('Clothing',     'shirt'),
('Jewelry',      'gem'),
('Documents',    'file-text'),
('Pet',          'heart'),
('Vehicle',      'car'),
('Other',        'package');

-- ─── ITEMS ───────────────────────────────────────────────────
CREATE TABLE items (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT       NOT NULL,
    category_id   BIGINT,
    type          ENUM('LOST','FOUND') NOT NULL,
    title         VARCHAR(200) NOT NULL,
    description   TEXT,
    location      VARCHAR(300),
    latitude      DECIMAL(10,7),
    longitude     DECIMAL(10,7),
    date_lost_found DATE,
    status        ENUM('OPEN','CLAIMED','CLOSED','MATCHED') DEFAULT 'OPEN',
    image_url     VARCHAR(500),
    color         VARCHAR(50),
    brand         VARCHAR(100),
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ─── CLAIMS ──────────────────────────────────────────────────
CREATE TABLE claims (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id       BIGINT       NOT NULL,
    claimant_id   BIGINT       NOT NULL,
    proof_text    TEXT,
    proof_image   VARCHAR(500),
    status        ENUM('PENDING','APPROVED','REJECTED','HANDED_OVER') DEFAULT 'PENDING',
    admin_note    TEXT,
    claimed_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at   DATETIME,
    FOREIGN KEY (item_id)     REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (claimant_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── MESSAGES ────────────────────────────────────────────────
CREATE TABLE messages (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id   BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    item_id     BIGINT,
    content     TEXT  NOT NULL,
    is_read     BOOLEAN  DEFAULT FALSE,
    sent_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id)     REFERENCES items(id) ON DELETE SET NULL
);

-- ─── NOTIFICATIONS ───────────────────────────────────────────
CREATE TABLE notifications (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    title       VARCHAR(200) NOT NULL,
    message     TEXT         NOT NULL,
    type        ENUM('CLAIM','MATCH','SYSTEM','ALERT') DEFAULT 'SYSTEM',
    is_read     BOOLEAN  DEFAULT FALSE,
    link        VARCHAR(300),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── EVENTS ──────────────────────────────────────────────────
CREATE TABLE events (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    description  TEXT,
    location     VARCHAR(300),
    event_date   DATETIME,
    image_url    VARCHAR(500),
    organizer_id BIGINT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ─── EVENT REGISTRATIONS ─────────────────────────────────────
CREATE TABLE event_registrations (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id   BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_reg (event_id, user_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE
);

-- ─── ANNOUNCEMENTS ───────────────────────────────────────────
CREATE TABLE announcements (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    title      VARCHAR(200) NOT NULL,
    content    TEXT         NOT NULL,
    type       ENUM('UPDATE','NOTICE','MAINTENANCE','GOVERNMENT') DEFAULT 'NOTICE',
    author_id  BIGINT,
    is_active  BOOLEAN  DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ─── FEEDBACK ────────────────────────────────────────────────
CREATE TABLE feedback (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT,
    type        ENUM('FEEDBACK','SUGGESTION','BUG','COMPLAINT') DEFAULT 'FEEDBACK',
    subject     VARCHAR(200),
    message     TEXT NOT NULL,
    rating      TINYINT CHECK (rating BETWEEN 1 AND 5),
    status      ENUM('NEW','REVIEWED','RESOLVED') DEFAULT 'NEW',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ─── SUPPORT TICKETS ─────────────────────────────────────────
CREATE TABLE support_tickets (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT,
    subject     VARCHAR(200) NOT NULL,
    description TEXT         NOT NULL,
    status      ENUM('OPEN','IN_PROGRESS','CLOSED') DEFAULT 'OPEN',
    priority    ENUM('LOW','MEDIUM','HIGH') DEFAULT 'MEDIUM',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ─── LOGIN HISTORY ───────────────────────────────────────────
CREATE TABLE login_history (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT NOT NULL,
    ip_address VARCHAR(50),
    device     VARCHAR(200),
    logged_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── SEED ADMIN ──────────────────────────────────────────────
-- Password: admin123 (plain text, no encryption)
INSERT INTO users (name, email, password, role, verified) VALUES
('Admin User', 'admin@lostandfound.com', 'admin123', 'ADMIN', TRUE);
