<?

if ($_POST['songTeX']) {
	$input = $_POST['songTeX'];
	$input = preg_replace('/&#(\d+);/me',"chr(\\1)",$_POST['songTeX']); #decimal notation
	$input = preg_replace('/&#x([a-f0-9]+);/mei',"chr(0x\\1)",$input);  #hex notation
	$input = preg_replace('/<.*?>/','',$input); # All HTML tags
	
	$input = preg_replace('/[\r\n\s]*\\\\\\\\begin\{(\w+)\}(.*?)\\\\\\\\end\{\1\}[\r\n\s]*/mis','<p class="\1">\2</p>',$input);
	
	$input = preg_replace('/^(\\\\\\\\sings\{(.*?)\})?([^<>]*?)$/mi','<em>\2</em><span>\3</span>', $input);
	
	
	
	
}

?><!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">

<html lang="en">
<head>
	<meta http-equiv="content-type" content="text/html; charset=iso-8859-1">
	<meta name="author" content="Peter Müller - http://fumle.dk/">
	<title>Test</title>
	
	<style type="text/css">
.song {
	width: 400px;
	margin: 1em auto;
	border: 1px solid red;
}

.song .verse, .song .chorus {
	margin-bottom: 2em;
	border: 1px solid lime;
}

.song span {
	display: block;
	margin-left: 50px;
	border: 1px solid yellow;
}

.song em {
	float: left;
	font-weight: bold;
	border: 1px solid purple;
}

.song .comment span {
	margin-left: 0;
	color: #999;
}

.song .comment em {
	display: none;
}
	

	</style>
	
	<script type="text/javascript">

	</script>

</head>

<body>

<form action="parser.php" method="post">
<textarea name="songTeX" cols="60" rows="20"></textarea><br>
	<input type="submit">
</form>
	
	<div class="song">
<? echo $input ?>
	</div>

</body>

</html>