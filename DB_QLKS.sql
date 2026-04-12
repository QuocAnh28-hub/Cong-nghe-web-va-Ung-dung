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
	CCCD NVARCHAR(20)
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
        CHECK (Status IN ('AVAILABLE','OCCUPIED','MAINTENANCE','DIRTY')),
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
    Status NVARCHAR(20),
    CHECK (Status IN ('CHECKED_IN','COMPLETED')),
    FOREIGN KEY (ReservationID) REFERENCES Reservations(ReservationID),
    FOREIGN KEY (GuestID) REFERENCES Guests(GuestID),
	ExpectedCheckOut DATETIME
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
    @Email = 'nhanvien120@gmail.com',
    @PasswordHash = '123',
    @FullName = N'Trần Phạm Hà',
    @Phone = '0333333333'

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
CREATE TABLE Rooms
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

--Load khách hàng và số lần lưu trú-------------------------------------------------
CREATE PROCEDURE sp_GetCustomersFullInfo
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        c.CustomerID,
        c.UserID,          
        c.FullName,
        c.Phone,
        c.CCCD,
        u.Email,

        COUNT(CASE WHEN s.Status = 'COMPLETED' THEN 1 END) AS TotalStays,
        ISNULL(SUM(i.TotalAmount),0) AS TotalSpent,
        MAX(s.ActualCheckIn) AS LastStay

    FROM Customers c
    LEFT JOIN Users u ON c.UserID = u.UserID
    LEFT JOIN Reservations r ON r.UserID = u.UserID
    LEFT JOIN Stays s ON s.ReservationID = r.ReservationID
    LEFT JOIN Invoices i ON i.StayID = s.StayID

    GROUP BY 
        c.CustomerID,
        c.UserID,         
        c.FullName,
        c.Phone,
        c.CCCD,
        u.Email
END

EXEC sp_GetCustomersFullInfo

--Thêm customers--------------------------------------------------------------------
ALTER PROCEDURE sp_Customers_Insert
    @FullName NVARCHAR(255),
    @Phone NVARCHAR(20),
    @CCCD NVARCHAR(20),
    @Email NVARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserID INT

    -------------------------------------------------
    -- 1. Validate Email không trùng
    -------------------------------------------------
    IF EXISTS (SELECT 1 FROM Users WHERE Email = @Email)
    BEGIN
        RAISERROR (N'Email đã tồn tại', 16, 1)
        RETURN
    END

    -------------------------------------------------
    -- 2. Validate CCCD không trùng
    -------------------------------------------------
    IF EXISTS (SELECT 1 FROM Customers WHERE CCCD = @CCCD)
    BEGIN
        RAISERROR (N'CCCD đã tồn tại', 16, 1)
        RETURN
    END

    -------------------------------------------------
    -- 3. Tạo User (Role = CUSTOMER)
    -------------------------------------------------
    INSERT INTO Users (Email, PasswordHash, Role)
    VALUES (@Email, '123', 'CUSTOMER')

    SET @UserID = SCOPE_IDENTITY()

    -------------------------------------------------
    -- 4. Tạo Customer
    -------------------------------------------------
    INSERT INTO Customers (FullName, Phone, UserID, CCCD)
    VALUES (@FullName, @Phone, @UserID, @CCCD)
END

EXEC sp_Customers_Insert
    @FullName = N'Nguyễn Văn A',
    @Phone = '0988888888',
    @CCCD = '123456789012',
    @Email = 'vana@gmail.com',
    @PasswordHash = '123456'

--Sửa customers--------------------------------------------------------------------
ALTER PROCEDURE sp_Customers_Update
    @CustomerID INT,
    @FullName NVARCHAR(255),
    @Phone NVARCHAR(20),
    @CCCD NVARCHAR(20),
    @Email NVARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserID INT
    DECLARE @OldCCCD NVARCHAR(20)
    DECLARE @OldEmail NVARCHAR(150)

    BEGIN TRAN

    BEGIN TRY

        -------------------------------------------------
        -- 1. Lấy dữ liệu cũ
        -------------------------------------------------
        SELECT 
            @UserID = c.UserID,
            @OldCCCD = c.CCCD,
            @OldEmail = u.Email
        FROM Customers c
        LEFT JOIN Users u ON c.UserID = u.UserID
        WHERE c.CustomerID = @CustomerID

        IF @UserID IS NULL
        BEGIN
            RAISERROR (N'Customer không tồn tại', 16, 1)
            ROLLBACK
            RETURN
        END

        -------------------------------------------------
        -- 2. Check CCCD (chỉ khi thay đổi)
        -------------------------------------------------
        IF (@CCCD IS NOT NULL AND @CCCD <> @OldCCCD)
        BEGIN
            IF EXISTS (
                SELECT 1 FROM Customers 
                WHERE CCCD = @CCCD AND CustomerID <> @CustomerID
            )
            BEGIN
                RAISERROR (N'CCCD đã tồn tại', 16, 1)
                ROLLBACK
                RETURN
END
        END

        -------------------------------------------------
        -- 3. Check Email (chỉ khi thay đổi)
        -------------------------------------------------
        IF (@Email IS NOT NULL AND @Email <> @OldEmail)
        BEGIN
            IF EXISTS (
                SELECT 1 FROM Users 
                WHERE Email = @Email AND UserID <> @UserID
            )
            BEGIN
                RAISERROR (N'Email đã tồn tại', 16, 1)
                ROLLBACK
                RETURN
            END
        END

        -------------------------------------------------
        -- 4. Update Customers
        -------------------------------------------------
        UPDATE Customers
        SET 
            FullName = @FullName,
            Phone = @Phone,
            CCCD = ISNULL(@CCCD, CCCD)
        WHERE CustomerID = @CustomerID

        -------------------------------------------------
        -- 5. Update Users
        -------------------------------------------------
        UPDATE Users
        SET Email = ISNULL(@Email, Email)
        WHERE UserID = @UserID

        COMMIT

    END TRY
    BEGIN CATCH
        ROLLBACK
        RAISERROR ('ERROR', 16, 1)
    END CATCH
END

EXEC sp_Customers_Update
    @CustomerID = 2,
    @FullName = N'Nguyễn Văn B',
    @Phone = '0909999999',
    @CCCD = '123456789012',
    @Email = 'newemail@gmail.com'

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
		rt.DefaultPrice,
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

    -- Kiểm tra ngày hợp lệ
    IF (@StartDate > @EndDate)
    BEGIN
        RAISERROR(N'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc', 16, 1);
        RETURN;
    END

    -- Kiểm tra trùng khoảng ngày
    IF EXISTS (
        SELECT 1
        FROM Rates
        WHERE RoomTypeID = @RoomTypeID
          AND (
                @StartDate <= EndDate
                AND @EndDate >= StartDate
              )
    )
    BEGIN
        RAISERROR(N'Khoảng thời gian này đã tồn tại giá cho loại phòng này', 16, 1);
        RETURN;
    END

    -- Nếu không trùng thì insert
    INSERT INTO Rates (RoomTypeID, Price, StartDate, EndDate, Season)
    VALUES (@RoomTypeID, @Price, @StartDate, @EndDate, @Season);
END;

EXEC usp_InsertRate 
    @RoomTypeID = 8,
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

    DECLARE 
        @NewRoomTypeID INT,
        @NewStartDate DATE,
        @NewEndDate DATE;

    SELECT 
        @NewRoomTypeID = COALESCE(@RoomTypeID, RoomTypeID),
        @NewStartDate  = COALESCE(@StartDate, StartDate),
        @NewEndDate    = COALESCE(@EndDate, EndDate)
    FROM Rates
    WHERE RateID = @RateID;

    IF (@NewStartDate > @NewEndDate)
    BEGIN
        RAISERROR(N'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc', 16, 1);
        RETURN;
    END

    IF EXISTS (
        SELECT 1
        FROM Rates
        WHERE RoomTypeID = @NewRoomTypeID
          AND RateID <> @RateID
          AND (
                @NewStartDate <= EndDate
                AND @NewEndDate >= StartDate
              )
    )
    BEGIN
        RAISERROR(N'Khoảng thời gian bị trùng với giá khác của loại phòng này', 16, 1);
        RETURN;
    END

    UPDATE Rates
    SET 
        RoomTypeID = COALESCE(@RoomTypeID, RoomTypeID),
        Price      = COALESCE(@Price, Price),
        StartDate  = COALESCE(@StartDate, StartDate),
        EndDate    = COALESCE(@EndDate, EndDate),
        Season     = COALESCE(@Season, Season)
    WHERE RateID = @RateID;

END;

