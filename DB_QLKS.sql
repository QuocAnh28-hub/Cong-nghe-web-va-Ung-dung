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
    @Phone NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserID INT;

    -- Thêm vào bảng Users với Role mặc định
    INSERT INTO Users (Email, PasswordHash, Role, CreatedAt)
    VALUES (@Email, @PasswordHash, 'RECEPTIONIST', GETDATE());

    -- Lấy UserID vừa tạo
    SET @UserID = SCOPE_IDENTITY();

    -- Thêm vào bảng Receptionists
    INSERT INTO Receptionists (FullName, Phone, UserID)
    VALUES (@FullName, @Phone, @UserID);
END

EXEC sp_CreateReceptionist
    @Email = 'nhanvien116@gmail.com',
    @PasswordHash = '123',
    @FullName = N'Thân Đức Huy',
    @Phone = '0366666666'

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

-------------Proc Load Nhân viên còn đi làm---------------------------------------
CREATE PROCEDURE sp_GetActiveReceptionists
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
    @Phone NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    -- Cập nhật bảng Users (KHÔNG đụng tới Role)
    UPDATE Users
    SET 
        Email = @Email,
        PasswordHash = @PasswordHash
    WHERE UserID = @UserID;

    -- Cập nhật bảng Receptionists
    UPDATE Receptionists
    SET 
        FullName = @FullName,
        Phone = @Phone
    WHERE UserID = @UserID;
END

EXEC sp_UpdateReceptionist
    @UserID = 26,
    @Email = N'nhanvien111@gmail.com',
    @PasswordHash = '123',
    @FullName = N'Đỗ Tiến Đạt',
    @Phone = '0399999999'

-------------Proc Xoá NV---------------------------------------------------------
CREATE PROCEDURE sp_DeleteReceptionist
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
		Name,
        DefaultPrice
    FROM RoomTypes
END

EXEC sp_GetDefaultRate

--Load giá theo mùa----------------------------------------------------------------------------
CREATE PROCEDURE sp_GetSeasonRate
AS
BEGIN
    SELECT 
        r.RateID,
        r.RoomTypeID,
        rt.Name AS RoomTypeName,
        r.Season,
        r.Price,
        r.StartDate,
        r.EndDate
    FROM Rates r
    INNER JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
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

---------------------------------------------------------------------------------------------------------------------------------------------------------------
-----------------------------------3333333333333333333333333333333333333333333333333333333333------------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------------------------------------------------------
--Công suất phòng (%phòng được sử dụng)--------------------------------------------------------------
CREATE PROCEDURE sp_GetRoomUsageByDate
    @FromDate DATE,
    @ToDate DATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TotalUsage INT;

    SELECT 
        @TotalUsage = COUNT(ID)
    FROM RoomStayHistory
    WHERE 
        CheckInTime >= @FromDate
        AND CheckInTime < DATEADD(DAY, 1, @ToDate);

    SELECT 
        rt.Name AS N'Loại phòng',         -- thêm loại phòng
        r.RoomNumber AS N'Số phòng',
        COUNT(rsh.ID) AS N'Lượt dùng',

        CASE 
            WHEN @TotalUsage = 0 THEN 0
            ELSE CAST(COUNT(rsh.ID) * 100.0 / @TotalUsage AS DECIMAL(5,2))
        END AS N'Tỷ lệ (%)'

    FROM Rooms r
    LEFT JOIN RoomTypes rt 
        ON r.RoomTypeID = rt.RoomTypeID   -- join loại phòng

    LEFT JOIN RoomStayHistory rsh 
        ON r.RoomID = rsh.RoomID
        AND rsh.CheckInTime >= @FromDate
        AND rsh.CheckInTime < DATEADD(DAY, 1, @ToDate)

    GROUP BY 
        rt.Name,
        r.RoomNumber

    ORDER BY COUNT(rsh.ID) DESC;
END

EXEC sp_GetRoomUsageByDate
    @FromDate = '2026-02-02',
    @ToDate = '2026-03-29'

--Doanh thu------------------------------------------------------------------------------------------
CREATE PROCEDURE sp_GetRevenueReportByDate
    @FromDate DATE,
    @ToDate DATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TotalRevenue DECIMAL(18,2) = 0;

    SELECT 
        @TotalRevenue = ISNULL(SUM(p.Amount), 0)
    FROM Payments p
    WHERE 
        p.PaymentDate >= @FromDate
        AND p.PaymentDate < DATEADD(DAY, 1, @ToDate);

    DECLARE @TotalVAT DECIMAL(18,2) = 0;

    SELECT 
        @TotalVAT = ISNULL(SUM(i.VAT), 0)
    FROM Invoices i
    WHERE 
        i.Date >= @FromDate
        AND i.Date < DATEADD(DAY, 1, @ToDate);

    SELECT 
        @TotalRevenue AS N'Tổng thu',
        @TotalVAT AS N'Tổng thuế VAT',
        (@TotalRevenue - @TotalVAT) AS N'Thu nhập sau thuế';
