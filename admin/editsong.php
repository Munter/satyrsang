<?

require("../templates/db.class.php");
$DB = new DB_class();
global $DB;

if ($_POST['title']) {
	$songId = (int) $_POST['songId'];
	$title = addslashes($_POST['title']);
	$year = (int) $_POST['year'];
	$originalMelody = addslashes($_POST['originalMelody']);
	$composer = addslashes($_POST['composer']);
	$youtube = addslashes($_POST['youtube']);
	$instructions = addslashes($_POST['instructions']);
	$revueId = (int) $_POST['revueId'];
	$TeX = addslashes($_POST['TeX']);
	$number = (int) $_POST['number'];
	
	
	$text = $_POST['TeX'];
	$text = preg_replace('/&#(\d+);/me',"chr(\\1)",$text); #decimal notation
	$text = preg_replace('/&#x([a-f0-9]+);/mei',"chr(0x\\1)",$text);  #hex notation
	$text = preg_replace('/<.*?>/','',$text); # All HTML tags
	
	$text = preg_replace('/[\r\n\s]*\\\\\\\\begin\{(\w+)\}(.*?)\\\\\\\\end\{\1\}[\r\n\s]*/mis','<p class="\1">\2</p>',$text);
	$text = preg_replace('/^(\\\\\\\\sings\{(.*?)\})?([^<>]*?)$/mi','<em>\2</em><span>\3</span>', $text);
	$text = addslashes($text);
	
	if ($songId ) {
		$DB->query("
			update songs
			set
				title = '$title',
				year = '$year',
				originalMelody = '$originalMelody',
				composer = '$composer',
				revueId = '$revueId',
				number = '$number',
				youtube = '$youtube',
				text = '$text',
				TeX = '$TeX',
				instructions = '$instructions'
			where
				songId = '$songId'
		");
	} else {
		$DB->query("
			insert into songs
			values (
				'',
				'$title',
				'$year',
				'$originalMelody',
				'$composer',
				'$revueId',
				'$number',
				'$youtube',
				'$text',
				'$TeX',
				'$instructions'
			)
		");
		$songId = $DB->insert_id();
	}
	
	/* Redirect to a different page in the current directory that was requested */
	$host  = $_SERVER['HTTP_HOST'];
	$uri   = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
	$extra = '../song.php?id='.$songId;
	header("Location: http://$host$uri/$extra");
	exit;
}
	
	


if ($_GET['id']) {
	$songId = (int) $_GET['id'];
	$row = $DB->fetch_array($DB->query("
		select
			songId,
			title,
			year,
			originalMelody,
			composer,
			youtube,
			TeX,
			number,
			instructions,
			revues.revueId,
			revueName
		from songs
			left join revues using(revueId)
		where songId = $songId
	"));
	$row = array_map(stripslashes, $row);
	
	extract($row);
	
	$authors = $DB->query("
		select
			authors.authorId,
			authorName
		from songAuthorLink
			join authors using(authorId)
		where songId = $songId
	");
	
}
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">

<html lang="en">
<head>
	<title>Edit song</title>
	
	<style type="text/css">
label {
	display: block;
	float: left;
	width: 200px;
	text-align: right;
	margin-right: 20px;
}

p {
	overflow: hidden;
}

textarea {
	width: 400px;
	height: 300px;
}
	</style>
	
	<script type="text/javascript" src="js/autocomplete.js"></script>
	<script type="text/javascript" src="js/Events.js"></script>
	<script type="text/javascript">

	</script>
</head>

<body>

<form action="editsong.php?id=<? echo $songId ?>" method="post">
	<input type="hidden" name="songId" value="<? echo $songId ?>">
	<p>
		<label for="title">title</label>
		<input type="text" name="title" id="title" value="<? echo $title ?>">
	</p>
	
	<p>
		<label for="revueId">revueId</label>
		<select name="revueId" id="revueId">
			<option value="1" <? if($revueId == 1) echo 'selected' ?>>DIKU revyen</option>
			<option value="2" <? if($revueId == 2) echo 'selected' ?>>FysikRevyen&trade;</option>
			<option value="3" <? if($revueId == 3) echo 'selected' ?>>Matematikrevyen</option>
			<option value="4" <? if($revueId == 4) echo 'selected' ?>>MolBioKemrevyen</option>
			<option value="5" <? if($revueId == 5) echo 'selected' ?>>SATYR revyen</option>
		</select>
	</p>
	
	<p>
		<label for="year">year</label>
		<input type="text" name="year" id="year" value="<? echo $year ?>">
	</p>
	
	<p>
		<label for="authorInput">Forfatter:</label>
		<input type="text" name="authorInput" id="authorInput" value="">
		
<?
	$i = 0;
	while ($row = $DB->fetch_array($authors)) {
		echo '<br><span><input type="hidden" name="authors['.$i++.']" value="'. $row['authorId'] .'">'. $row['authorName'] .'</span>';
	}
?>
	</p>
	
	<p>
		<label for="number">number</label>
		<input type="text" name="number" id="number" value="<? echo $number ?>">
	</p>
	<p>
		<label for="originalMelody">originalMelody</label>
		<input type="text" name="originalMelody" id="originalMelody" value="<? echo $originalMelody ?>">
	</p>
	<p>
		<label for="composer">composer</label>
		<input type="text" name="composer" id="composer" value="<? echo $composer ?>">
	</p>
	<p>
		<label for="instructions">instructions</label>
		<input type="text" name="instructions" id="instructions" value="<? echo $instructions ?>">
	</p>
	<p>
		<label for="youtube">youtube</label>
		<input type="text" name="youtube" id="youtube" value="<? echo $youtube ?>">
	</p>
	<p>
		<label for="TeX">TeX</label>
		<textarea name="TeX" id="TeX"><? echo $TeX ?></textarea>
	</p>
	
	<input type="submit">
</form>
</body>

</html>