EXEC usp_UpdateSeasonalRate 
    @RateID = 8,
    @RoomTypeID = 12,
    @Price = 800000.00,
    @StartDate = '2026-06-28',
    @EndDate = '2026-06-30',
	@Season = N'Ưu đãi cuối năm'

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

    ;WITH Dates AS (
        SELECT @StartDate AS [Date]
        UNION ALL
        SELECT DATEADD(DAY, 1, [Date])
        FROM Dates
        WHERE [Date] < @EndDate
    ),

    -------------------------------------------------
    -- 🟥 OCCUPIED (THEO STAY)
    -------------------------------------------------
    Occupied AS (
        SELECT 
            rsh.RoomID,
            d.Date
        FROM Stays s
        JOIN RoomStayHistory rsh ON rsh.StayID = s.StayID
        JOIN Dates d 
            ON d.Date >= CAST(s.ActualCheckIn AS DATE)
           AND d.Date < CAST(ISNULL(s.ExpectedCheckOut, GETDATE()) AS DATE)
        WHERE s.Status = 'CHECKED_IN'
    ),

    -------------------------------------------------
    -- 🟤 DIRTY (1 NGÀY SAU CHECKOUT)
    -------------------------------------------------
    Dirty AS (
        SELECT 
            rsh.RoomID,
            CAST(s.ActualCheckOut AS DATE) AS Date
        FROM Stays s
        JOIN RoomStayHistory rsh ON rsh.StayID = s.StayID
        WHERE s.Status = 'COMPLETED'
          AND s.ActualCheckOut IS NOT NULL
    ),

    -------------------------------------------------
    -- 🔵 BOOKED (THEO LOẠI PHÒNG)
    -------------------------------------------------
    BookedByType AS (
        SELECT 
            rr.RoomTypeID,
            d.Date,
            SUM(rr.Quantity) AS TotalBooked
        FROM Reservations re
        JOIN ReservationRooms rr ON rr.ReservationID = re.ReservationID
        JOIN Dates d 
            ON d.Date >= re.CheckInDate
           AND d.Date < re.CheckOutDate
        WHERE re.Status = 'BOOKED'
        GROUP BY rr.RoomTypeID, d.Date
    ),

    -------------------------------------------------
    -- 🟥 COUNT OCCUPIED THEO TYPE
    -------------------------------------------------
    OccupiedCount AS (
        SELECT 
            r.RoomTypeID,
            o.Date,
            COUNT(*) AS TotalOccupied
        FROM Occupied o
        JOIN Rooms r ON r.RoomID = o.RoomID
        GROUP BY r.RoomTypeID, o.Date
    )

    -------------------------------------------------
    -- MAIN
    -------------------------------------------------
    SELECT 
        r.RoomID,
        r.RoomNumber,
        rt.Name AS RoomType,
        d.Date,

        CASE 
            -----------------------------------------
            WHEN r.Status = 'MAINTENANCE' THEN 'MAINTENANCE'

            -----------------------------------------
            WHEN o.RoomID IS NOT NULL THEN 'OCCUPIED'

            -----------------------------------------
            WHEN di.RoomID IS NOT NULL THEN 'DIRTY'

            -----------------------------------------
            WHEN 
                ISNULL(b.TotalBooked,0) > ISNULL(oc.TotalOccupied,0)
                AND o.RoomID IS NULL
AND di.RoomID IS NULL
            THEN 'BOOKED'

            -----------------------------------------
            ELSE 'AVAILABLE'
        END AS Status

    FROM Rooms r
    JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
    CROSS JOIN Dates d

    LEFT JOIN Occupied o 
        ON o.RoomID = r.RoomID AND o.Date = d.Date

    LEFT JOIN Dirty di
        ON di.RoomID = r.RoomID AND di.Date = d.Date

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
    SET NOCOUNT ON;

    SELECT 
        s.StayID,
        g.FullName AS GuestName,
        g.IdentityNumber,

        s.ActualCheckIn,
        s.ActualCheckOut,

        -- Tiền phòng
        ISNULL(rh.TotalRoomCharge, 0) AS RoomCharge,

        -- Service
        ISNULL(sv.TotalServiceCharge, 0) AS ServiceCharge,

        -- Minibar
        ISNULL(mb.TotalMinibarCharge, 0) AS MinibarCharge,

        -- Penalty
        ISNULL(pn.TotalPenalty, 0) AS PenaltyCharge,

        -- Tổng tiền
        ISNULL(rh.TotalRoomCharge, 0)
        + ISNULL(sv.TotalServiceCharge, 0)
        + ISNULL(mb.TotalMinibarCharge, 0)
        + ISNULL(pn.TotalPenalty, 0) AS TotalAmount

    FROM Stays s
    JOIN Guests g ON s.GuestID = g.GuestID
    LEFT JOIN Invoices i ON s.StayID = i.StayID

    -------------------------------------------------
    -- ROOM (gom theo StayID)
    -------------------------------------------------
    LEFT JOIN (
    SELECT 
        StayID,
		SUM(
            CASE 
                WHEN DATEDIFF(DAY, CheckInTime, CheckOutTime) = 0 
                    THEN 1
                ELSE DATEDIFF(DAY, CheckInTime, CheckOutTime)
            END * RateAtThatTime) AS TotalRoomCharge
    FROM RoomStayHistory
    GROUP BY StayID) rh ON rh.StayID = s.StayID

    -------------------------------------------------
    -- SERVICE
    -------------------------------------------------
    LEFT JOIN (
        SELECT 
            su.StayID,
            SUM(su.Quantity * sv.Price) AS TotalServiceCharge
        FROM ServiceUsages su
        JOIN Services sv ON su.ServiceID = sv.ServiceID
        GROUP BY su.StayID
    ) sv ON sv.StayID = s.StayID

    -------------------------------------------------
    -- MINIBAR
    -------------------------------------------------
    LEFT JOIN (
        SELECT 
            mu.StayID,
            SUM(mu.Quantity * mi.Price) AS TotalMinibarCharge
        FROM MinibarUsages mu
        JOIN MinibarItems mi ON mu.MinibarID = mi.MinibarID
        GROUP BY mu.StayID
    ) mb ON mb.StayID = s.StayID

    -------------------------------------------------
    -- PENALTY
    -------------------------------------------------
    LEFT JOIN (
        SELECT 
            StayID,
            SUM(Amount) AS TotalPenalty
        FROM Penalties
        GROUP BY StayID
    ) pn ON pn.StayID = s.StayID

    -------------------------------------------------
    WHERE 
        s.Status = 'COMPLETED'
        AND (i.InvoiceID IS NULL OR i.Status != 'PAID')
	ORDER BY s.ActualCheckOut DESC
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

-----Tạo hoá đơn và thanh toán luôn---------------------------------------
CREATE PROCEDURE sp_CreateAndPayInvoice
    @StayID INT,
    @Method NVARCHAR(20),
    @VAT DECIMAL(5,2) -- %
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRAN

    DECLARE 
        @InvoiceID INT,
        @SubTotal DECIMAL(14,2) = 0,
        @VATAmount DECIMAL(14,2) = 0,
        @Total DECIMAL(14,2) = 0

    -------------------------------------------------
    -- 1. TẠO INVOICE
    -------------------------------------------------
    INSERT INTO Invoices (StayID, TotalAmount, VAT, Status)
    VALUES (@StayID, 0, @VAT, 'OPEN')

    SET @InvoiceID = SCOPE_IDENTITY()

    -------------------------------------------------
    -- 2. ROOM CHARGE
    -------------------------------------------------
    INSERT INTO InvoiceDetails (InvoiceID, ItemType, ItemName, Quantity, UnitPrice, Amount)
    SELECT 
        @InvoiceID,
        'ROOM',
        r.RoomNumber,

        -- FIX chuẩn số ngày
        CASE 
            WHEN DATEDIFF(HOUR, rs.CheckInTime, rs.CheckOutTime) <= 0 THEN 1
            ELSE CEILING(DATEDIFF(HOUR, rs.CheckInTime, rs.CheckOutTime) / 24.0)
        END,

        rs.RateAtThatTime,

        CASE 
            WHEN DATEDIFF(HOUR, rs.CheckInTime, rs.CheckOutTime) <= 0 THEN 1
            ELSE CEILING(DATEDIFF(HOUR, rs.CheckInTime, rs.CheckOutTime) / 24.0)
        END * rs.RateAtThatTime

    FROM RoomStayHistory rs
    JOIN Rooms r ON rs.RoomID = r.RoomID
    WHERE rs.StayID = @StayID

    -------------------------------------------------
    -- 3. SERVICES
    -------------------------------------------------
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

    -------------------------------------------------
    -- 4. MINIBAR
    -------------------------------------------------
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

    -------------------------------------------------
    -- 5. PENALTIES
    -------------------------------------------------
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

    -------------------------------------------------
    -- 6. SUBTOTAL
    -------------------------------------------------
    SELECT @SubTotal = ISNULL(SUM(Amount), 0)
    FROM InvoiceDetails
    WHERE InvoiceID = @InvoiceID

    -------------------------------------------------
    -- 7. VAT + TOTAL
    -------------------------------------------------
    SET @VATAmount = @SubTotal * (@VAT / 100.0)
    SET @Total = @SubTotal + @VATAmount

    -------------------------------------------------
    -- 8. UPDATE INVOICE
    -------------------------------------------------
    UPDATE Invoices
    SET 
        TotalAmount = @Total,
        VAT = @VAT,
        Status = 'PAID'
    WHERE InvoiceID = @InvoiceID

    -------------------------------------------------
    -- 9. PAYMENT
    -------------------------------------------------
    INSERT INTO Payments (InvoiceID, PaymentMethod, Amount)
    VALUES (@InvoiceID, @Method, @Total)

    COMMIT

    -------------------------------------------------
    -- 10. RETURN
    -------------------------------------------------
    SELECT 
        @InvoiceID AS InvoiceID, 
        @SubTotal AS SubTotal,
        @VATAmount AS VATAmount,
        @Total AS Total
END

---Load những phòng khách đã ở (có thể nhiều phòng)-----------
CREATE PROCEDURE sp_GetRoomStayHistory_CheckedOut_ByStayID
    @StayID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        ROW_NUMBER() OVER (ORDER BY rs.CheckInTime) AS STT,

        rs.ID,
        rs.RoomID,
        r.RoomNumber AS SoPhong,
        rt.Name AS RoomType,

        rs.CheckInTime,
        rs.CheckOutTime,

        rs.RateAtThatTime,

        CASE 
            WHEN DATEDIFF(HOUR, rs.CheckInTime, rs.CheckOutTime) <= 0 THEN 1
            ELSE CEILING(DATEDIFF(HOUR, rs.CheckInTime, rs.CheckOutTime) / 24.0)
        END * rs.RateAtThatTime AS Amount

    FROM RoomStayHistory rs
    JOIN Rooms r 
        ON rs.RoomID = r.RoomID
    JOIN RoomTypes rt 
        ON r.RoomTypeID = rt.RoomTypeID

    WHERE rs.StayID = @StayID
      AND rs.CheckOutTime IS NOT NULL

    ORDER BY rs.CheckInTime
END
EXEC sp_GetRoomStayHistory_CheckedOut_ByStayID 3

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
        g.FullName,
        i.Date,
        i.TotalAmount,
        i.Status
    FROM Invoices i
    JOIN Stays s ON i.StayID = s.StayID
    JOIN Guests g ON s.GuestID = g.GuestID
    WHERE i.Status = 'PAID'
	ORDER BY i.Date DESC
