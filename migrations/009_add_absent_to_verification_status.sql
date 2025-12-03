ALTER TABLE attendance 
MODIFY COLUMN verification_status ENUM('pending', 'verified', 'rejected', 'absent') DEFAULT 'pending';
