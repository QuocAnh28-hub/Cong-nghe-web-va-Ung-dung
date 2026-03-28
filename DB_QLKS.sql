CREATE DATABASE QuanLyKhachSan

use QuanLyKhachSan


CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL CHECK (Role IN ('ADMIN','RECEPTIONIST','CUSTOMER')),
    CreatedAt DATETIME DEFAULT GETDATE(),
	Status NVARCHAR(20) NULL
)

CREATE TABLE Admin (
    AdminID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Phone NVARCHAR(20),
    UserID INT UNIQUE,
	Status NVARCHAR(20) DEFAULT 'TRUE' CHECK (Status IN ('TRUE','FALSE')),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
)

CREATE TABLE Receptionists (
    ReceptionistID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Phone NVARCHAR(20),
    UserID INT UNIQUE,
	Status NVARCHAR(20) DEFAULT 'TRUE' CHECK (Status IN ('TRUE','FALSE')),
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
     UserID INT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    CheckInDate DATE,
    CheckOutDate DATE,
    Status NVARCHAR(20) CHECK (Status IN ('BOOKED','CANCELLED','CHECKED_IN','COMPLETED')),
    CreatedAt DATETIME DEFAULT GETDATE()
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
    Price DECIMAL(12,2),
	Status NVARCHAR(20) DEFAULT 'TRUE' CHECK (Status IN ('TRUE','FALSE'))
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
	RoomTypeID INT NOT NULL,
    ItemName NVARCHAR(150),
    Price DECIMAL(12,2),
	FOREIGN KEY (RoomTypeID) REFERENCES RoomTypes(RoomTypeID)
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
)