END

EXEC sp_GetRevenueReportByDate
    @FromDate = '2026-02-01',
    @ToDate   = '2026-03-29'

--Số lượt đặt phòng----------------------------------------------------------------------------------
CREATE PROCEDURE sp_GetReservationCountByDate
    @FromDate DATE,
    @ToDate DATE
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        COUNT(*) AS N'Số lần đặt phòng'
    FROM Reservations
    WHERE 
        CreatedAt >= @FromDate
        AND CreatedAt < DATEADD(DAY, 1, @ToDate);
END

EXEC sp_GetReservationCountByDate
    @FromDate = '2026-02-01',
    @ToDate   = '2026-03-29';

---	Load thông tin KH đã CheckOut đợi tạo hoá đơn để thanh toán ()------------------------------------
CREATE PROCEDURE sp_GetPendingInvoices
AS
BEGIN
    SELECT 
        r.RoomNumber,
        g.FullName AS CustomerName,
        rs.CheckInTime,
        rs.CheckOutTime,
        ISNULL(SUM(rs.RateAtThatTime), 0) AS EstimatedRoomCharge
    FROM Stays s
    JOIN Guests g ON s.GuestID = g.GuestID
    JOIN RoomStayHistory rs ON s.StayID = rs.StayID
    JOIN Rooms r ON rs.RoomID = r.RoomID
    LEFT JOIN Invoices i ON s.StayID = i.StayID
    WHERE s.Status = 'COMPLETED'
        AND (i.InvoiceID IS NULL OR i.Status != 'PAID')
    GROUP BY r.RoomNumber, g.FullName, rs.CheckInTime, rs.CheckOutTime
END

EXEC sp_GetPendingInvoices

---	Tạo hoá đơn---------------------------------------------------------------------------------------
CREATE PROCEDURE sp_CreateInvoice
    @StayID INT
AS
BEGIN
    DECLARE @InvoiceID INT
    DECLARE @Total DECIMAL(14,2) = 0

    -- 1. Tạo Invoice
    INSERT INTO Invoices (StayID, TotalAmount, VAT, Status)
    VALUES (@StayID, 0, 0, 'OPEN')

    SET @InvoiceID = SCOPE_IDENTITY()

    -----------------------------------
    -- 2. ROOM CHARGE
    -----------------------------------
    INSERT INTO InvoiceDetails (InvoiceID, ItemType, ItemName, Quantity, UnitPrice, Amount)
    SELECT 
        @InvoiceID,
        'ROOM',
        r.RoomNumber,
        DATEDIFF(DAY, rs.CheckInTime, rs.CheckOutTime),
        rs.RateAtThatTime,
        DATEDIFF(DAY, rs.CheckInTime, rs.CheckOutTime) * rs.RateAtThatTime
    FROM RoomStayHistory rs
    JOIN Rooms r ON rs.RoomID = r.RoomID
    WHERE rs.StayID = @StayID

    -----------------------------------
    -- 3. SERVICES
    -----------------------------------
    INSERT INTO InvoiceDetails
    SELECT
        @InvoiceID,
        'SERVICE',
        s.ServiceName,
        su.Quantity,
        s.Price,
        su.Quantity * s.Price
    FROM ServiceUsages su
    JOIN Services s ON su.ServiceID = s.ServiceID
    WHERE su.StayID = @StayID

    -----------------------------------
    -- 4. MINIBAR
    -----------------------------------
    INSERT INTO InvoiceDetails
    SELECT
        @InvoiceID,
        'MINIBAR',
        m.ItemName,
        mu.Quantity,
        m.Price,
        mu.Quantity * m.Price
    FROM MinibarUsages mu
    JOIN MinibarItems m ON mu.MinibarID = m.MinibarID
    WHERE mu.StayID = @StayID

    -----------------------------------
    -- 5. PENALTIES
    -----------------------------------
    INSERT INTO InvoiceDetails
    SELECT
        @InvoiceID,
        'PENALTY',
        p.Reason,
        1,
        p.Amount,
        p.Amount
    FROM Penalties p
    WHERE p.StayID = @StayID

    -----------------------------------
    -- 6. UPDATE TOTAL
    -----------------------------------
    SELECT @Total = SUM(Amount)
    FROM InvoiceDetails
    WHERE InvoiceID = @InvoiceID

    UPDATE Invoices
    SET TotalAmount = @Total
    WHERE InvoiceID = @InvoiceID

    SELECT @InvoiceID AS InvoiceID, @Total AS Total