END
EXEC sp_GetInvoiceHistory

----------------------------------------------------------------------------------------------------------------------
-----------------555555555555555555-----------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------------------------
---	Thêm lịch đặt của khách cũ (dựa theo thông tin khách hàng đã lưu)---------------------------------------------
CREATE PROCEDURE sp_CreateReservation
    @UserID INT,
    @RoomTypeID INT,
    @Quantity INT,
    @CheckInDate DATE,
    @CheckOutDate DATE
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Kiểm tra ngày hợp lệ
        IF (@CheckInDate >= @CheckOutDate)
        BEGIN
            RAISERROR(N'Ngày không hợp lệ', 16, 1);
            ROLLBACK;
            RETURN;
        END

        -- 2. Tổng số phòng của loại này
        DECLARE @TotalRooms INT;
        SELECT @TotalRooms = COUNT(*)
        FROM Rooms
        WHERE RoomTypeID = @RoomTypeID;

        -- 3. Số phòng đã được đặt (Reservation)
		DECLARE @BookedRooms INT;
		SELECT @BookedRooms = ISNULL(SUM(rr.Quantity), 0)
		FROM ReservationRooms rr
		JOIN Reservations r ON rr.ReservationID = r.ReservationID
		WHERE rr.RoomTypeID = @RoomTypeID
		AND r.Status IN ('BOOKED','CHECKED_IN')
		AND (
			r.CheckInDate < @CheckOutDate AND 
			r.CheckOutDate > @CheckInDate
		);

		-- 3.1 Số phòng đang OCCUPIED (Stay thật)
		DECLARE @OccupiedRooms INT;
		SELECT @OccupiedRooms = COUNT(DISTINCT rsh.RoomID)
		FROM RoomStayHistory rsh
		JOIN Rooms rm ON rsh.RoomID = rm.RoomID
		JOIN Stays s ON rsh.StayID = s.StayID
		WHERE rm.RoomTypeID = @RoomTypeID
		AND s.Status = 'CHECKED_IN'
		AND (
			rsh.CheckInTime < @CheckOutDate AND 
			ISNULL(rsh.CheckOutTime, s.ExpectedCheckOut) > @CheckInDate
		);

		-- 3.2 Tổng phòng đã bị chiếm
		DECLARE @UsedRooms INT;
		SET @UsedRooms = @BookedRooms + @OccupiedRooms;


        -- 4. Kiểm tra đủ phòng không
        IF (@TotalRooms - @BookedRooms < @Quantity)
        BEGIN
            RAISERROR(N'Không đủ phòng trống', 16, 1);
            ROLLBACK;
            RETURN;
        END

        -- 5. Lấy giá tại thời điểm đặt (Rates)
        DECLARE @Price DECIMAL(10,2);

        SELECT TOP 1 @Price = Price
        FROM Rates
        WHERE RoomTypeID = @RoomTypeID
        AND @CheckInDate BETWEEN StartDate AND EndDate
        ORDER BY StartDate DESC;

        -- nếu không có giá thì lấy default
        IF @Price IS NULL
        BEGIN
            SELECT @Price = DefaultPrice
            FROM RoomTypes
            WHERE RoomTypeID = @RoomTypeID;
        END

        -- 6. Tạo Reservation
        INSERT INTO Reservations(UserID, CheckInDate, CheckOutDate, Status)
        VALUES (@UserID, @CheckInDate, @CheckOutDate, 'BOOKED');

        DECLARE @ReservationID INT = SCOPE_IDENTITY();

        -- 7. Tạo ReservationRooms
        INSERT INTO ReservationRooms(ReservationID, RoomTypeID, Quantity, PriceAtBooking)
        VALUES (@ReservationID, @RoomTypeID, @Quantity, @Price);

        COMMIT;

        -- 8. Trả kết quả
        SELECT 
            @ReservationID AS ReservationID,
            @Price AS PricePerRoom,
            (@Price * @Quantity) AS TotalPrice;

    END TRY
    BEGIN CATCH
        ROLLBACK;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END
EXEC sp_CreateReservation
    @UserID = 5,
    @RoomTypeID = 1,  -- Deluxe
    @Quantity = 5,
    @CheckInDate = '2026-04-10',
    @CheckOutDate = '2026-04-12';

-----Thêm lịch đặt khách mới (Lưu thông tin khách hàng mới)-------------------------------------
CREATE PROCEDURE sp_CreateReservation_WithNewCustomer
    @FullName NVARCHAR(150),
    @Phone NVARCHAR(20),
    @CCCD NVARCHAR(20),
    @Email NVARCHAR(150),

    @RoomTypeID INT,
    @Quantity INT,
    @CheckInDate DATE,
    @CheckOutDate DATE
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -------------------------------------------------
        -- 1. Validate ngày
        -------------------------------------------------
        IF (@CheckInDate >= @CheckOutDate)
        BEGIN
            RAISERROR(N'Ngày không hợp lệ', 16, 1);
            ROLLBACK;
            RETURN;
        END

        -------------------------------------------------
        -- 2. TẠO USER
        -------------------------------------------------
        DECLARE @UserID INT;

        INSERT INTO Users(Email, PasswordHash, Role, Status)
        VALUES (
            @Email,
            '123', -- hoặc NULL / random
            'CUSTOMER',
            'ACTIVE'
        );

        SET @UserID = SCOPE_IDENTITY();

        -------------------------------------------------
        -- 3. TẠO CUSTOMER
        -------------------------------------------------
        DECLARE @CustomerID INT;

        INSERT INTO Customers(FullName, Phone, CCCD, UserID)
        VALUES (@FullName, @Phone, @CCCD, @UserID);

        SET @CustomerID = SCOPE_IDENTITY();

        -------------------------------------------------
		-- 4. CHECK PHÒNG TRỐNG
		-------------------------------------------------
		DECLARE @TotalRooms INT;
		SELECT @TotalRooms = COUNT(*)
		FROM Rooms
		WHERE RoomTypeID = @RoomTypeID;

		-- 4.1 Phòng đã BOOKED (Reservation)
		DECLARE @BookedRooms INT;
		SELECT @BookedRooms = ISNULL(SUM(rr.Quantity), 0)
		FROM ReservationRooms rr
		JOIN Reservations r ON rr.ReservationID = r.ReservationID
		WHERE rr.RoomTypeID = @RoomTypeID
		AND r.Status IN ('BOOKED','CHECKED_IN')
		AND (
			r.CheckInDate < @CheckOutDate AND 
			r.CheckOutDate > @CheckInDate
		);

		-- 4.2 Phòng đang OCCUPIED (Stay thực tế)
		DECLARE @OccupiedRooms INT;
		SELECT @OccupiedRooms = COUNT(DISTINCT rsh.RoomID)
		FROM RoomStayHistory rsh
		JOIN Rooms rm ON rsh.RoomID = rm.RoomID
		JOIN Stays s ON rsh.StayID = s.StayID
		WHERE rm.RoomTypeID = @RoomTypeID
		AND s.Status = 'CHECKED_IN'
		AND (
			rsh.CheckInTime < @CheckOutDate AND 
			ISNULL(rsh.CheckOutTime, s.ExpectedCheckOut) > @CheckInDate
		);

		-- 4.3 Tổng phòng đã bị chiếm
		DECLARE @UsedRooms INT;
		SET @UsedRooms = @BookedRooms + @OccupiedRooms;

		-- 4.4 Check phòng trống
		IF (@TotalRooms - @UsedRooms < @Quantity)
		BEGIN
			RAISERROR(N'Không đủ phòng trống (đã tính cả phòng đang ở)', 16, 1);
			ROLLBACK;
			RETURN;
		END

        -------------------------------------------------
        -- 5. LẤY GIÁ
        -------------------------------------------------
        DECLARE @Price DECIMAL(10,2);

        SELECT TOP 1 @Price = Price
        FROM Rates
        WHERE RoomTypeID = @RoomTypeID
        AND @CheckInDate BETWEEN StartDate AND EndDate
        ORDER BY StartDate DESC;

        IF @Price IS NULL
        BEGIN
            SELECT @Price = DefaultPrice
            FROM RoomTypes
            WHERE RoomTypeID = @RoomTypeID;
        END

        -------------------------------------------------
        -- 6. TẠO RESERVATION
        -------------------------------------------------
        DECLARE @ReservationID INT;

        INSERT INTO Reservations(UserID, CheckInDate, CheckOutDate, Status)
        VALUES (@UserID, @CheckInDate, @CheckOutDate, 'BOOKED');

        SET @ReservationID = SCOPE_IDENTITY();

        -------------------------------------------------
        -- 7. TẠO RESERVATION ROOMS
        -------------------------------------------------
        INSERT INTO ReservationRooms(ReservationID, RoomTypeID, Quantity, PriceAtBooking)
        VALUES (@ReservationID, @RoomTypeID, @Quantity, @Price);

        -------------------------------------------------
        COMMIT;

        -------------------------------------------------
        -- 8. RETURN
        -------------------------------------------------
        SELECT 
            @UserID AS UserID,
            @CustomerID AS CustomerID,
            @ReservationID AS ReservationID,
            @Price AS PricePerRoom,
            (@Price * @Quantity) AS TotalPrice;

    END TRY
    BEGIN CATCH
        ROLLBACK;

        DECLARE @Err NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@Err, 16, 1);
    END CATCH
END
EXEC sp_CreateReservation_WithNewCustomer
    @FullName = N'Đỗ Hữu Quốc Anh',
    @Phone = '0901234567',
    @CCCD = '012345678901',
    @Email = 'dhqa@gmail.com',

    @RoomTypeID = 2,
    @Quantity = 2,
    @CheckInDate = '2026-04-10',
    @CheckOutDate = '2026-04-12';


