<?
/* Shows a list of revues */
function revueList($intRevueId) {
	global $DB;
	
	$result = $DB->query("
		select
			revueId,
			revueName
		from revues
	");
	
	echo '<ul id="revueList">';
	while ($row = $DB->fetch_array($result)) {
?>
		<li><a href="<? echo $_GLOBAL['SCRIPT_NAME'] ?>?revueid=<? echo $row['revueId'] ?>" class="<? if ($intRevueId == $row['revueId']) echo 'active' ?>"><? echo $row['revueName'] ?></a></li>
<?
	}
	echo '</ul>';
}

/* Shows all years for a specific revue */
function revueYearList($intRevueId) {
	global $DB;
	
	$result = $DB->query("
		select
			revueName,
			songs.songId,
			year,
			title,
			composer,
			originalMelody,
			authors.authorId,
			authorName
		from revues
			join songs using(revueId)
			left join songAuthorLink using(songId)
			left join authors using(authorId)
		where revues.revueId = $intRevueId
		group by songs.songId
		order by year desc, number
	");
	
	$yearComparison = 0;
	while ($row = $DB->fetch_array($result)) {
		extract($row);
		if ($yearComparison != $year) {
			if ($yearComparison != 0) {
?>
				</tbody>
			</table>
<?
			}
			$yearComparison = $year;
			$zebra = true;
?>
			<h3><? echo $revueName.' '.$year ?></h3>
			<table>
				<thead>
					<tr>
						<th>Sang</th>
						<th>Forfatter</th>
						<th>Melodi</th>
						<th>Komponist</th>
					</tr>
				</thead>
				<tbody>
<?
		}
?>
					<tr class="<? echo ($zebra = !$zebra) ? 'odd' : '' ?>">
						<td><a href="song.php?id=<? echo $songId ?>"><? echo $title ?></a></td>
						<td><a href="author.php?id=<? echo $authorId ?>"><? echo $authorName ?></a></td>
						<td><? echo $originalMelody ?></td>
						<td><? echo $composer ?></td>
					</tr>
<?
	} // end while
	if ($yearComparison) {
?>
		</tbody>
	</table>
<?
	}
}

/* Shows song details */
function songView($intSongId) {
	global $DB;
	extract($DB->fetch_array($DB->query("
		select
			title,
			year,
			originalMelody,
			composer,
			youtube,
			text,
			instructions,
			revues.revueId,
			revueName
		from songs
			left join revues using(revueId)
		where songId = $intSongId
	")));
	
	$result = $DB->query("
		select
			authors.authorId,
			authorName
		from songAuthorLink 
			left join authors using(authorId)
		where songId = $intSongId
	");
	
	$authors = array();
	while ($row = $DB->fetch_array($result)) {
		$link = '<a href="author.php?id='.$row['authorId'].'">'.$row['authorName'].'</a>';
		array_push($authors, $link);
	}
?>
	<a href="admin/editsong.php?id=<? echo $intSongId ?>">Edit</a>
	<h2><? echo $title ?></h2>
	
	<div class="meta">
		<p><label>Revy:</label><a href="revuelist.php?revueid=<?echo $revueId ?>"><? echo $revueName ?></a></p>
		<p><label>År:</label><? echo $year ?></p>
		<p><label>Forfatter:</label><? echo implode(', ', $authors) ?></p>
		<p><label>Komponist:</label><? echo $composer ?></p>
		<p><label>Originaltitel:</label><? echo $originalMelody ?></p>
		<p class="instructions"><? echo $instructions ?></p>
		<? if ($youtube) {?>
		<object type="application/x-shockwave-flash" data="http://www.youtube.com/v/<? echo $youtube ?>&border=0">
			<param name="movie" value="http://www.youtube.com/v/<? echo $youtube ?>&border=0" />
			<param name="quality" value="high" />
			<param name="menu" />
			<param value="transparent" name="wmode"/>
			<p class="youtube">Her ville der have været en youtube video med sangen hvis du havede aktiveret flash.</p>
		</object>
		<?}?>
	</div>
	
	<div class="song">
		<? echo $text ?>
	</div>
<?
}

/* Shows author details */
function authorView($intAuthorId) {
	global $DB;

	extract($DB->fetch_array($DB->query("
		select
			authorName
		from authors
		where authorId = $intAuthorId
	")));
?>
	<h2><? echo $authorName ?></h2>
<?	
	$result = $DB->query("
		select
			year,
			songs.revueId,
			revueName,
			songs.songId,
			title
		from songAuthorLink 
			left join authors using(authorId)
			left join songs on songAuthorLink.songId = songs.songId
			left join revues using(revueId)
		where songAuthorLink.authorId = $intAuthorId
		order by year desc, revueId
	");
	
	$compareRevue = '';
	$compareYear = '';
	
	echo '<ul>';
	while ($row = $DB->fetch_array($result)) {
		extract($row);
		if (($compareRevue != $revueId) || ($compareYear != $year)) {
			$compareRevue = $revueId;
			$compareYear = $year;
			echo '</ul>';
			echo '<h3>'.$revueName.' '.$year.'</h3>';
			echo '<ul>';
		}
		?>
		<li><a href="song.php?id=<? echo $songId ?>"><? echo $title ?></a></li>
		<?
	}
	echo '</ul>';
}
?>