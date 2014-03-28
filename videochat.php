<?php

session_start();
$query = $_SERVER['QUERY_STRING'];
if ($query === 'GetRoom') {

    $roomName = unserialize($_SESSION['RoomName']);
    echo $roomName;
} else {

    $header = 'mainheader_html.php';
    $pagecontent = 'videochat_html.php';
    $pagetitle = 'UWRF Web-RTC';
    include('./master.php');
}
?>