---Load lịch đặt phòng của khách hàng--------------------------------
CREATE PROCEDURE sp_GetReservationHistory_ByUser
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        r.ReservationID,
        r.CheckInDate,
        r.CheckOutDate,
        r.Status,
        r.CreatedAt,

        rt.Name AS RoomTypeName,
        rr.Quantity,
        rr.PriceAtBooking,

        (rr.Quantity * rr.PriceAtBooking) AS TotalPrice

    FROM Reservations r
    JOIN ReservationRooms rr ON r.ReservationID = rr.ReservationID
    JOIN RoomTypes rt ON rr.RoomTypeID = rt.RoomTypeID

    WHERE r.UserID = @UserID

    ORDER BY r.CreatedAt DESC;
END
EXEC sp_GetReservationHistory_ByUser @UserID = 1;


----Load lịch đặt-------------------------------------------------------------------
CREATE PROCEDURE sp_GetAllReservations
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        r.ReservationID,
        r.UserID,
        c.FullName,
        c.Phone,

        r.CheckInDate,
        r.CheckOutDate,
        r.Status,
        r.CreatedAt,

        rt.Name AS RoomTypeName,
        rr.Quantity,
        rr.PriceAtBooking,

        (rr.Quantity * rr.PriceAtBooking) AS TotalPrice

    FROM Reservations r
    JOIN ReservationRooms rr ON r.ReservationID = rr.ReservationID
    JOIN RoomTypes rt ON rr.RoomTypeID = rt.RoomTypeID
    LEFT JOIN Customers c ON c.UserID = r.UserID

    ORDER BY r.CheckInDate DESC;
END
EXEC sp_GetAllReservations;


---Sửa thông tin lịch đặt----------------------------------------------
CREATE PROCEDURE sp_UpdateReservation
    @ReservationID INT,
    @RoomTypeID INT,
    @Quantity INT,
    @CheckInDate DATE,
    @CheckOutDate DATE
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;
		IF EXISTS (
			SELECT 1 FROM Reservations 
			WHERE ReservationID = @ReservationID AND Status = 'CHECKED_IN'
			)
		BEGIN
			RAISERROR(N'Không thể sửa khi đã check-in', 16, 1);
			ROLLBACK;
			RETURN;
		END
        -------------------------------------------------
        -- 1. Validate ngày
        -------------------------------------------------
        IF (@CheckInDate >= @CheckOutDate)
        BEGIN
            RAISERROR(N'Ngày không hợp lệ', 16, 1);
            ROLLBACK;
            RETURN;
        END

        -------------------------------------------------
        -- 2. Check tồn tại reservation
        -------------------------------------------------
        IF NOT EXISTS (SELECT 1 FROM Reservations WHERE ReservationID = @ReservationID)
        BEGIN
            RAISERROR(N'Không tìm thấy đặt phòng', 16, 1);
            ROLLBACK;
            RETURN;
        END

        -------------------------------------------------
		-- 3. Check phòng trống (LOẠI TRỪ chính reservation này)
		-------------------------------------------------
		DECLARE @TotalRooms INT;
		SELECT @TotalRooms = COUNT(*)
		FROM Rooms
		WHERE RoomTypeID = @RoomTypeID;

		-------------------------------------------------
		-- 3.1 Phòng đã BOOKED (trừ chính nó)
		-------------------------------------------------
		DECLARE @BookedRooms INT;
		SELECT @BookedRooms = ISNULL(SUM(rr.Quantity), 0)
		FROM ReservationRooms rr
		JOIN Reservations r ON rr.ReservationID = r.ReservationID
		WHERE rr.RoomTypeID = @RoomTypeID
		AND r.Status IN ('BOOKED','CHECKED_IN')
		AND r.ReservationID <> @ReservationID
		AND (
			r.CheckInDate < @CheckOutDate AND 
			r.CheckOutDate > @CheckInDate
		);

		-------------------------------------------------
		-- 3.2 Phòng đang OCCUPIED (Stay thật)
		-------------------------------------------------
		DECLARE @OccupiedRooms INT;
		SELECT @OccupiedRooms = COUNT(DISTINCT rsh.RoomID)
		FROM RoomStayHistory rsh
		JOIN Rooms rm ON rsh.RoomID = rm.RoomID
		JOIN Stays s ON rsh.StayID = s.StayID
		WHERE rm.RoomTypeID = @RoomTypeID
		AND s.Status = 'CHECKED_IN'
		AND (
			rsh.CheckInTime < @CheckOutDate AND 
			ISNULL(rsh.CheckOutTime, s.ExpectedCheckOut) > @CheckInDate
		);

		-------------------------------------------------
		-- 3.3 Tổng phòng đã bị chiếm
		-------------------------------------------------
		DECLARE @UsedRooms INT;
		SET @UsedRooms = @BookedRooms + @OccupiedRooms;

		-------------------------------------------------
		-- 3.4 Check đủ phòng
		-------------------------------------------------
		IF (@TotalRooms - @UsedRooms < @Quantity)
		BEGIN
			RAISERROR(N'Không đủ phòng trống để cập nhật (đã tính cả phòng đang ở)', 16, 1);
			ROLLBACK;
			RETURN;
		END

        -------------------------------------------------
        -- 4. Lấy giá mới (nếu cần)
        -------------------------------------------------
        DECLARE @Price DECIMAL(10,2);

        SELECT TOP 1 @Price = Price
        FROM Rates
        WHERE RoomTypeID = @RoomTypeID
        AND @CheckInDate BETWEEN StartDate AND EndDate
        ORDER BY StartDate DESC;

        IF @Price IS NULL
        BEGIN
            SELECT @Price = DefaultPrice
            FROM RoomTypes
            WHERE RoomTypeID = @RoomTypeID;
        END

        -------------------------------------------------
        -- 5. Update Reservations
        -------------------------------------------------
        UPDATE Reservations
        SET 
            CheckInDate = @CheckInDate,
            CheckOutDate = @CheckOutDate
        WHERE ReservationID = @ReservationID;

        -------------------------------------------------
        -- 6. Update ReservationRooms
        -------------------------------------------------
        UPDATE ReservationRooms
        SET 
            RoomTypeID = @RoomTypeID,
            Quantity = @Quantity,
            PriceAtBooking = @Price
        WHERE ReservationID = @ReservationID;

        -------------------------------------------------
        COMMIT;

        -------------------------------------------------
        -- 7. Return kết quả
        -------------------------------------------------
        SELECT 
            @ReservationID AS ReservationID,
            @Price AS NewPrice,
            (@Price * @Quantity) AS TotalPrice;

    END TRY
    BEGIN CATCH
        ROLLBACK;

        DECLARE @Err NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@Err, 16, 1);
    END CATCH
END
EXEC sp_UpdateReservation
    @ReservationID = 12,
    @RoomTypeID = 2,
    @Quantity = 3,
    @CheckInDate = '2026-04-11',
    @CheckOutDate = '2026-04-13';


---Xoá (Huỷ lịch đặt)-------------------------------------------------------------------------------------------
CREATE PROCEDURE sp_CancelReservation
    @ReservationID INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -------------------------------------------------
        -- 1. Kiểm tra tồn tại
        -------------------------------------------------
        IF NOT EXISTS (
            SELECT 1 FROM Reservations 
            WHERE ReservationID = @ReservationID
        )
        BEGIN
            RAISERROR(N'Không tìm thấy đặt phòng', 16, 1);
            ROLLBACK;
            RETURN;
        END

        -------------------------------------------------
        -- 2. Không cho huỷ nếu đã check-in
        -------------------------------------------------
        IF EXISTS (
            SELECT 1 FROM Reservations 
            WHERE ReservationID = @ReservationID 
            AND Status = 'CHECKED_IN'
        )
        BEGIN
            RAISERROR(N'Không thể huỷ khi khách đã check-in', 16, 1);
            ROLLBACK;
            RETURN;
        END

        -------------------------------------------------
        -- 3. Không huỷ nếu đã hoàn thành
        -------------------------------------------------
        IF EXISTS (
            SELECT 1 FROM Reservations 
            WHERE ReservationID = @ReservationID 
            AND Status = 'COMPLETED'
        )
        BEGIN
            RAISERROR(N'Đặt phòng đã hoàn thành, không thể huỷ', 16, 1);
            ROLLBACK;
            RETURN;
        END

        -------------------------------------------------
        -- 4. Cập nhật trạng thái
        -------------------------------------------------
        UPDATE Reservations
        SET 
            Status = 'CANCELLED'
        WHERE ReservationID = @ReservationID;

        -------------------------------------------------
        COMMIT;

        -------------------------------------------------
        -- 5. Return
        -------------------------------------------------
        SELECT 
            @ReservationID AS ReservationID,
            N'Đã huỷ đặt phòng thành công' AS Message;

    END TRY
    BEGIN CATCH
        ROLLBACK;

        DECLARE @Err NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@Err, 16, 1);
    END CATCH
END
EXEC sp_CancelReservation @ReservationID = 12;


--------------------------------------------------------------------------------
---------666666666666666--------------------------------------------------------
--------------------------------------------------------------------------------
---Load thông tin KH chờ CheckIn--------------------------------------------------------
CREATE PROCEDURE sp_GetWaitingCheckInCustomers
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH Numbers AS (
        SELECT TOP 100 ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n
        FROM sys.all_objects
    ),
    ExpandedRooms AS
    (
        SELECT 
            rr.ReservationID,
            rr.RoomTypeID,
            rr.PriceAtBooking,
            n.n AS RowNum
        FROM ReservationRooms rr
        JOIN Numbers n ON n.n <= rr.Quantity
    ),
    CheckedInCount AS
    (
        SELECT 
            s.ReservationID,
            COUNT(*) AS CheckedInRooms
        FROM RoomStayHistory rsh
        JOIN Stays s ON rsh.StayID = s.StayID
        GROUP BY s.ReservationID
    )

    SELECT 
        r.ReservationID,
        u.UserID,
        c.CustomerID,
        c.FullName,
        c.Phone,
        u.Email,
        r.CheckInDate,
        r.CheckOutDate,
        er.RoomTypeID,
        er.PriceAtBooking
    FROM Reservations r
    INNER JOIN Users u ON r.UserID = u.UserID
    LEFT JOIN Customers c ON c.UserID = u.UserID
    INNER JOIN ExpandedRooms er ON r.ReservationID = er.ReservationID
    LEFT JOIN CheckedInCount cic ON r.ReservationID = cic.ReservationID

    WHERE 
        r.Status IN ('BOOKED', 'CHECKED_IN')
        AND er.RowNum > ISNULL(cic.CheckedInRooms, 0)

    ORDER BY r.CheckInDate ASC;
