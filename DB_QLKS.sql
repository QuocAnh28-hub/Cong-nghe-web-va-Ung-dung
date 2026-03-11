CREATE DATABASE QuanLyKhachSan

use QuanLyKhachSan

SELECT * FROM USERS

CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL CHECK (Role IN ('ADMIN','RECEPTIONIST','CUSTOMER')),
    CreatedAt DATETIME DEFAULT GETDATE()
)

CREATE TABLE Receptionists (
    ReceptionistID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Phone NVARCHAR(20),
    UserID INT UNIQUE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
)

CREATE TABLE Customers (
    CustomerID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Phone NVARCHAR(20),
    UserID INT UNIQUE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
)

CREATE TABLE RoomTypes (
    RoomTypeID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX),
    Capacity INT,
    DefaultPrice DECIMAL(12,2)
)

CREATE TABLE Rooms (
    RoomID INT IDENTITY(1,1) PRIMARY KEY,
    RoomNumber NVARCHAR(20) UNIQUE NOT NULL,
    Status NVARCHAR(20) DEFAULT 'AVAILABLE'
        CHECK (Status IN ('AVAILABLE','OCCUPIED','MAINTENANCE')),
    RoomTypeID INT NOT NULL,
    FOREIGN KEY (RoomTypeID) REFERENCES RoomTypes(RoomTypeID)
)

CREATE TABLE Rates (
    RateID INT IDENTITY(1,1) PRIMARY KEY,
    RoomTypeID INT NOT NULL,
    Price DECIMAL(12,2),
    StartDate DATE,
    EndDate DATE,
    Season NVARCHAR(100),
    FOREIGN KEY (RoomTypeID) REFERENCES RoomTypes(RoomTypeID)
)

CREATE TABLE Reservations (
    ReservationID INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID INT NOT NULL,
    CheckInDate DATE,
    CheckOutDate DATE,
    Status NVARCHAR(20)
        CHECK (Status IN ('BOOKED','CANCELLED','CHECKED_IN','COMPLETED')),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
)

CREATE TABLE ReservationRooms (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    ReservationID INT NOT NULL,
    RoomTypeID INT NOT NULL,
    Quantity INT NOT NULL,
    PriceAtBooking DECIMAL(12,2),
    FOREIGN KEY (ReservationID) REFERENCES Reservations(ReservationID),
    FOREIGN KEY (RoomTypeID) REFERENCES RoomTypes(RoomTypeID)
)

CREATE TABLE Guests (
    GuestID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(150),
    IdentityType NVARCHAR(50),
    IdentityNumber NVARCHAR(100)
)

CREATE TABLE Stays (
    StayID INT IDENTITY(1,1) PRIMARY KEY,
    ReservationID INT NULL,
    GuestID INT NOT NULL,
    ActualCheckIn DATETIME,
    ActualCheckOut DATETIME,
    Status NVARCHAR(20)
        CHECK (Status IN ('CHECKED_IN','COMPLETED')),
    FOREIGN KEY (ReservationID) REFERENCES Reservations(ReservationID),
    FOREIGN KEY (GuestID) REFERENCES Guests(GuestID)
)

CREATE TABLE RoomStayHistory (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    StayID INT NOT NULL,
    RoomID INT NOT NULL,
    CheckInTime DATETIME,
    CheckOutTime DATETIME,
    RateAtThatTime DECIMAL(12,2),
    FOREIGN KEY (StayID) REFERENCES Stays(StayID),
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID)
)

CREATE TABLE Services (
    ServiceID INT IDENTITY(1,1) PRIMARY KEY,
    ServiceName NVARCHAR(150),
    Price DECIMAL(12,2)
)

CREATE TABLE ServiceUsages (
    UsageID INT IDENTITY(1,1) PRIMARY KEY,
    StayID INT NOT NULL,
    ServiceID INT NOT NULL,
    Quantity INT,
    UsedDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (StayID) REFERENCES Stays(StayID),
    FOREIGN KEY (ServiceID) REFERENCES Services(ServiceID)
)

CREATE TABLE MinibarItems (
    MinibarID INT IDENTITY(1,1) PRIMARY KEY,
    ItemName NVARCHAR(150),
    Price DECIMAL(12,2)
)

CREATE TABLE MinibarUsages (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    StayID INT NOT NULL,
    MinibarID INT NOT NULL,
    Quantity INT,
    FOREIGN KEY (StayID) REFERENCES Stays(StayID),
    FOREIGN KEY (MinibarID) REFERENCES MinibarItems(MinibarID)
)

CREATE TABLE Penalties (
    PenaltyID INT IDENTITY(1,1) PRIMARY KEY,
    StayID INT NOT NULL,
    Reason NVARCHAR(255) NOT NULL,
    Amount DECIMAL(14,2) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (StayID) REFERENCES Stays(StayID)
);

CREATE TABLE Invoices (
    InvoiceID INT IDENTITY(1,1) PRIMARY KEY,
    StayID INT UNIQUE,
    IssueDate DATETIME DEFAULT GETDATE(),
    TotalAmount DECIMAL(14,2),
    VAT DECIMAL(14,2),
    Status NVARCHAR(20)
        CHECK (Status IN ('OPEN','PAID','CANCELLED')),
    FOREIGN KEY (StayID) REFERENCES Stays(StayID)
)

CREATE TABLE InvoiceDetails (
    DetailID INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceID INT NOT NULL,
    ItemType NVARCHAR(20)
        CHECK (ItemType IN ('ROOM','SERVICE','MINIBAR','PENALTY')),
    ItemName NVARCHAR(255),
    Quantity INT,
    UnitPrice DECIMAL(12,2),
    Amount DECIMAL(14,2),
    FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID)
)

CREATE TABLE Payments (
    PaymentID INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceID INT NOT NULL,
    PaymentMethod NVARCHAR(20)
        CHECK (PaymentMethod IN ('CASH','TRANSFER')),
    Amount DECIMAL(14,2),
    PaymentDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID)
)