END

--Thanh toán hoá đơn-----------------------------------------------------------------------------------
CREATE PROCEDURE sp_PayInvoice
    @InvoiceID INT,
    @Method NVARCHAR(20)
AS
BEGIN
    DECLARE @Amount DECIMAL(14,2)

    SELECT @Amount = TotalAmount FROM Invoices WHERE InvoiceID = @InvoiceID

    INSERT INTO Payments (InvoiceID, PaymentMethod, Amount)
    VALUES (@InvoiceID, @Method, @Amount)

    UPDATE Invoices
    SET Status = 'PAID'
    WHERE InvoiceID = @InvoiceID
END

--Load lịch sử hoá đơn---------------------------------------------------------------------------------
CREATE PROCEDURE sp_GetInvoiceHistory
AS
BEGIN
    SELECT 
        r.RoomNumber,
        g.FullName,
        i.Date,
        i.TotalAmount,
        i.Status
    FROM Invoices i
    JOIN Stays s ON i.StayID = s.StayID
    JOIN Guests g ON s.GuestID = g.GuestID
    JOIN RoomStayHistory rs ON s.StayID = rs.StayID
    JOIN Rooms r ON rs.RoomID = r.RoomID
    WHERE i.Status = 'PAID'
END

EXEC sp_GetInvoiceHistory















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
select * from Admin



INSERT INTO Users (Email, PasswordHash, Role)
VALUES
('a@gmail.com','123','CUSTOMER'),
('b@gmail.com','123','CUSTOMER'),
('c@gmail.com','123','CUSTOMER'),
('d@gmail.com','123','CUSTOMER'),
('e@gmail.com','123','CUSTOMER'),
('f@gmail.com','123','CUSTOMER'),
('g@gmail.com','123','CUSTOMER'),
('h@gmail.com','123','CUSTOMER'),
('i@gmail.com','123','CUSTOMER'),
('j@gmail.com','123','CUSTOMER'),
('k@gmail.com','123','CUSTOMER'),
('l@gmail.com','123','CUSTOMER'),
('m@gmail.com','123','CUSTOMER'),
('n@gmail.com','123','CUSTOMER'),
('o@gmail.com','123','CUSTOMER'),
('p@gmail.com','123','CUSTOMER'),
('q@gmail.com','123','CUSTOMER'),
('r@gmail.com','123','CUSTOMER'),
('s@gmail.com','123','CUSTOMER'),
('t@gmail.com','123','CUSTOMER');

INSERT INTO Customers (FullName, Phone, UserID)
SELECT 
    N'Khách ' + CAST(u.UserID AS NVARCHAR),
    '09000000' + RIGHT('000' + CAST(u.UserID AS NVARCHAR), 3),
    u.UserID
FROM Users u
LEFT JOIN Customers c ON u.UserID = c.UserID
WHERE c.UserID IS NULL;

INSERT INTO RoomTypes (Name, Description, Capacity, DefaultPrice)
VALUES
(N'Single', N'1 người', 1, 300000),
(N'Double', N'2 người', 2, 500000),
(N'Family', N'4 người', 4, 800000),
(N'VIP', N'Cao cấp', 2, 1500000),
(N'Deluxe', N'Sang trọng', 2, 1000000);

INSERT INTO Rooms (RoomNumber, RoomTypeID)
VALUES
('105',8),('106',8),('103',8),('104',8),
('205',9),('202',9),('203',9),('204',9),
('301',10),('302',10),('303',10),('304',10),
('401',11),('402',11),('403',11),('404',11),
('501',12),('502',12),('503',12),('504',12);

INSERT INTO Rates (RoomTypeID, Price, StartDate, EndDate, Season)
VALUES
(8,300000,'2026-01-01','2026-12-31','Normal'),
(9,500000,'2026-01-01','2026-12-31','Normal'),
(10,800000,'2026-01-01','2026-12-31','Normal'),
(11,1500000,'2026-01-01','2026-12-31','Normal'),
(12,1000000,'2026-01-01','2026-12-31','Normal');