END
EXEC sp_GetWaitingCheckInCustomers


---Load thông tin khách hàng đang lưu trú-----------------------------------------------------
CREATE PROCEDURE sp_GetCurrentStayingCustomers
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
		s.StayID,
        r.ReservationID,

        ISNULL(c.CustomerID, g.GuestID) AS CustomerID,

        ISNULL(c.FullName, g.FullName) AS FullName,
        ISNULL(c.Phone, N'Không có') AS Phone,
        ISNULL(u.Email, N'Không có') AS Email,

        ISNULL(r.CheckInDate, s.ActualCheckIn) AS CheckInDate,

        s.ExpectedCheckOut AS CheckOutDate,

        rsh.RoomID,
        rm.RoomNumber,

        s.Status,
        s.ActualCheckIn AS CreatedAt

    FROM Stays s

    INNER JOIN Guests g
        ON g.GuestID = s.GuestID

    LEFT JOIN Reservations r
        ON s.ReservationID = r.ReservationID

    LEFT JOIN Users u 
        ON r.UserID = u.UserID

    LEFT JOIN Customers c 
        ON c.UserID = u.UserID

    INNER JOIN RoomStayHistory rsh
        ON rsh.StayID = s.StayID
        AND rsh.CheckOutTime IS NULL

    INNER JOIN Rooms rm
        ON rm.RoomID = rsh.RoomID

    WHERE s.Status = 'CHECKED_IN'
      AND (r.Status IS NULL OR r.Status != 'CANCELLED')

    ORDER BY s.ActualCheckIn ASC
END

EXEC sp_GetCurrentStayingCustomers

---CheckIn theo lịch đặt-----------------------------------------------
CREATE PROCEDURE sp_CheckIn_ByReservation_OneRoom
    @ReservationID INT,
    @RoomID INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE 
        @UserID INT,
        @FullName NVARCHAR(150),
        @Phone NVARCHAR(20),
        @CCCD NVARCHAR(20),
        @GuestID INT,
        @StayID INT,
        @Price DECIMAL(12,2),
        @ExpectedCheckOut DATETIME

    -- 1. Lấy User + ngày checkout
    SELECT 
        @UserID = UserID,
        @ExpectedCheckOut = CheckOutDate
    FROM Reservations
    WHERE ReservationID = @ReservationID

    -- 2. Lấy thông tin Customer
    SELECT 
        @FullName = FullName,
        @Phone = Phone,
        @CCCD = CCCD
    FROM Customers
    WHERE UserID = @UserID

    -- 3. Lấy giá lúc đặt
    SELECT TOP 1 @Price = PriceAtBooking
    FROM ReservationRooms
    WHERE ReservationID = @ReservationID

    -- 4. Kiểm tra Stay
    SELECT TOP 1 @StayID = StayID
    FROM Stays
    WHERE ReservationID = @ReservationID
      AND Status = 'CHECKED_IN'

    -- 5. Nếu chưa có Stay → tạo mới
    IF @StayID IS NULL
    BEGIN
        INSERT INTO Guests (FullName, IdentityType, IdentityNumber)
        VALUES (@FullName, 'CCCD', @CCCD)

        SET @GuestID = SCOPE_IDENTITY()

        INSERT INTO Stays 
        (ReservationID, GuestID, ActualCheckIn, ExpectedCheckOut, Status)
        VALUES 
        (@ReservationID, @GuestID, GETDATE(), @ExpectedCheckOut, 'CHECKED_IN')

        SET @StayID = SCOPE_IDENTITY()
    END

    -- 6. Thêm phòng
    INSERT INTO RoomStayHistory 
    (StayID, RoomID, CheckInTime, RateAtThatTime)
    VALUES 
    (@StayID, @RoomID, GETDATE(), @Price)

    -- 7. Update phòng
    UPDATE Rooms
    SET Status = 'OCCUPIED'
    WHERE RoomID = @RoomID

    -- 8. Update Reservation
    UPDATE Reservations
    SET Status = 'CHECKED_IN'
    WHERE ReservationID = @ReservationID
END

---CheckIn theo khách WalkIn----------------------------------------------------------------
CREATE PROCEDURE sp_CheckIn_WalkIn_OneRoom
ALTER PROCEDURE sp_CheckIn_WalkIn_OneRoom
    @FullName NVARCHAR(150),
    @CCCD NVARCHAR(20),
    @RoomID INT,
    @ExpectedCheckOut DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE 
        @GuestID INT,
        @StayID INT,
        @Price DECIMAL(12,2),
        @RoomTypeID INT,
        @RoomStatus NVARCHAR(20)

    -------------------------------------------------
    -- ❗ 0. CHECK PHÒNG CÓ TỒN TẠI + TRỐNG KHÔNG
    -------------------------------------------------
    SELECT 
        @RoomTypeID = RoomTypeID,
        @RoomStatus = Status
    FROM Rooms
    WHERE RoomID = @RoomID

    IF @RoomTypeID IS NULL
    BEGIN
        RAISERROR(N'Phòng không tồn tại', 16, 1);
        RETURN;
    END

    IF @RoomStatus <> 'AVAILABLE'
    BEGIN
        RAISERROR(N'Phòng không trống', 16, 1);
        RETURN;
    END

    -------------------------------------------------
    -- 1. Lấy giá hiện tại
    -------------------------------------------------
    SELECT TOP 1 @Price = Price
    FROM Rates
    WHERE RoomTypeID = @RoomTypeID
      AND GETDATE() BETWEEN StartDate AND EndDate
    ORDER BY StartDate DESC

    -- Nếu không có giá mùa → lấy giá mặc định
    IF @Price IS NULL
    BEGIN
        SELECT @Price = DefaultPrice
        FROM RoomTypes
        WHERE RoomTypeID = @RoomTypeID
    END

    -------------------------------------------------
    -- 2. Tạo Guest
    -------------------------------------------------
    INSERT INTO Guests (FullName, IdentityType, IdentityNumber)
    VALUES (@FullName, 'CCCD', @CCCD)

    SET @GuestID = SCOPE_IDENTITY()

    -------------------------------------------------
    -- 3. Tạo Stay
    -------------------------------------------------
    INSERT INTO Stays 
    (ReservationID, GuestID, ActualCheckIn, ExpectedCheckOut, Status)
    VALUES 
    (NULL, @GuestID, GETDATE(), @ExpectedCheckOut, 'CHECKED_IN')

    SET @StayID = SCOPE_IDENTITY()

    -------------------------------------------------
    -- 4. RoomStayHistory
    -------------------------------------------------
    INSERT INTO RoomStayHistory
    (StayID, RoomID, CheckInTime, RateAtThatTime)
    VALUES
    (@StayID, @RoomID, GETDATE(), @Price)

    -------------------------------------------------
    -- 5. Update phòng
    -------------------------------------------------
    UPDATE Rooms
    SET Status = 'OCCUPIED'
    WHERE RoomID = @RoomID
END

EXEC sp_CheckIn_WalkIn_OneRoom
    @FullName = N'Nguyễn Văn B',
    @CCCD = '001203000991',
    @RoomID = 33,
    @ExpectedCheckOut = '2026-04-08';

---Load phòng trống và không có lịch đặt để checkIN walkin -----------------------
CREATE PROCEDURE sp_GetAvailableRooms_Advanced
    @ExpectedCheckOut DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Now DATETIME = GETDATE();

    -------------------------------------------------
    -- 1. Lấy danh sách RoomType còn slot
    -------------------------------------------------
    ;WITH RoomTypeAvailability AS (
        SELECT 
            rt.RoomTypeID,

            -- Tổng số phòng
            TotalRooms = COUNT(r.RoomID),

            -- Số phòng đang có khách ở
            OccupiedRooms = (
                SELECT COUNT(*)
                FROM RoomStayHistory rsh
                JOIN Rooms r2 ON rsh.RoomID = r2.RoomID
                WHERE r2.RoomTypeID = rt.RoomTypeID
                  AND rsh.CheckInTime < @ExpectedCheckOut
                  AND (
                        rsh.CheckOutTime IS NULL 
                        OR rsh.CheckOutTime > @Now
                  )
            ),

            -- Số phòng đã được đặt
            BookedRooms = (
                SELECT ISNULL(SUM(rr.Quantity), 0)
                FROM ReservationRooms rr
                JOIN Reservations res ON rr.ReservationID = res.ReservationID
                WHERE rr.RoomTypeID = rt.RoomTypeID
                  AND res.Status IN ('BOOKED','CHECKED_IN')
                  AND res.CheckInDate < @ExpectedCheckOut
                  AND res.CheckOutDate > @Now
            )

        FROM RoomTypes rt
        JOIN Rooms r ON r.RoomTypeID = rt.RoomTypeID
        GROUP BY rt.RoomTypeID
    )

    -------------------------------------------------
    -- 2. Lấy các phòng cụ thể
    -------------------------------------------------
    SELECT r.*
    FROM Rooms r
    JOIN RoomTypeAvailability a 
        ON r.RoomTypeID = a.RoomTypeID
    WHERE 
        -------------------------------------------------
        -- Phòng usable
        -------------------------------------------------
        r.Status = 'AVAILABLE'

        -------------------------------------------------
        -- Không có người ở phòng này
        -------------------------------------------------
        AND NOT EXISTS (
            SELECT 1
            FROM RoomStayHistory rsh
            WHERE rsh.RoomID = r.RoomID
              AND rsh.CheckInTime < @ExpectedCheckOut
              AND (
                    rsh.CheckOutTime IS NULL 
                    OR rsh.CheckOutTime > @Now
              )
        )

        -------------------------------------------------
        -- RoomType còn slot
        -------------------------------------------------
        AND (a.TotalRooms - a.OccupiedRooms - a.BookedRooms) > 0
