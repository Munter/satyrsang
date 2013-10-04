<?
class DB_class {
	/* default seetings, used if none is given at object creation time */

	var $username = "";
	var $password = "";
	var $hostname = "localhost";
	var $database = "satyrsang";
	var $dbcon = 0;
	var $query_test = 0;
	var $temp = 0;
	/* class constructer, initialize the connection */
	function DB_class($username = "",$password = "",$hostname = "",$database = "") {
		if (!empty($username)) {
			$this->username = $username;
		}
		if (!empty($password)) {
			$this->password = $password;
		}
		if (!empty($hostname)) {
			$this->hostname = $hostname;
		}
		if (!empty($database)) {
			$this->database = $database;
		}
		$this->connect();
	}
	/* some self explaining functions */
	function connect() {
		$this->dbcon = mysql_connect($this->hostname,$this->username,$this->password);
		mysql_select_db($this->database,$this->dbcon);
	}
	function query($query) {
		if ($query != "") {
			$this->query_test = mysql_query($query,$this->dbcon);
		} else {
			echo "Query is empty";
			exit;
		}
		if (!$this->query_test) {
			echo "error in SQL query\n<br>".htmlspecialchars($query)."<br><br><pre>".mysql_error()."</pre>";
			exit;
		}
		return $this->query_test;
	}
	function fetch_row($result) {
		$this->temp = mysql_fetch_row($result);
		return $this->temp;
	}
	function fetch_array($result) {
		$this->temp = mysql_fetch_assoc($result);
		return $this->temp;
	}
	function close() {
		mysql_close($this->dbcon);
	}
	function free($result) {
		mysql_free_result($result);
	}
	/* query the database an return an array that whould be similar to the first one returned by mysql_fetch_array, this function will only return the first row of query result */
	function query_array($query) {
		$this->temp = $this->query($query);
		if (mysql_num_rows($this->temp) == "0") {
			return 0;
		}
                return mysql_fetch_array($this->temp);
	}
	/* query the database and return 1 field, can be used for simple queris which will only return 1 row and 1 column. */
    function query_single($query) {
            // makes a query and returns an array
		$this->temp = $this->query($query);
		list($this->temp) = mysql_fetch_row($this->temp); 
                return $this->temp;
	}
	function insert_id() {
		return mysql_insert_id($this->dbcon);
	}
	function num_rows($result) {
		return mysql_num_rows($result);
	}
	function fetch_result($result, $int) {
		return mysql_result($result, $int);
	}
	
	
}
?>
