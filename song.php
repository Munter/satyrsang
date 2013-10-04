<?
require("templates/top.php");

if ($_GET['id']) {
	$songId = addslashes($_GET['id']);
	songView($songId);
} else {
	echo 'Missing ID.';
}

require("templates/bottom.php");

?>