END
EXEC sp_GetAvailableRooms_Advanced @ExpectedCheckOut = '2026-04-15'

---Chuyển phòng------------------------------------------------------------------
CREATE PROCEDURE sp_TransferRoom
    @StayID INT,
    @OldRoomID INT,
    @NewRoomID INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRAN

    DECLARE 
        @Now DATETIME = GETDATE(),
        @NewRate DECIMAL(12,2)

    -------------------------------------------------
    -- VALIDATE
    -------------------------------------------------

    -- Không cho chuyển cùng phòng
    IF @OldRoomID = @NewRoomID
    BEGIN
        RAISERROR(N'Phòng mới phải khác phòng cũ', 16, 1)
        ROLLBACK
        RETURN
    END

    -- Phòng mới phải available
    IF NOT EXISTS (
        SELECT 1 FROM Rooms 
        WHERE RoomID = @NewRoomID AND Status = 'AVAILABLE'
    )
    BEGIN
        RAISERROR(N'Phòng mới không khả dụng', 16, 1)
        ROLLBACK
        RETURN
    END

    -- Phòng cũ đang ở
    IF NOT EXISTS (
        SELECT 1 
        FROM RoomStayHistory
        WHERE StayID = @StayID 
          AND RoomID = @OldRoomID
          AND CheckOutTime IS NULL
    )
    BEGIN
        RAISERROR(N'Không tìm thấy phòng hiện tại của khách', 16, 1)
        ROLLBACK
        RETURN
    END

    -------------------------------------------------
    -- 🟢 LẤY GIÁ PHÒNG MỚI
    -------------------------------------------------
    SELECT @NewRate = rt.DefaultPrice
    FROM Rooms r
    JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
    WHERE r.RoomID = @NewRoomID

    -------------------------------------------------
    -- 🟡 ĐÓNG PHÒNG CŨ
    -------------------------------------------------
    UPDATE RoomStayHistory
    SET CheckOutTime = @Now
    WHERE StayID = @StayID
      AND RoomID = @OldRoomID
      AND CheckOutTime IS NULL

    UPDATE Rooms
    SET Status = 'DIRTY' -- chuẩn hơn MAINTENANCE
    WHERE RoomID = @OldRoomID

    -------------------------------------------------
    -- 🟢 TẠO PHÒNG MỚI
    -------------------------------------------------
    INSERT INTO RoomStayHistory
    (StayID, RoomID, CheckInTime, RateAtThatTime)
    VALUES
    (@StayID, @NewRoomID, @Now, @NewRate)

    UPDATE Rooms
    SET Status = 'OCCUPIED'
    WHERE RoomID = @NewRoomID

    COMMIT
END

---Gia hạn Lưu trú------------------------------------------------------------------------
CREATE PROCEDURE sp_ExtendStay
    @StayID INT,
    @NewCheckOut DATETIME
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRAN

    DECLARE 
        @ReservationID INT,
        @RoomID INT,
        @CurrentCheckOut DATETIME,
        @Now DATETIME = GETDATE()

    -------------------------------------------------
    -- 1. Validate Stay
    -------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM Stays 
        WHERE StayID = @StayID AND Status = 'CHECKED_IN'
    )
    BEGIN
        RAISERROR(N'Stay không hợp lệ', 16, 1)
        ROLLBACK
        RETURN
    END

    -------------------------------------------------
    -- 2. Lấy checkout hiện tại
    -------------------------------------------------
    SELECT @CurrentCheckOut = ExpectedCheckOut
    FROM Stays
    WHERE StayID = @StayID

    -------------------------------------------------
    -- 3. Validate thời gian
    -------------------------------------------------
    IF @NewCheckOut <= @Now
    BEGIN
        RAISERROR(N'Ngày checkout mới không hợp lệ', 16, 1)
        ROLLBACK
        RETURN
    END

    IF @NewCheckOut <= @CurrentCheckOut
    BEGIN
        RAISERROR(N'Ngày checkout mới phải lớn hơn ngày checkout hiện tại', 16, 1)
        ROLLBACK
        RETURN
    END

    -------------------------------------------------
    -- 4. Lấy dữ liệu
    -------------------------------------------------
    SELECT @ReservationID = ReservationID
    FROM Stays
    WHERE StayID = @StayID

    SELECT TOP 1 @RoomID = RoomID
    FROM RoomStayHistory
    WHERE StayID = @StayID
      AND CheckOutTime IS NULL

    IF @RoomID IS NULL
    BEGIN
        RAISERROR(N'Không tìm thấy phòng đang ở', 16, 1)
        ROLLBACK
        RETURN
    END

    -------------------------------------------------
    -- 5. Check conflict
    -------------------------------------------------
    IF EXISTS (
        SELECT 1
        FROM Reservations r
        JOIN ReservationRooms rr ON r.ReservationID = rr.ReservationID
        WHERE r.Status = 'BOOKED'
          AND r.CheckInDate < @NewCheckOut
          AND r.CheckOutDate > @Now
          AND EXISTS (
              SELECT 1 FROM Rooms 
              WHERE RoomID = @RoomID
                AND RoomTypeID = rr.RoomTypeID
          )
    )
    BEGIN
        RAISERROR(N'Phòng đã được đặt sau thời điểm này', 16, 1)
        ROLLBACK
        RETURN
    END

    -------------------------------------------------
    -- 6. Update
    -------------------------------------------------
    IF @ReservationID IS NOT NULL
    BEGIN
        UPDATE Reservations
        SET CheckOutDate = @NewCheckOut
        WHERE ReservationID = @ReservationID

        UPDATE Stays
        SET ExpectedCheckOut = @NewCheckOut
        WHERE StayID = @StayID
    END
    ELSE
    BEGIN
        UPDATE Stays
        SET ExpectedCheckOut = @NewCheckOut
        WHERE StayID = @StayID
    END  

    COMMIT
END

---Thêm dịch vụ sử dụng(Gọi dịch vụ)---------------------------------------------------
CREATE PROCEDURE sp_AddServiceUsage
    @StayID INT,
    @ServiceID INT,
    @Quantity INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate Stay tồn tại
    IF NOT EXISTS (SELECT 1 FROM Stays WHERE StayID = @StayID)
    BEGIN
        RAISERROR (N'Stay không tồn tại', 16, 1)
        RETURN
    END

    -- Validate Service tồn tại và đang active
    IF NOT EXISTS (
        SELECT 1 FROM Services 
        WHERE ServiceID = @ServiceID AND Status = 'TRUE'
    )
    BEGIN
        RAISERROR (N'Dịch vụ không hợp lệ hoặc đã bị tắt', 16, 1)
        RETURN
    END

    -- Validate số lượng
    IF @Quantity <= 0
    BEGIN
        RAISERROR (N'Số lượng phải > 0', 16, 1)
        RETURN
    END

    -- Insert
    INSERT INTO ServiceUsages (StayID, ServiceID, Quantity)
    VALUES (@StayID, @ServiceID, @Quantity)
END

---Sửa thông tin Dịch vụ đã sử dụng----------------------------------------------
CREATE PROCEDURE sp_UpdateServiceUsage
    @UsageID INT,
    @Quantity INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate tồn tại
    IF NOT EXISTS (SELECT 1 FROM ServiceUsages WHERE UsageID = @UsageID)
    BEGIN
        RAISERROR (N'Dịch vụ sử dụng không tồn tại', 16, 1)
        RETURN
    END

    -- Validate số lượng
    IF @Quantity <= 0
    BEGIN
        RAISERROR (N'Số lượng phải > 0', 16, 1)
        RETURN
    END

    -- Update
    UPDATE ServiceUsages
    SET Quantity = @Quantity
    WHERE UsageID = @UsageID
END

---Xoá (Huỷ) dịch vụ đã sử dụng-----------------------------------------------------------------
CREATE PROCEDURE sp_DeleteServiceUsage
    @UsageID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate tồn tại
    IF NOT EXISTS (SELECT 1 FROM ServiceUsages WHERE UsageID = @UsageID)
    BEGIN
        RAISERROR (N'Dịch vụ sử dụng không tồn tại', 16, 1)
        RETURN
    END

    -- Delete cứng
    DELETE FROM ServiceUsages
    WHERE UsageID = @UsageID
END

---Load Dịch vụ đã sử dụng-----------------------------------------------------
CREATE PROCEDURE sp_GetServiceUsageByStay
    @StayID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        su.UsageID,
        s.ServiceName,
        su.Quantity,
        s.Price,
        (su.Quantity * s.Price) AS Total,
        su.UsedDate
    FROM ServiceUsages su
    INNER JOIN Services s ON su.ServiceID = s.ServiceID
    WHERE su.StayID = @StayID
END

---Thêm minibarUsages-----------------------------------------------------------
CREATE PROCEDURE sp_AddMinibarUsage
    @StayID INT,
    @MinibarID INT,
    @Quantity INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Check Stay tồn tại
    IF NOT EXISTS (SELECT 1 FROM Stays WHERE StayID = @StayID)
    BEGIN
        RAISERROR (N'Stay không tồn tại', 16, 1)
        RETURN
    END

    -- Check Minibar tồn tại
    IF NOT EXISTS (SELECT 1 FROM MinibarItems WHERE MinibarID = @MinibarID)
    BEGIN
        RAISERROR (N'Minibar item không tồn tại', 16, 1)
        RETURN
    END

    -- Check số lượng
    IF @Quantity <= 0
    BEGIN
        RAISERROR (N'Số lượng phải > 0', 16, 1)
        RETURN
    END

    INSERT INTO MinibarUsages (StayID, MinibarID, Quantity)
    VALUES (@StayID, @MinibarID, @Quantity)
END

