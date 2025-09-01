 CREATE TABLE train_delays (
    Train_No VARCHAR(10),
    Station VARCHAR(50),
    Route VARCHAR(50),
    Date DATE,
    Scheduled_Time TIME,
    Actual_Time TIME,
    Delay_Minutes INT,
    Reason VARCHAR(100)
);

INSERT INTO train_delays VALUES
('12345', 'Chennai', 'Chennai-Delhi', '2025-08-01', '10:00', '10:30', 30, 'Signal Failure'),
('54321', 'Delhi', 'Delhi-Chennai', '2025-08-01', '15:00', '15:50', 50, 'Weather'),
('67890', 'Mumbai', 'Mumbai-Kolkata', '2025-08-02', '09:00', '09:20', 20, 'Technical Issue'),
('98765', 'Kolkata', 'Kolkata-Mumbai', '2025-08-02', '14:00', '14:45', 45, 'Track Maintenance'),
('24680', 'Bangalore', 'Bangalore-Hyderabad', '2025-08-03', '11:00', '11:05', 5, 'On Time');

