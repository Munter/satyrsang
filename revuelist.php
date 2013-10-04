<?
require("templates/top.php");

$revueId = (int) $_GET['revueid'];

revueList($revueId);

if ($revueId) {
	revueYearList($revueId);
}

require("templates/bottom.php");

?>