---Sửa MinibarUsages-------------------------------------------
CREATE PROCEDURE sp_UpdateMinibarUsage
    @ID INT,
    @Quantity INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Check tồn tại
    IF NOT EXISTS (SELECT 1 FROM MinibarUsages WHERE ID = @ID)
    BEGIN
        RAISERROR (N'Minibar usage không tồn tại', 16, 1)
        RETURN
    END

    -- Check số lượng
    IF @Quantity <= 0
    BEGIN
        RAISERROR (N'Số lượng phải > 0', 16, 1)
        RETURN
    END

    UPDATE MinibarUsages
    SET Quantity = @Quantity
    WHERE ID = @ID
END

---Xoá MinibarUsages--------------------------------------------------------
CREATE PROCEDURE sp_DeleteMinibarUsage
    @ID INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM MinibarUsages WHERE ID = @ID)
    BEGIN
        RAISERROR (N'Minibar usage không tồn tại', 16, 1)
        RETURN
    END

    DELETE FROM MinibarUsages
    WHERE ID = @ID
END

---Load MinibarUsages---------------------------------------
CREATE PROCEDURE sp_GetMinibarUsageByStay
    @StayID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        mu.ID,
        mi.ItemName,
        mu.Quantity,
        mi.Price,
        (mu.Quantity * mi.Price) AS Total
    FROM MinibarUsages mu
    INNER JOIN MinibarItems mi ON mu.MinibarID = mi.MinibarID
    WHERE mu.StayID = @StayID
END

---Thêm phạt--------------------------------------------
CREATE PROCEDURE sp_AddPenalty
    @StayID INT,
    @Reason NVARCHAR(255),
    @Amount DECIMAL(14,2)
AS
BEGIN
    SET NOCOUNT ON;

    -- Check Stay tồn tại
    IF NOT EXISTS (SELECT 1 FROM Stays WHERE StayID = @StayID)
    BEGIN
        RAISERROR (N'Stay không tồn tại', 16, 1)
        RETURN
    END

    -- Validate Amount
    IF @Amount <= 0
    BEGIN
        RAISERROR (N'Số tiền phạt phải > 0', 16, 1)
        RETURN
    END

    INSERT INTO Penalties (StayID, Reason, Amount)
    VALUES (@StayID, @Reason, @Amount)
END

---Sửa phạt---------------------------------------------
CREATE PROCEDURE sp_UpdatePenalty
    @PenaltyID INT,
    @Reason NVARCHAR(255),
    @Amount DECIMAL(14,2)
AS
BEGIN
    SET NOCOUNT ON;

    -- Check tồn tại
    IF NOT EXISTS (SELECT 1 FROM Penalties WHERE PenaltyID = @PenaltyID)
    BEGIN
        RAISERROR (N'Penalty không tồn tại', 16, 1)
        RETURN
    END

    -- Validate Amount
    IF @Amount <= 0
    BEGIN
        RAISERROR (N'Số tiền phạt phải > 0', 16, 1)
        RETURN
    END

    UPDATE Penalties
    SET 
        Reason = @Reason,
        Amount = @Amount
    WHERE PenaltyID = @PenaltyID
END

---Xoá phạt---------------------------------------------
CREATE PROCEDURE sp_DeletePenalty
    @PenaltyID INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Penalties WHERE PenaltyID = @PenaltyID)
    BEGIN
        RAISERROR (N'Penalty không tồn tại', 16, 1)
        RETURN
    END

    DELETE FROM Penalties
    WHERE PenaltyID = @PenaltyID
END

---Load phạt----------------------------------------------------------
CREATE PROCEDURE sp_GetPenaltyByStay
    @StayID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        PenaltyID,
        Reason,
        Amount,
        CreatedAt
    FROM Penalties
    WHERE StayID = @StayID
    ORDER BY CreatedAt DESC
END

-----------------------------------------------------------------------------------------------------------------------
----------888888888888888888888888888888888888888888888----------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------------------
---CheckOut------------------------------------------------------------------------------------------------------------
CREATE PROCEDURE sp_CheckOutRoom
    @StayID INT,
    @RoomID INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Now DATETIME = GETDATE()

    DECLARE 
        @ReservationID INT,
        @TotalBookedRooms INT,
        @TotalCheckedInRooms INT

    -------------------------------------------------
    -- 1. Check phòng đang ở
    -------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 
        FROM RoomStayHistory
        WHERE StayID = @StayID 
          AND RoomID = @RoomID
          AND CheckOutTime IS NULL
    )
    BEGIN
        RAISERROR (N'Phòng không nằm trong stay hoặc đã checkout rồi', 16, 1)
        RETURN
    END

    -------------------------------------------------
    -- 2. Checkout phòng
    -------------------------------------------------
    UPDATE RoomStayHistory
    SET CheckOutTime = @Now
    WHERE StayID = @StayID 
      AND RoomID = @RoomID
      AND CheckOutTime IS NULL

    -------------------------------------------------
    -- 3. Update phòng → DIRTY
    -------------------------------------------------
    UPDATE Rooms
    SET Status = 'DIRTY'
    WHERE RoomID = @RoomID

    -------------------------------------------------
    -- 4. Lấy ReservationID
    -------------------------------------------------
    SELECT @ReservationID = ReservationID
    FROM Stays
    WHERE StayID = @StayID

    -------------------------------------------------
    -- ❗ CASE 1: WALK-IN (không có reservation)
    -------------------------------------------------
    IF @ReservationID IS NULL
    BEGIN
        -- Nếu không còn phòng nào đang ở → hoàn thành stay
        IF NOT EXISTS (
            SELECT 1
            FROM RoomStayHistory
            WHERE StayID = @StayID
              AND CheckOutTime IS NULL
        )
        BEGIN
            UPDATE Stays
            SET 
                ActualCheckOut = @Now,
                Status = 'COMPLETED'
            WHERE StayID = @StayID
        END

        RETURN
    END

    -------------------------------------------------
    -- ❗ CASE 2: CÓ RESERVATION
    -------------------------------------------------

    -- 5. Đếm số phòng đã đặt
    SELECT @TotalBookedRooms = ISNULL(SUM(Quantity), 0)
    FROM ReservationRooms
    WHERE ReservationID = @ReservationID

    -- 6. Đếm số phòng đã check-in
    SELECT @TotalCheckedInRooms = COUNT(*)
    FROM RoomStayHistory rsh
    JOIN Stays s ON rsh.StayID = s.StayID
    WHERE s.ReservationID = @ReservationID

    -------------------------------------------------
    -- 7. Check điều kiện hoàn thành
    -------------------------------------------------
    IF 
        -- Không còn phòng nào đang ở trong stay này
        NOT EXISTS (
            SELECT 1
            FROM RoomStayHistory
            WHERE StayID = @StayID
              AND CheckOutTime IS NULL
        )
        AND
        -- Đã check-in đủ phòng đã đặt
        @TotalCheckedInRooms >= @TotalBookedRooms
    BEGIN
        -------------------------------------------------
        -- 7.1 Update Stay
        -------------------------------------------------
        UPDATE Stays
        SET 
            ActualCheckOut = @Now,
            Status = 'COMPLETED'
        WHERE StayID = @StayID

        -------------------------------------------------
        -- 7.2 Update Reservation
        -------------------------------------------------
        UPDATE Reservations
        SET Status = 'COMPLETED'
        WHERE ReservationID = @ReservationID
    END
END

--------------------------------------------------
--------------999999999999999---------------------
--------------------------------------------------
---Load danh sách phòng đã đặt để checkIn KH đã đặt phòng
CREATE PROCEDURE sp_GetAvailableRooms_ForCheckIn
    @ReservationID INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CheckInDate DATE
    DECLARE @CheckOutDate DATE

    -------------------------------------------------
    -- 1. Lấy thông tin reservation
    -------------------------------------------------
    SELECT 
        @CheckInDate = CheckInDate,
        @CheckOutDate = CheckOutDate
    FROM Reservations
    WHERE ReservationID = @ReservationID

    -------------------------------------------------
    -- 2. Lấy danh sách phòng phù hợp
    -------------------------------------------------
    SELECT 
        r.RoomID,
        r.RoomNumber,
        rt.Name AS RoomType
    FROM Rooms r
    JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID

    WHERE 
        -------------------------------------------------
        -- đúng loại phòng trong reservation
        -------------------------------------------------
        r.RoomTypeID IN (
            SELECT RoomTypeID
            FROM ReservationRooms
            WHERE ReservationID = @ReservationID
        )

        -------------------------------------------------
        -- trạng thái phòng phải dùng được
        -------------------------------------------------
        AND r.Status = 'AVAILABLE'

        -------------------------------------------------
        -- không bị occupied trong khoảng thời gian
        -------------------------------------------------
        AND NOT EXISTS (
            SELECT 1
            FROM RoomStayHistory rsh
            WHERE rsh.RoomID = r.RoomID
              AND CAST(rsh.CheckInTime AS DATE) < @CheckOutDate
              AND CAST(ISNULL(rsh.CheckOutTime, GETDATE()) AS DATE) > @CheckInDate
        )

    ORDER BY r.RoomNumber
END
EXEC sp_GetAvailableRooms_ForCheckIn 28

---Lấy tỷ lệ phòng theo tháng---------------------------------------
CREATE PROCEDURE sp_GetRoomOccupancyByMonth
    @Year INT,
    @Month INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TotalRooms INT;

    -- Tổng số phòng
    SELECT @TotalRooms = COUNT(*) 
    FROM Rooms;

    SELECT 
        @Month AS N'Tháng',

        COUNT(DISTINCT rsh.RoomID) AS N'Số phòng đã sử dụng',

        @TotalRooms AS N'Tổng số phòng',

        CASE 
            WHEN @TotalRooms = 0 THEN 0
            ELSE CAST(COUNT(DISTINCT rsh.RoomID) * 100.0 / @TotalRooms AS DECIMAL(5,2))
        END AS N'Công suất (%)'

    FROM RoomStayHistory rsh
    WHERE 
        YEAR(rsh.CheckInTime) = @Year
        AND MONTH(rsh.CheckInTime) = @Month;
END

EXEC sp_GetRoomOccupancyByMonth 
    @Year = 2026,
    @Month = 3;