CREATE TABLE Invoices (
    InvoiceID INT IDENTITY(1,1) PRIMARY KEY,
    StayID INT,
    Date DATETIME DEFAULT GETDATE(),
    TotalAmount DECIMAL(14,2),
    VAT DECIMAL(14,2),
    Status NVARCHAR(20) CHECK (Status IN ('OPEN','PAID','CANCELLED')),
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

--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-----------------------------------Stored procedure-----------------------------
--Thêm nhân viên mới------------------------------------------------------------
CREATE PROCEDURE sp_CreateReceptionist
    @Email NVARCHAR(150),
    @PasswordHash NVARCHAR(255),
    @FullName NVARCHAR(150),
    @Role NVARCHAR(20),
    @Phone NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserID INT;

    -- Thêm vào bảng Users
    INSERT INTO Users (Email, PasswordHash, Role, CreatedAt)
    VALUES (@Email, @PasswordHash, @Role, GETDATE());

    -- Lấy UserID vừa tạo
    SET @UserID = SCOPE_IDENTITY();

    -- Thêm vào bảng Receptionists
    INSERT INTO Receptionists (FullName, Phone, UserID)
    VALUES (@FullName, @Phone, @UserID);
END

EXEC sp_CreateReceptionist
    @Email = 'dohuuquocanhh@gmail.com',
    @PasswordHash = '123',
    @FullName = N'Đỗ Hữu Quốc Ánhh',
    @Role = 'ADMIN',
    @Phone = '0395134241'

--Thêm loại phòng mới------------------------------------------------------------------
CREATE PROCEDURE sp_CreateRoomType
    @Name NVARCHAR(100),
    @Description NVARCHAR(MAX),
    @Capacity INT,
    @DefaultPrice DECIMAL(12,2)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO RoomTypes(Name, Description, Capacity, DefaultPrice)
    VALUES (@Name, @Description, @Capacity, @DefaultPrice);
END

EXEC sp_CreateRoomType
    @Name = N'Phòng Luxury',
    @Description = N'Phòng cao cấp',
    @Capacity = 2,
    @DefaultPrice = 1500000

--Đăng ký tài khoản từ khách hàng---------------------------------------------------------
CREATE PROCEDURE sp_RegisterCustomer
    @FullName NVARCHAR(150),
    @Phone NVARCHAR(20),
    @Email NVARCHAR(150),
    @PasswordHash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra email đã tồn tại chưa
    IF EXISTS (SELECT 1 FROM Users WHERE Email = @Email)
    BEGIN
        RAISERROR('Email đã tồn tại!', 16, 1);
        RETURN;
    END

    DECLARE @UserID INT;

    -- Thêm vào bảng Users
    INSERT INTO Users (Email, PasswordHash, Role, CreatedAt)
    VALUES (@Email, @PasswordHash, 'CUSTOMER', GETDATE());

    -- Lấy UserID vừa tạo
    SET @UserID = SCOPE_IDENTITY();

    -- Thêm vào bảng Customers
    INSERT INTO Customers (FullName, Phone, UserID)
    VALUES (@FullName, @Phone, @UserID);
END

EXEC sp_RegisterCustomer 
    @FullName = N'Nguyễn Văn B',
    @Phone = '0123456788',
    @Email = 'vanb@gmail.com',
    @PasswordHash = '123';

--Đăng nhập và lấy các thông tin--------------------------------------------------
CREATE alter PROCEDURE GetAccountInfo
    @Email NVARCHAR(255),
    @PasswordHash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        u.Email,
        u.PasswordHash,
        u.Role,
        c.FullName,
        c.Phone
    FROM Users u
    INNER JOIN Customers c ON u.UserID = c.UserID
    WHERE u.Email = @Email
      AND u.PasswordHash = @PasswordHash

    UNION ALL

    SELECT 
        u.Email,
        u.PasswordHash,
        u.Role,
        r.FullName,
        r.Phone
    FROM Users u
    INNER JOIN Receptionists r ON u.UserID = r.UserID
    WHERE u.Email = @Email
      AND u.PasswordHash = @PasswordHash

    UNION ALL

    SELECT 
        u.Email,
        u.PasswordHash,
        u.Role,
        a.FullName,
        a.Phone
    FROM Users u
    INNER JOIN Admin a ON u.UserID = a.UserID
    WHERE u.Email = @Email
      AND u.PasswordHash = @PasswordHash;
END;

EXEC GetAccountInfo @Email = 'dohuuquocanh21dk@gmail.com', @PasswordHash = '123';


--Thêm Loại phòng---------------------------------------------------------------------
CREATE PROCEDURE sp_AddRoomType
    @Name NVARCHAR(100),
    @Description NVARCHAR(MAX) = NULL,
    @Capacity INT = NULL,
    @DefaultPrice DECIMAL(12,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO RoomTypes (Name, Description, Capacity, DefaultPrice)
    VALUES (@Name, @Description, @Capacity, @DefaultPrice);

    -- Trả về ID vừa tạo
    SELECT SCOPE_IDENTITY() AS NewRoomTypeID;
END;

--Sửa Loại phòng-------------------------------------------------------------------------
CREATE PROCEDURE sp_UpdateRoomType
    @RoomTypeID INT,
    @Name NVARCHAR(100),
    @Description NVARCHAR(MAX),
    @Capacity INT,
    @DefaultPrice DECIMAL(12,2)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE RoomTypes
    SET 
        Name = @Name,
        Description = @Description,
        Capacity = @Capacity,
        DefaultPrice = @DefaultPrice
    WHERE RoomTypeID = @RoomTypeID;

    -- Check có update không
    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR ('RoomType không tồn tại', 16, 1);
    END
END;

--Xoá Loại phòng----------------------------------------------------------------------
CREATE PROCEDURE sp_DeleteRoomType
    @RoomTypeID INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM RoomTypes
    WHERE RoomTypeID = @RoomTypeID;

    -- Check có xoá không
    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR ('RoomType không tồn tại', 16, 1);
    END
END;

---------------------------------------------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------------------------------------------
----------------Proc thêm phòng-------------------------------
CREATE PROCEDURE AddRoom
    @RoomNumber NVARCHAR(50),
    @Status NVARCHAR(50),
    @RoomTypeID INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Rooms WHERE RoomNumber = @RoomNumber)
    BEGIN
        PRINT N'Phòng đã tồn tại';
        RETURN;
    END

    INSERT INTO Rooms (RoomNumber, Status, RoomTypeID)
    VALUES (@RoomNumber, @Status, @RoomTypeID);

    PRINT N'Thêm phòng thành công';
END;

EXEC AddRoom 
    @RoomNumber = '101',
    @Status = 'Available',
    @RoomTypeID = 1;

-------------Proc sửa phòng-------------------------------------
CREATE PROCEDURE UpdateRoom
    @RoomID INT,
    @RoomNumber NVARCHAR(50),
    @Status NVARCHAR(50),
    @RoomTypeID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra phòng tồn tại
    IF NOT EXISTS (SELECT 1 FROM Rooms WHERE RoomID = @RoomID)
    BEGIN
        PRINT N'Phòng không tồn tại';
        RETURN;
    END

    -- Kiểm tra trùng RoomNumber (trừ chính nó)
    IF EXISTS (
        SELECT 1 
        FROM Rooms 
        WHERE RoomNumber = @RoomNumber 
          AND RoomID <> @RoomID
    )
    BEGIN
        PRINT N'Số phòng đã tồn tại';
        RETURN;
    END

    -- Update
    UPDATE Rooms
    SET 
        RoomNumber = @RoomNumber,
        Status = @Status,
        RoomTypeID = @RoomTypeID
    WHERE RoomID = @RoomID;

    PRINT N'Cập nhật phòng thành công';
END;

EXEC UpdateRoom 
    @RoomID = 1,
    @RoomNumber = '102',
    @Status = 'Occupied',
    @RoomTypeID = 1;

-------------Proc load phòng--------------------------------------------------
CREATE PROCEDURE GetRooms
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        r.RoomID,
        r.RoomNumber,
        r.Status,
        r.RoomTypeID,
        rt.Name AS RoomTypeName,
        rt.Description,
        rt.Capacity,
        rt.DefaultPrice
    FROM Rooms r
    LEFT JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
    ORDER BY r.RoomID DESC;
END;

EXEC GetRooms;

-------------Proc Load KH--------------------------------------------------------
CREATE PROCEDURE sp_LoadGuests
AS
BEGIN
    SELECT GuestID, FullName, IdentityType, IdentityNumber
    FROM Guests;
END;

EXEC sp_LoadGuests

-------------Proc Thêm KH--------------------------------------------------------
CREATE PROCEDURE sp_AddGuest
    @FullName NVARCHAR(100),
    @IdentityType NVARCHAR(50),
    @IdentityNumber NVARCHAR(50)
AS
BEGIN
    INSERT INTO Guests (FullName, IdentityType, IdentityNumber)
    VALUES (@FullName, @IdentityType, @IdentityNumber);
END;

EXEC sp_AddGuest
	@FullName = 'Lê Huy Hoàng',
    @IdentityType = 'CCCD',
    @IdentityNumber = '123456789'

-------------Proc Sửa KH---------------------------------------------------------
CREATE PROCEDURE sp_UpdateGuest
    @GuestID INT,
    @FullName NVARCHAR(100),
    @IdentityType NVARCHAR(50),
    @IdentityNumber NVARCHAR(50)
AS
BEGIN
    UPDATE Guests
    SET FullName = @FullName,
        IdentityType = @IdentityType,
        IdentityNumber = @IdentityNumber
    WHERE GuestID = @GuestID;
END;

EXEC sp_UpdateGuest
    @GuestID = 1,
    @FullName = 'Lê Huy Hoàng VIP',
    @IdentityType = 'CCCD',
    @IdentityNumber = '123456789'

-------------Proc Load DV--------------------------------------------------------
CREATE PROC sp_GetServices
AS
BEGIN
    SELECT 
        ServiceID,
        ServiceName,
        Price,
        Status
    FROM Services
END

EXEC sp_GetServices

-------------Proc Load DV đang hoạt động----------------------------------------
CREATE PROC sp_GetActiveServices
AS
BEGIN
    SELECT *
    FROM Services
    WHERE Status = 'TRUE'
END

EXEC sp_GetActiveServices

-------------Proc Thêm DV--------------------------------------------------------
CREATE PROC sp_InsertService
    @ServiceName NVARCHAR(150),
    @Price DECIMAL(12,2),
    @Status NVARCHAR(20) = 'TRUE'
AS
BEGIN
    INSERT INTO Services (ServiceName, Price, Status)
    VALUES (@ServiceName, @Price, @Status)
END

EXEC sp_InsertService
    @ServiceName = 'Nước suối',
    @Price = 15000,
    @Status = 'TRUE'

-------------Proc Sửa DV---------------------------------------------------------
CREATE PROC sp_UpdateService
    @ServiceID INT,
    @ServiceName NVARCHAR(150),
    @Price DECIMAL(12,2),
    @Status NVARCHAR(20)
AS
BEGIN
    UPDATE Services
    SET 
        ServiceName = @ServiceName,
        Price = @Price,
        Status = @Status
    WHERE ServiceID = @ServiceID
END

EXEC sp_UpdateService
	@ServiceID = 1,
    @ServiceName = N'Nước suối',
    @Price = 15000,
    @Status = 'TRUE'

-------------Proc Xoá DV---------------------------------------------------------
CREATE PROC sp_DeleteService
    @ServiceID INT
AS
BEGIN
    UPDATE Services
    SET Status = 'FALSE'
    WHERE ServiceID = @ServiceID
END

EXEC sp_DeleteService
	@ServiceID = 1

-------------Proc Load Nhân viên-------------------------------------------------
CREATE PROCEDURE GetUserReceptionistInfo
AS
BEGIN
    SELECT 
        r.FullName,
        u.Role,
        u.Email,
        r.Phone,
        u.CreatedAt
    FROM Users u
    INNER JOIN Receptionists r 
        ON u.UserID = r.UserID
END

EXEC GetUserReceptionistInfo

-------------Proc Load Nhân viên-------------------------------------------------
CREATE alter PROCEDURE sp_GetActiveReceptionists
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        u.UserID,
        u.Email,
        u.Role,
        u.CreatedAt,
        r.FullName,
        r.Phone
    FROM Users u
    INNER JOIN Receptionists r ON u.UserID = r.UserID
    WHERE r.Status = 'TRUE'
END

EXEC sp_GetActiveReceptionists

-------------Proc Sửa NV---------------------------------------------------------
CREATE PROCEDURE sp_UpdateReceptionist
    @UserID INT,
    @Email NVARCHAR(150),
    @PasswordHash NVARCHAR(255),
    @FullName NVARCHAR(150),
    @Role NVARCHAR(20),
    @Phone NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    -- Cập nhật bảng Users
    UPDATE Users
    SET 
        Email = @Email,
        PasswordHash = @PasswordHash,
        Role = @Role
    WHERE UserID = @UserID;

    -- Cập nhật bảng Receptionists
    UPDATE Receptionists
    SET 
        FullName = @FullName,
        Phone = @Phone
    WHERE UserID = @UserID;
END

EXEC sp_UpdateReceptionist
    @UserID = 5,
    @Email = N'dohuuquocanhh@gmail.com',
    @PasswordHash = '123',
    @FullName = N'Manager Quốc Ánh',
    @Role = 'ADMIN',
    @Phone = '0395134241'

-------------Proc Xoá NV---------------------------------------------------------
CREATE alter PROCEDURE sp_DeleteReceptionist
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Receptionists
    SET Status = 'FALSE'
    WHERE UserID = @UserID;
END

EXEC sp_DeleteReceptionist
    @UserID = 5

--Load tổng số phòng, số phòng trống, số phòng đang dùng---------------------------
CREATE PROCEDURE sp_GetRoomStatistics
AS
BEGIN
    SELECT 
        COUNT(*) AS TotalRooms,
        SUM(CASE WHEN Status = 'AVAILABLE' THEN 1 ELSE 0 END) AS AvailableRooms,
        SUM(CASE WHEN Status = 'OCCUPIED' THEN 1 ELSE 0 END) AS OccupiedRooms
    FROM Rooms
END

EXEC sp_GetRoomStatistics

--Công suất phòng (tỷ lệ % phòng đang được sử dụng)--------------------------------
CREATE PROCEDURE sp_GetOccupancyRate
AS
BEGIN
    SELECT 
        CAST(
            100.0 * SUM(CASE WHEN Status = 'OCCUPIED' THEN 1 ELSE 0 END)
            / NULLIF(COUNT(*), 0)
        AS DECIMAL(5,2)) AS OccupancyRate
    FROM Rooms
END

EXEC sp_GetOccupancyRate

--Trạng thái phòng(Phòng trống: n, Đang sử dụng: n, Cần dọn dẹp: n)----------------
ALTER TABLE Rooms
ADD CONSTRAINT CK_Rooms_Status 
CHECK (Status IN ('AVAILABLE','OCCUPIED','MAINTENANCE','DIRTY'))--sửa lại trạng thái Rooms

CREATE PROCEDURE sp_GetRoomStatusSummary
AS
BEGIN
    SELECT 
        SUM(CASE WHEN Status = 'AVAILABLE' THEN 1 ELSE 0 END) AS AvailableRooms,
        SUM(CASE WHEN Status = 'OCCUPIED' THEN 1 ELSE 0 END) AS OccupiedRooms,
        SUM(CASE WHEN Status = 'DIRTY' THEN 1 ELSE 0 END) AS DirtyRooms
    FROM Rooms
END

EXEC sp_GetRoomStatusSummary

--Thông tin khách: Tổng khách hàng: n, Đang lưu trú: n------------------------------
CREATE PROCEDURE sp_GetCustomerSummary
AS
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM Customers) AS TotalCustomers,

        (SELECT COUNT(DISTINCT GuestID) 
         FROM Stays 
         WHERE Status = 'CHECKED_IN') AS StayingGuests
