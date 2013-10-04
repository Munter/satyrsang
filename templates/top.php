<?
//header('Content-Type: text/html; charset=utf-8');

ob_start();

require("views.php");
require("db.class.php");
$DB = new DB_class();
global $DB;

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">

<html lang="da" >
<head>
	<meta name="author" content="Peter Müller <munter@diku.dk>">
	<title>Satyr revyernes sangbog</title>
	<link rel="stylesheet" type="text/css" href="css/global.css">
</head>

<body>

<div id="site">
	
	<div id="navigation">
		<h1 id="logo"><a href=".">SATYR sangbogen</a></h1>
		
		<ul class="menu">
			<!--
			<li><a href="index.php">Forside</a></li>
			<li>
				<a href="satyr.php">Om SATYR</a>
				<ul class="sub">
					<li><a href="dikurevy.php">DIKU revyen</a></li>
					<li><a href="fysikrevy.php">FysikRevyen&trade;</a></li>
					<li><a href="matematikrevy.php">Matematik revyen</a></li>
					<li><a href="miolbiokemrevy.php">MolBioKem revyen</a></li>
				</ul>
			</li>
			-->
		</ul>
		<hr>
		<h2>Sange</h2>
		<ul class="menu">
			<!--
			<li><a href="#">Alfabetisk</a></li>
			<li><a href="#">Kronologisk</a></li>
			-->
			<li><a href="revuelist.php">Revyregister</a></li>
			<!--
			<li><a href="#">Forfatterregister</a></li>
			<li><a href="#">Komponistregister</a></li>
			<li><a href="#">Melodiregister</a></li>
			-->
		</ul>
	</div>
	
	<div id="content">