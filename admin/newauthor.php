<?

require("../templates/db.class.php");
$DB = new DB_class();
global $DB;

if ($_POST['newAuthor']) {
	$newAuthor = addslashes($_POST['newAuthor']);
	$result = $DB->query("
		select authorId from authors where authorName = '$newAuthor'
	");
	if ($row = $DB->fetch_array($result)) {
		// Author allready exists
		echo '<p>Author allready exists</p>';
	} else {
		$DB->query("
			insert into authors
			values ('', '$newAuthor')
		");
		echo '<p>Author added</p>';
	}
}

?>

<a href="index.php">Menu</a>

<form action="newauthor.php" method="post">
	<input name="newAuthor" id="newAuthor">
	<input type="submit">
</form>

<script type="text/javascript">
	document.getElementById('newAuthor').focus();
</script>