END

EXEC sp_GetCustomerSummary

--Load customers--------------------------------------------------------------------
CREATE PROCEDURE sp_Customers_GetAll
AS
BEGIN
    SELECT 
        CustomerID,
        FullName,
        Phone,
        UserID
    FROM Customers
END

EXEC sp_Customers_GetAll

--Thêm customers--------------------------------------------------------------------
CREATE PROCEDURE sp_Customers_Insert
    @FullName NVARCHAR(255),
    @Phone NVARCHAR(20),
    @UserID INT
AS
BEGIN
    INSERT INTO Customers (FullName, Phone, UserID)
    VALUES (@FullName, @Phone, @UserID)
END

EXEC sp_Customers_Insert
    @FullName = 'test',
    @Phone = '0988888888888',
    @UserID = 5

--Sửa customers--------------------------------------------------------------------
CREATE PROCEDURE sp_Customers_Update
    @CustomerID INT,
    @FullName NVARCHAR(255),
    @Phone NVARCHAR(20),
    @UserID INT
AS
BEGIN
    UPDATE Customers
    SET 
        FullName = @FullName,
        Phone = @Phone,
        UserID = @UserID
    WHERE CustomerID = @CustomerID
END

EXEC sp_Customers_Update
    @CustomerID = 2,
    @FullName = 'test change',
    @Phone = '0888888888',
    @UserID = 5

