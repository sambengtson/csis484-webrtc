<?php

session_start();
$query = $_SERVER['QUERY_STRING'];
if ($query === 'SetRoom') {
    
    $roomName = $_POST['roomNameTxt'];
    $_SESSION['RoomName'] = serialize($roomName);
    
    echo '';
    
} else {
    $header = 'mainheader_html.php';
    $pagecontent = 'index_html.php';
    $pagetitle = 'UWRF Web-RTC';
    include('./master.php');
}
?>