---Lấy doanh thu theo tháng-------------------------------------------------
CREATE PROCEDURE sp_GetNetRevenueByMonth
    @Year INT,
    @Month INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TotalRevenue DECIMAL(18,2) = 0;
    DECLARE @TotalVAT DECIMAL(18,2) = 0;

    -- Tổng thu trong tháng
    SELECT 
        @TotalRevenue = ISNULL(SUM(p.Amount), 0)
    FROM Payments p
    WHERE 
        YEAR(p.PaymentDate) = @Year
        AND MONTH(p.PaymentDate) = @Month;

    -- Tổng VAT trong tháng
    SELECT 
        @TotalVAT = ISNULL(SUM(i.VAT), 0)
    FROM Invoices i
    WHERE 
        YEAR(i.Date) = @Year
        AND MONTH(i.Date) = @Month;

    -- Kết quả: Thu nhập sau thuế
    SELECT 
        (@TotalRevenue - @TotalVAT) AS N'Thu nhập sau thuế';
END

EXEC sp_GetNetRevenueByMonth 
    @Year = 2026,
    @Month = 3

---Lấy số lượng khách lưu trú Đặt trước/ Walk-in theo tháng-------------------------------------
CREATE PROCEDURE sp_GetGuestTypeByMonth
    @Year INT,
    @Month INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        @Month AS N'Tháng',

        -- Khách đặt trước
        COUNT(CASE WHEN ReservationID IS NOT NULL THEN 1 END) 
            AS N'Khách đặt trước',

        -- Khách walk-in
        COUNT(CASE WHEN ReservationID IS NULL THEN 1 END) 
            AS N'Khách walk-in',

        -- Tổng
        COUNT(*) AS N'Tổng lượt khách'

    FROM Stays
    WHERE 
        YEAR(ActualCheckIn) = @Year
        AND MONTH(ActualCheckIn) = @Month;
END

EXEC sp_GetGuestTypeByMonth
    @Year = 2026,
    @Month = 4;

---Lấy số lượng đặt phòng theo tháng-----------------------------------------------------
CREATE PROCEDURE sp_GetReservationCountByMonth
    @Year INT,
    @Month INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        @Month AS N'Tháng',
        COUNT(*) AS N'Số lượng đặt phòng'
    FROM Reservations
    WHERE 
        YEAR(CreatedAt) = @Year
        AND MONTH(CreatedAt) = @Month;
END

EXEC sp_GetReservationCountByMonth
    @Year = 2026,
    @Month = 4;

------------------------------------------------------------------------------------------------------
-------------1010101010101010-------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------
---load minibar theo roomid(roomtypes)----------------------------------------------------------------
CREATE PROCEDURE sp_GetMinibarByRoom
    @RoomID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        mi.MiniBarID,
        mi.ItemName,
        mi.Price
    FROM Rooms r
    JOIN MinibarItems mi 
        ON r.RoomTypeID = mi.RoomTypeID
    WHERE r.RoomID = @RoomID
    ORDER BY mi.ItemName
END

EXEC sp_GetMinibarByRoom 1

------------------------------------------------------------------------------------------------------
-------------1212121212121212-------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------
---Biểu đồ doanh thu từng ngày theo tháng-------------------------
CREATE PROCEDURE sp_GetRevenueByDayInMonth
    @Month INT,
    @Year INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Tạo ngày đầu và cuối tháng
    DECLARE @StartDate DATE = DATEFROMPARTS(@Year, @Month, 1);
    DECLARE @EndDate DATE = EOMONTH(@StartDate);

    -- Tạo bảng danh sách ngày trong tháng
    ;WITH DateList AS (
        SELECT @StartDate AS Ngay
        UNION ALL
        SELECT DATEADD(DAY, 1, Ngay)
        FROM DateList
        WHERE Ngay < @EndDate
    )

    SELECT 
        DAY(d.Ngay) AS Ngay,
        ISNULL(SUM(p.Amount), 0) AS DoanhThu
    FROM DateList d
    LEFT JOIN Invoices i
        ON CAST(i.Date AS DATE) = d.Ngay
        AND i.Status = 'PAID'
    LEFT JOIN Payments p
        ON p.InvoiceID = i.InvoiceID
    GROUP BY d.Ngay
    ORDER BY d.Ngay
    OPTION (MAXRECURSION 31); -- tránh lỗi đệ quy
END

EXEC sp_GetRevenueByDayInMonth @Month = 3, @Year = 2026

---Biểu đồ doanh thu theo kênh (Đặt phòng/ Walk-in)---------------
CREATE PROCEDURE sp_GetRevenueByCustomerType
    @Month INT,
    @Year INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Tổng doanh thu trong tháng
    DECLARE @TotalRevenue DECIMAL(18,2);

    SELECT 
        @TotalRevenue = ISNULL(SUM(i.TotalAmount), 0)
    FROM Invoices i
    WHERE 
        MONTH(i.Date) = @Month
        AND YEAR(i.Date) = @Year;

    -- Doanh thu theo loại khách + %
    SELECT 
        t.CustomerType,
        ISNULL(SUM(i.TotalAmount), 0) AS TotalRevenue,

        CASE 
            WHEN @TotalRevenue = 0 THEN 0
            ELSE ROUND(ISNULL(SUM(i.TotalAmount), 0) * 100.0 / @TotalRevenue, 2)
        END AS Percentage

    FROM (
        SELECT N'Walk-in' AS CustomerType
        UNION ALL
        SELECT N'Đặt trước'
    ) t

    LEFT JOIN Stays s 
        ON (t.CustomerType = N'Walk-in' AND s.ReservationID IS NULL)
        OR (t.CustomerType = N'Đặt trước' AND s.ReservationID IS NOT NULL)

    LEFT JOIN Invoices i 
        ON i.StayID = s.StayID
        AND MONTH(i.Date) = @Month
        AND YEAR(i.Date) = @Year

    GROUP BY t.CustomerType
END

EXEC sp_GetRevenueByCustomerType @Month = 3, @Year = 2026

---Biểu đồ doanh thu theo loại phòng------------------------------
CREATE alter PROCEDURE sp_GetRevenueByRoomTypeInMonth
    @Month INT,
    @Year INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Đếm số phòng trong mỗi Stay (để tránh nhân đôi doanh thu)
    ;WITH RoomCount AS (
        SELECT 
            StayID,
            COUNT(DISTINCT RoomID) AS SoPhong
        FROM RoomStayHistory
        GROUP BY StayID
    ),

    RevenueData AS (
        SELECT 
            r.RoomTypeID,
            SUM(p.Amount * 1.0 / rc.SoPhong) AS DoanhThu
        FROM Payments p
        INNER JOIN Invoices i 
            ON p.InvoiceID = i.InvoiceID
        INNER JOIN Stays s
            ON i.StayID = s.StayID
        INNER JOIN RoomStayHistory rsh
            ON s.StayID = rsh.StayID
        INNER JOIN RoomCount rc
            ON rc.StayID = s.StayID
        INNER JOIN Rooms r
            ON rsh.RoomID = r.RoomID
        WHERE 
            MONTH(p.PaymentDate) = @Month
            AND YEAR(p.PaymentDate) = @Year
            AND i.Status = 'PAID'
        GROUP BY r.RoomTypeID
    )

    SELECT 
        rt.Name AS TenLoaiPhong,
        ISNULL(rd.DoanhThu, 0) AS DoanhThu
    FROM RoomTypes rt
    LEFT JOIN RevenueData rd
        ON rt.RoomTypeID = rd.RoomTypeID
    ORDER BY DoanhThu DESC;
END

EXEC sp_GetRevenueByRoomTypeInMonth @Month = 4, @Year = 2026
---Biểu đồ công suất theo loại phòng------------------------------
CREATE PROCEDURE sp_GetRoomTypeUsagePercentInMonth
    @Month INT,
    @Year INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @StartDate DATE = DATEFROMPARTS(@Year, @Month, 1);
    DECLARE @EndDate DATE = EOMONTH(@StartDate);

    -- Lấy tất cả các ngày phòng được sử dụng (tính theo từng ngày)
    ;WITH UsagePerDay AS (
        SELECT 
            r.RoomTypeID,
            CAST(d.Ngay AS DATE) AS Ngay
        FROM RoomStayHistory rsh
        INNER JOIN Rooms r
            ON rsh.RoomID = r.RoomID

        -- Tách từng ngày sử dụng
        CROSS APPLY (
            SELECT DATEADD(DAY, v.number,
                CASE 
                    WHEN rsh.CheckInTime < @StartDate THEN @StartDate
                    ELSE rsh.CheckInTime
                END
            ) AS Ngay
            FROM master..spt_values v
            WHERE v.type = 'P'
              AND DATEADD(DAY, v.number,
                    CASE 
                        WHEN rsh.CheckInTime < @StartDate THEN @StartDate
                        ELSE rsh.CheckInTime
                    END
                ) < 
                CASE 
                    WHEN rsh.CheckOutTime > DATEADD(DAY, 1, @EndDate) 
                        THEN DATEADD(DAY, 1, @EndDate)
                    ELSE rsh.CheckOutTime
                END
        ) d
    ),

    -- Đếm số lượt sử dụng theo loại phòng
    RoomTypeUsage AS (
        SELECT 
            RoomTypeID,
            COUNT(*) AS UsageCount
        FROM UsagePerDay
        GROUP BY RoomTypeID
    ),

    -- Tổng toàn bộ lượt sử dụng
    TotalUsage AS (
        SELECT COUNT(*) AS TotalCount
        FROM UsagePerDay
    )

    SELECT 
        rt.Name AS TenLoaiPhong,
        ISNULL(
            (rtu.UsageCount * 100.0) / tu.TotalCount,
            0
        ) AS PhanTramSuDung
    FROM RoomTypes rt
    LEFT JOIN RoomTypeUsage rtu
        ON rt.RoomTypeID = rtu.RoomTypeID
    CROSS JOIN TotalUsage tu
    ORDER BY PhanTramSuDung DESC;
END

EXEC sp_GetRoomTypeUsagePercentInMonth @Month = 4, @Year = 2026



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