---------------------------------------------------------------------------------------------------------------
--------------------------------22222222222222222222222222222222222222222--------------------------------------
---------------------------------------------------------------------------------------------------------------
--Load giá theo ngày(giá mặc định)-------------------------------------------------------------
CREATE PROCEDURE sp_GetDefaultRate
AS
BEGIN
    SELECT 
		RoomTypeID,
        DefaultPrice
    FROM RoomTypes
END

EXEC sp_GetDefaultRate

--Load giá theo mùa----------------------------------------------------------------------------
CREATE PROCEDURE sp_GetSeasonRate
AS
BEGIN
    SELECT *
    FROM Rates
END

EXEC sp_GetSeasonRate

--Sửa giá theo ngày(Bỏ chức năng thêm,xoá giá theo ngày trên web)------------------------------
CREATE PROCEDURE dbo.usp_UpdateRoomTypePrice
    @RoomTypeID INT,
    @NewPrice DECIMAL(12, 2)
AS
BEGIN
    SET NOCOUNT ON
    UPDATE RoomTypes
    SET DefaultPrice = @NewPrice
    WHERE RoomTypeID = @RoomTypeID
END

EXEC dbo.usp_UpdateRoomTypePrice @RoomTypeID = 1, @NewPrice = 1400000;

--Thêm giá theo mùa(từ ngày-đến ngày)----------------------------------------------------------
CREATE PROCEDURE usp_InsertRate
    @RoomTypeID INT,
    @Price DECIMAL(10, 2),
    @StartDate DATE,
    @EndDate DATE,
    @Season NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Rates (RoomTypeID, Price, StartDate, EndDate, Season)
    VALUES (@RoomTypeID, @Price, @StartDate, @EndDate, @Season);