INSERT INTO Reservations (UserID, CheckInDate, CheckOutDate, Status)
VALUES
(6,'2025-03-01','2025-03-03','COMPLETED'),
(7,'2025-03-02','2025-03-05','COMPLETED'),
(8,'2025-03-03','2025-03-06','COMPLETED'),
(9,'2025-03-04','2025-03-07','COMPLETED'),
(10,'2025-03-05','2025-03-08','COMPLETED'),
(11,'2025-03-06','2025-03-09','CHECKED_IN'),
(12,'2025-03-07','2025-03-10','BOOKED'),
(13,'2025-03-08','2025-03-11','BOOKED'),
(14,'2025-03-09','2025-03-12','CANCELLED'),
(15,'2025-03-10','2025-03-13','COMPLETED');

INSERT INTO ReservationRooms (ReservationID, RoomTypeID, Quantity, PriceAtBooking)
VALUES
(1,8,1,300000),
(2,9,1,500000),
(3,10,1,800000),
(4,11,1,1500000),
(5,12,1,1000000),
(6,8,1,300000),
(7,9,1,500000),
(8,10,1,800000),
(9,11,1,1500000),
(10,12,1,1000000);

INSERT INTO Guests (FullName, IdentityType, IdentityNumber)
VALUES
(N'Nguyễn A','CCCD','111'),
(N'Trần B','CCCD','222'),
(N'Lê C','CCCD','333'),
(N'Phạm D','CCCD','444'),
(N'Hoàng E','CCCD','555'),
(N'Vũ F','CCCD','666'),
(N'Đặng G','CCCD','777'),
(N'Bùi H','CCCD','888'),
(N'Đỗ I','CCCD','999'),
(N'Ngô K','CCCD','1010');

INSERT INTO Stays (ReservationID, GuestID, ActualCheckIn, ActualCheckOut, Status)
VALUES
(1,1,'2025-03-01','2025-03-03','COMPLETED'),
(2,2,'2025-03-02','2025-03-05','COMPLETED'),
(3,3,'2025-03-03','2025-03-06','COMPLETED'),
(4,4,'2025-03-04','2025-03-07','COMPLETED'),
(5,5,'2025-03-05','2025-03-08','COMPLETED'),
(6,6,'2025-03-06',NULL,'CHECKED_IN'),
(10,7,'2025-03-10','2025-03-13','COMPLETED');

INSERT INTO RoomStayHistory (StayID, RoomID, CheckInTime, CheckOutTime, RateAtThatTime)
VALUES
(1,20,'2025-03-01','2025-03-03',300000),
(2,25,'2025-03-02','2025-03-05',500000),
(3,28,'2025-03-03','2025-03-06',800000),
(4,29,'2025-03-04','2025-03-07',1500000),
(5,36,'2025-03-05','2025-03-08',1000000),
(7,33,'2025-03-10','2025-03-13',300000);

INSERT INTO Services (ServiceName, Price)
VALUES
(N'Giặt ủi',50000),
(N'Ăn sáng',100000),
(N'Spa',300000),
(N'Đưa đón sân bay',200000),
(N'Dọn phòng',50000);

INSERT INTO ServiceUsages (StayID, ServiceID, Quantity)
VALUES
(1,1,2),
(1,2,2),
(2,2,3),
(3,3,1),
(4,4,1),
(5,1,1),
(5,5,2);

INSERT INTO MinibarItems (RoomTypeID, ItemName, Price)
VALUES
(8,N'Nước suối',20000),
(9,N'Bia',50000),
(10,N'Nước suối',20000),
(11,N'Bia',50000),
(12,N'Nước suối',20000);

INSERT INTO MinibarUsages (StayID, MinibarID, Quantity)
VALUES
(1,6,2),
(1,2,1),
(2,3,2),
(3,4,3),
(5,5,1);

INSERT INTO Penalties (StayID, Reason, Amount)
VALUES
(1,N'Làm hỏng đồ',200000),
(3,N'Hút thuốc',100000),
(5,N'Mất khăn',50000);

INSERT INTO Invoices (StayID, TotalAmount, VAT, Status)
VALUES
(1,1000000,100000,'PAID'),
(2,1500000,150000,'PAID'),
(3,2000000,200000,'OPEN');

INSERT INTO InvoiceDetails (InvoiceID, ItemType, ItemName, Quantity, UnitPrice, Amount)
VALUES
(1,'ROOM','101',2,300000,600000),
(1,'SERVICE','Ăn sáng',2,100000,200000),
(2,'ROOM','201',3,500000,1500000),
(3,'ROOM','301',3,800000,2400000);

INSERT INTO Payments (InvoiceID, PaymentMethod, Amount)
VALUES
(1,'CASH',1100000),
(2,'TRANSFER',1650000);