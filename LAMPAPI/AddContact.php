<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$input = json_decode(file_get_contents('php://input'), true);

try {
    // Claude.ai used in development of this code
    // Database connection - USE SAME VALUES AS getUsers.php
    $servername = "localhost";
    $username = "your_db_username";
    $password = "your_db_password";
    $dbname = "COP4331";

    $conn = new mysqli("localhost", "andres", "sharkboy4878", "COP4331");

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    // Validate required fields
    $required_fields = ['UserID', 'FirstName', 'LastName', 'Email', 'Phone'];
    foreach ($required_fields as $field) {
        if (!isset($input[$field]) || trim($input[$field]) === '') {
            throw new Exception("$field is required");
        }
    }

    // Validate UserID exists
    $check_user_sql = "SELECT ID FROM Users WHERE ID = ?";
    $stmt = $conn->prepare($check_user_sql);
    $stmt->bind_param("i", $input['UserID']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Invalid user ID");
    }

    // Validate email format
    if (!filter_var($input['Email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid email format',
            'field' => 'Email'
        ]);
        exit;
    }

    // Insert contact
    $sql = "INSERT INTO Contacts (UserID, FirstName, LastName, Email, Phone) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("issss", 
        $input['UserID'],
        trim($input['FirstName']),
        trim($input['LastName']),
        trim($input['Email']),
        trim($input['Phone'])
    );

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Contact added successfully',
            'contactId' => $conn->insert_id
        ]);
    } else {
        throw new Exception("Failed to add contact: " . $stmt->error);
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

if (isset($conn)) {
    $conn->close();
}
?>