END;

EXEC usp_InsertRate 
    @RoomTypeID = 1,
    @Price = 1600000,
    @StartDate = '2026-06-01',
    @EndDate = '2026-08-31',
    @Season = N'Cao điểm';
--Sửa giá theo mùa-----------------------------------------------------------------------------
CREATE PROCEDURE usp_UpdateSeasonalRate
    @RateID INT,
    @RoomTypeID INT = NULL,
    @Price DECIMAL(10,2) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @Season NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Rates
    SET 
        RoomTypeID = COALESCE(@RoomTypeID, RoomTypeID),
        Price = COALESCE(@Price, Price),
        StartDate = COALESCE(@StartDate, StartDate),
        EndDate = COALESCE(@EndDate, EndDate),
        Season = COALESCE(@Season, Season)
    WHERE RateID = @RateID;
END

EXEC usp_UpdateSeasonalRate 
    @RateID = 1,
    @RoomTypeID = 1,
    @Price = 2200000.00,
    @StartDate = '2026-06-02',
    @EndDate = '2026-08-30',
	@Season = N'Mùa cao điểm'

--Xoá giá theo mùa-----------------------------------------------------------------------------
CREATE PROCEDURE usp_DeleteSeasonalRate
    @RateID INT
AS
BEGIN
    SET NOCOUNT ON

    DELETE FROM Rates WHERE RateID = @RateID

