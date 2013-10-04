<?
require("templates/top.php");

$authorId = (int) $_GET['id'];

if ($authorId) {
	authorView($authorId);
} else {
	echo 'Missing ID.';
}

require("templates/bottom.php");

?>
