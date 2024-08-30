CREATE DATABASE IF NOT EXISTS measures_db;
USE measures_db;

CREATE Table IF NOT EXISTS User (
    customer_code VARCHAR(36) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS Measure (
    measure_uuid VARCHAR(36) PRIMARY KEY,
    customer_code VARCHAR(36),
    measure_datetime DATETIME,
    measure_type ENUM('WATER', 'GAS'),
    measure_value INT,
    has_confirmed BOOLEAN,
    FOREIGN KEY (customer_code) REFERENCES User(customer_code)
);