END

EXEC usp_DeleteSeasonalRate @RateID = 1;

--- Số lượng CheckIn,CheckOut hôm nay----------------------------------------------------------
CREATE PROCEDURE sp_TodayCheckIn_Reservation_CheckOut_Stay
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        -- Check-in hôm nay (dựa trên lịch đặt phòng)
        (SELECT COUNT(*) 
         FROM Reservations
         WHERE CheckInDate = CAST(GETDATE() AS DATE)
           AND Status IN ('BOOKED','CHECKED_IN')
        ) AS TodayCheckIn,

        -- Check-out hôm nay (dựa trên thực tế)
        (SELECT COUNT(*) 
         FROM Stays
         WHERE CAST(ActualCheckOut AS DATE) = CAST(GETDATE() AS DATE)
           AND Status = 'COMPLETED'
        ) AS TodayCheckOut
END

EXEC sp_TodayCheckIn_Reservation_CheckOut_Stay

---	Doanh thu tháng này------------------------------------------------------------------------
CREATE PROCEDURE sp_RevenueThisMonth_WithStayCount
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        COUNT(DISTINCT i.StayID) AS TotalStays,
        ISNULL(SUM(ISNULL(i.TotalAmount,0) + ISNULL(i.VAT,0)), 0) AS TotalRevenue
    FROM Invoices i
    WHERE i.Status = 'PAID'
      AND MONTH(i.Date) = MONTH(GETDATE())
      AND YEAR(i.Date) = YEAR(GETDATE())
END

EXEC sp_RevenueThisMonth_WithStayCount

