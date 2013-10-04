<?
require("templates/top.php");

if ($_GET['id']) {
	$authorId = addslashes($_GET['id']);
	authorView($authorId);
} else {
	echo 'Missing ID.';
}

require("templates/bottom.php");

?>