---	Lịch theo từng ngày của từng phòng---------------------------------------------------------
CREATE PROCEDURE sp_GetRoomCalendar_Advanced
    @Month INT,
    @Year INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @StartDate DATE = DATEFROMPARTS(@Year, @Month, 1)
    DECLARE @EndDate DATE = EOMONTH(@StartDate)

    -- Tạo danh sách ngày
    ;WITH Dates AS (
        SELECT @StartDate AS [Date]
        UNION ALL
        SELECT DATEADD(DAY, 1, [Date])
        FROM Dates
        WHERE [Date] < @EndDate
    ),

    -- Phòng đang sử dụng
    Occupied AS (
        SELECT 
            rsh.RoomID,
            CAST(d.Date AS DATE) AS [Date]
        FROM RoomStayHistory rsh
        JOIN Stays s ON s.StayID = rsh.StayID
        JOIN Dates d ON d.Date >= CAST(rsh.CheckInTime AS DATE)
                    AND d.Date < CAST(ISNULL(rsh.CheckOutTime, GETDATE()) AS DATE)
        WHERE s.Status = 'CHECKED_IN'
    ),

    -- Tổng số phòng đã đặt theo RoomType
    BookedByType AS (
        SELECT 
            rr.RoomTypeID,
            d.Date,
            SUM(rr.Quantity) AS TotalBooked
        FROM Reservations re
        JOIN ReservationRooms rr ON rr.ReservationID = re.ReservationID
        JOIN Dates d ON d.Date >= re.CheckInDate
                    AND d.Date < re.CheckOutDate
        WHERE re.Status = 'BOOKED'
        GROUP BY rr.RoomTypeID, d.Date
    ),

    -- Số phòng đang occupied theo RoomType
    OccupiedCount AS (
        SELECT 
            r.RoomTypeID,
            o.Date,
            COUNT(*) AS TotalOccupied
        FROM Occupied o
        JOIN Rooms r ON r.RoomID = o.RoomID
        GROUP BY r.RoomTypeID, o.Date
    ),

    -- Tổng số phòng mỗi loại
    TotalRooms AS (
        SELECT RoomTypeID, COUNT(*) AS TotalRooms
        FROM Rooms
        GROUP BY RoomTypeID
    )

    SELECT 
        r.RoomID,
        r.RoomNumber,
        rt.Name AS RoomType,
        d.Date,

        CASE 
            -- Đang ở
            WHEN o.RoomID IS NOT NULL THEN 'OCCUPIED'

            -- Đã đặt (có slot)
            WHEN 
                ISNULL(b.TotalBooked,0) > ISNULL(oc.TotalOccupied,0)
                AND ROW_NUMBER() OVER (
                    PARTITION BY r.RoomTypeID, d.Date 
                    ORDER BY r.RoomID
                ) <= (ISNULL(b.TotalBooked,0) - ISNULL(oc.TotalOccupied,0))
            THEN 'BOOKED'

            -- Trống
            ELSE 'AVAILABLE'
        END AS Status

    FROM Rooms r
    JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
    CROSS JOIN Dates d

    LEFT JOIN Occupied o 
        ON o.RoomID = r.RoomID AND o.Date = d.Date

    LEFT JOIN BookedByType b 
        ON b.RoomTypeID = r.RoomTypeID AND b.Date = d.Date

    LEFT JOIN OccupiedCount oc 
        ON oc.RoomTypeID = r.RoomTypeID AND oc.Date = d.Date

    ORDER BY r.RoomNumber, d.Date

    OPTION (MAXRECURSION 1000)
END

EXEC sp_GetRoomCalendar_Advanced 3,2026





















delete from Customers
delete from Guests
delete from InvoiceDetails
delete from Invoices
delete from MinibarItems
delete from MinibarUsages
delete from Payments
delete from Penalties
delete from Rates
delete from Receptionists
delete from ReservationRooms
delete from Reservations
delete from Rooms
delete from RoomStayHistory
delete from RoomTypes
delete from Services
delete from ServiceUsages
delete from Stays
delete from Users

select * from Customers
select * from Guests
select * from InvoiceDetails
select * from Invoices
select * from MinibarItems
select * from MinibarUsages
select * from Payments
select * from Penalties
select * from Rates
select * from Receptionists
select * from ReservationRooms
select * from Reservations
select * from Rooms
select * from RoomStayHistory
select * from RoomTypes
select * from Services
select * from ServiceUsages
select * from Stays
select * from Users